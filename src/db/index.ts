import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  max: 5,                    // pool up to 5 connections
  idle_timeout: 20,          // close idle connections after 20s
  connect_timeout: 10,       // fail fast on connect
  max_lifetime: 60 * 5,      // recycle connections every 5 min (Railway proxy compat)
  prepare: false,            // disable prepared statements (required for PgBouncer/proxies)
});

export const db = drizzle(client, { schema });
