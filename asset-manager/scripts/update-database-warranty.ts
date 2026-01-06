import { config } from "dotenv";
import { resolve } from "path";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { query, closePool } from "../lib/db/postgres";

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  config({ path: envPath });
} else {
  console.warn("  Warning: .env.local file not found. Trying to load from environment...");
  config(); // Try to load from default .env or environment
}

// Check for PostgreSQL connection parameters
const postgresHost = process.env.POSTGRES_HOST;
const postgresPassword = process.env.POSTGRES_PASSWORD;
const postgresUrl = process.env.POSTGRES_URL;

if (!postgresHost || !postgresPassword) {
  if (!postgresUrl) {
    console.error("\n❌ Error: PostgreSQL connection parameters are not set");
    console.error("\nPlease set the following in your .env.local file:");
    console.error("  - POSTGRES_HOST");
    console.error("  - POSTGRES_USER (optional, defaults to 'postgres')");
    console.error("  - POSTGRES_DATABASE (optional, defaults to 'postgres')");
    console.error("  - POSTGRES_PASSWORD");
    console.error("\nOR set POSTGRES_URL as an alternative");
    console.error("\nYou can find your connection details in Supabase Dashboard:");
    console.error("  https://supabase.com/dashboard/project/_/settings/database");
    console.error("\nMake sure your .env.local file exists in the project root.");
    process.exit(1);
  }
}

async function updateDatabase() {
  try {
    console.log("📦 Reading warranty fields migration file...");
    const migrationPath = join(process.cwd(), "database", "migration-add-warranty-fields.sql");
    
    if (!existsSync(migrationPath)) {
      console.error(`\n❌ Error: Migration file not found at ${migrationPath}`);
      process.exit(1);
    }
    
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    console.log("🔌 Connecting to database...");
    
    // Show connection info (without password)
    const host = process.env.POSTGRES_HOST || "N/A";
    const user = process.env.POSTGRES_USER || "postgres";
    const database = process.env.POSTGRES_DATABASE || "postgres";
    const port = process.env.POSTGRES_PORT || "5432";
    console.log(`   Host: ${host}`);
    console.log(`   Port: ${port}`);
    console.log(`   User: ${user}`);
    console.log(`   Database: ${database}`);
    console.log("🚀 Executing warranty fields migration...\n");

    try {
      // Execute the entire SQL file at once
      await query(migrationSQL);
      
      console.log("✅ Warranty fields migration executed successfully!");
      console.log("\nAdded to assets table:");
      console.log("  - warranty_period_months column");
      console.log("  - warranty_expiry_date column");
      console.log("  - warranty_notes column");
      console.log("  - warranty_registered_at column");
      console.log("  - warranty_registered_by column");
      console.log("  - Index on warranty_expiry_date");
      console.log("  - RLS policy for warranty registration");
      console.log("\n✅ Database update complete!");
      console.log("Warranty registration data will now be persisted to the database.\n");
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      
      // Check if it's a "already exists" error (which is okay for idempotency)
      if (
        errorMessage.includes("already exists") ||
        errorMessage.includes("duplicate key") ||
        errorMessage.includes("relation already exists") ||
        errorMessage.includes("policy already exists") ||
        errorMessage.includes("column") && errorMessage.includes("already exists")
      ) {
        console.log("⚠️  Some columns/policies already exist in the database.");
        console.log("This is normal if you've run the migration before.");
        console.log("\n✅ Database update complete!");
        console.log("Warranty registration data is available.\n");
      } else {
        console.error("\n❌ Error executing database migration:");
        console.error(errorMessage);
        console.error("\nTroubleshooting:");
        console.error("  1. Verify POSTGRES_HOST, POSTGRES_USER, POSTGRES_DATABASE, POSTGRES_PASSWORD are correct");
        console.error("  2. For Supabase, try using port 6543 (connection pooler) instead of 5432");
        console.error("     Add to .env.local: POSTGRES_PORT=6543");
        console.error("  3. Check if your IP is allowed in Supabase Dashboard > Settings > Database");
        console.error("  4. Verify your database password is correct");
        console.error("\nConnection details:");
        console.error(`  Host: ${host}`);
        console.error(`  Port: ${port}`);
        console.error(`  User: ${user}`);
        console.error(`  Database: ${database}`);
        process.exit(1);
      }
    }
  } catch (error: any) {
    console.error("\n❌ Fatal error updating database:");
    console.error(error.message || String(error));
    process.exit(1);
  } finally {
    await closePool();
  }
}

updateDatabase();

