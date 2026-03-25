import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const databaseUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;

if (!databaseUrl) {
  console.error("Error: DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = neon(databaseUrl);

async function setup() {
  console.log("Initializing database schema...");
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS verifications (
        id SERIAL PRIMARY KEY,
        claim TEXT NOT NULL,
        verdict TEXT NOT NULL,
        confidence INT NOT NULL,
        reason TEXT NOT NULL,
        sources JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log("✅ Table 'verifications' created or already exists.");
  } catch (error) {
    console.error("❌ Database setup failed:", error);
  }
}

setup();
