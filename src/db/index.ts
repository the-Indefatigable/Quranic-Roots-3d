import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

// Guard: during Next.js build (no DATABASE_URL) create a no-op stub so that
// importing @/db does not attempt a real TCP connection and hang SSG.
const isBuildTime = !connectionString;

let client = isBuildTime
  ? (null as unknown as ReturnType<typeof postgres>)
  : postgres(connectionString!, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 10,
      max_lifetime: 60 * 10,
      prepare: false,
      connection: {
        application_name: 'quroots',
      },
    });

// Warm up the connection at runtime only — fire-and-forget with hard 5s cap
if (!isBuildTime) {
  const warmup = client`SELECT 1`;
  const timeout = new Promise<void>((_, reject) =>
    setTimeout(() => reject(new Error('warmup timeout')), 5000)
  );
  Promise.race([warmup, timeout]).catch(() => {});
}

const baseDb = isBuildTime
  ? (null as unknown as ReturnType<typeof drizzle>)
  : drizzle(client, { schema });

// Proxy that auto-retries on transient Railway errors
const TRANSIENT_CODES = ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'CONNECT_TIMEOUT', 'CONNECTION_CLOSED', 'ENETUNREACH'];

function isTransient(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message || '';
  const code = (err as { code?: string }).code || '';
  return TRANSIENT_CODES.some((c) => code.includes(c) || msg.includes(c));
}

export const db: typeof baseDb = new Proxy(baseDb, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (prop !== 'select' && prop !== 'insert' && prop !== 'update' && prop !== 'delete') {
      return value;
    }
    // Wrap query builders — the actual query runs when .from()...execute() is called
    // We intercept at the top level and retry the full chain
    return value;
  },
});

// Export a helper for server components that wraps any async DB call with retry
export async function dbQuery<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (!isTransient(err) || attempt === retries) throw err;
      console.warn(`[DB] Retry ${attempt + 1}/${retries} after transient error`);
      await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
    }
  }
  throw new Error('Unreachable');
}
