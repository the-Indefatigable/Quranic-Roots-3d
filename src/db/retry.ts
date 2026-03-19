/**
 * Retry wrapper for DB queries — handles Railway cold starts and transient connection resets.
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 500): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const isTransient =
        err instanceof Error &&
        (err.message.includes('ECONNRESET') ||
          err.message.includes('ECONNREFUSED') ||
          err.message.includes('connection terminated') ||
          err.message.includes('Connection terminated') ||
          err.message.includes('timeout'));

      if (!isTransient || attempt === retries) throw err;

      console.warn(`[DB] Transient error, retrying (${attempt + 1}/${retries})...`);
      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
  throw new Error('Unreachable');
}
