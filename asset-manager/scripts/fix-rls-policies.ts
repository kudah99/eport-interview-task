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
  console.warn("⚠️  Warning: .env.local file not found. Trying to load from environment...");
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

async function fixRLSPolicies() {
  try {
    console.log("📦 Reading RLS policies fix file...");
    const fixPath = join(process.cwd(), "database", "fix-rls-policies.sql");
    const fixSQL = readFileSync(fixPath, "utf-8");

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
    console.log("🚀 Fixing RLS policies...\n");

    try {
      // Execute the SQL file
      await query(fixSQL);
      
      console.log("✅ RLS policies fixed successfully!");
      console.log("\nUpdated policies:");
      console.log("  - asset_categories: Admins can manage categories");
      console.log("  - departments: Admins can manage departments");
      console.log("  - assets: Admins can manage assets");
      console.log("\n✅ RLS policies fix complete!");
      console.log("The 'permission denied for table users' error should now be resolved.\n");
    } catch (error: any) {
      const errorMessage = error.message || String(error);
      
      // Check if it's a "does not exist" error (which is okay if policies don't exist yet)
      if (
        errorMessage.includes("does not exist") ||
        errorMessage.includes("not found")
      ) {
        console.log("⚠️  Some policies may not exist yet.");
        console.log("This is normal if you haven't run the database setup.");
        console.log("\nTrying to create policies directly...\n");
        
        // Try to create policies directly
        const createPoliciesSQL = `
-- RLS Policies for asset_categories
DROP POLICY IF EXISTS "Admins can manage categories" ON asset_categories;
CREATE POLICY "Admins can manage categories"
  ON asset_categories
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- RLS Policies for departments
DROP POLICY IF EXISTS "Admins can manage departments" ON departments;
CREATE POLICY "Admins can manage departments"
  ON departments
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- RLS Policies for assets
DROP POLICY IF EXISTS "Admins can manage assets" ON assets;
CREATE POLICY "Admins can manage assets"
  ON assets
  FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );
        `;
        
        try {
          await query(createPoliciesSQL);
          console.log("✅ RLS policies created successfully!");
          console.log("\n✅ RLS policies fix complete!");
          console.log("The 'permission denied for table users' error should now be resolved.\n");
        } catch (createError: any) {
          console.error("\n❌ Error creating policies:");
          console.error(createError.message || String(createError));
          console.error("\nTroubleshooting:");
          console.error("  1. Make sure the tables exist (run: npm run setup-database)");
          console.error("  2. Verify POSTGRES_HOST, POSTGRES_USER, POSTGRES_DATABASE, POSTGRES_PASSWORD are correct");
          console.error("  3. For Supabase, try using port 6543 (connection pooler) instead of 5432");
          console.error("     Add to .env.local: POSTGRES_PORT=6543");
          console.error("  4. Check if your IP is allowed in Supabase Dashboard > Settings > Database");
          process.exit(1);
        }
      } else {
        console.error("\n❌ Error fixing RLS policies:");
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
    console.error("\n❌ Fatal error fixing RLS policies:");
    console.error(error.message || String(error));
    process.exit(1);
  } finally {
    await closePool();
  }
}

fixRLSPolicies();

