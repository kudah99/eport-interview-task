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

async function setupDatabase() {
  try {
    console.log("📦 Reading database schema file...");
    const schemaPath = join(process.cwd(), "database", "schema.sql");
    const schemaSQL = readFileSync(schemaPath, "utf-8");

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
    console.log("🚀 Executing schema...\n");

    try {
      // Execute the entire SQL file at once
      // PostgreSQL supports multiple statements separated by semicolons
      await query(schemaSQL);
      
      console.log("✅ Database schema executed successfully!");
      console.log("\nCreated:");
      console.log("  - asset_categories table");
      console.log("  - departments table");
      console.log("  - assets table");
      console.log("  - Row Level Security policies");
      console.log("  - Indexes for performance");
      console.log("\n✅ Database setup complete!");
      console.log("You can now use the application.\n");
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      
      // Check if it's a "already exists" error (which is okay for idempotency)
      if (
        errorMessage.includes("already exists") ||
        errorMessage.includes("duplicate key") ||
        errorMessage.includes("relation already exists") ||
        errorMessage.includes("policy already exists")
      ) {
        console.log("⚠️  Some objects already exist in the database.");
        console.log("This is normal if you've run the setup before.");
        console.log("\n✅ Database setup complete!");
        console.log("You can now use the application.\n");
      } else {
        console.error("\n❌ Error executing database schema:");
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
    console.error("\n❌ Fatal error setting up database:");
    console.error(error.message || String(error));
    process.exit(1);
  } finally {
    await closePool();
  }
}


setupDatabase();

