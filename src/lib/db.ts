import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;

if (!databaseUrl) {
  console.warn('DATABASE_URL is not defined in environment variables.');
}

export const sql = databaseUrl ? neon(databaseUrl) : (null as any);
