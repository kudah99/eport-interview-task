/**
 * Direct PostgreSQL connection utility
 * 
 * This utility provides direct PostgreSQL access using individual connection parameters.
 * Use this for operations that require direct database access, such as:
 * - Running migrations
 * - Admin operations that bypass RLS
 * - Database management scripts
 * 
 * Note: For most operations, use the Supabase client from @/lib/supabase/server
 * which handles authentication and RLS policies automatically.
 */

import { Pool, type PoolConfig } from "pg";

let pool: Pool | null = null;

/**
 * Get a PostgreSQL connection pool
 * Creates a singleton pool instance
 */
export function getPostgresPool(): Pool {
  if (!pool) {
    // Support both individual parameters and connection URL
    const postgresUrl = process.env.POSTGRES_URL;
    const postgresHost = process.env.POSTGRES_HOST;
    const postgresUser = process.env.POSTGRES_USER || "postgres";
    const postgresDatabase = process.env.POSTGRES_DATABASE || "postgres";
    const postgresPassword = process.env.POSTGRES_PASSWORD;

    let poolConfig: PoolConfig;

    // Prefer individual parameters over URL
    if (postgresHost && postgresPassword) {
      const postgresPort = process.env.POSTGRES_PORT 
        ? parseInt(process.env.POSTGRES_PORT, 10) 
        : 5432; // Default PostgreSQL port (use 6543 for Supabase pooler)
      
      poolConfig = {
        host: postgresHost,
        user: postgresUser,
        database: postgresDatabase,
        password: postgresPassword,
        port: postgresPort,
        ssl: {
          rejectUnauthorized: false, // Required for Supabase connections
        },
        // Connection pool settings
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 10000, // Increased to 10 seconds for Supabase connections
      };
    } else if (postgresUrl) {
      // Fallback to connection URL if individual params not provided
      poolConfig = {
        connectionString: postgresUrl,
        // Connection pool settings
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      };
    } else {
      throw new Error(
        "PostgreSQL connection parameters are not set. " +
        "Please set either:\n" +
        "  - POSTGRES_HOST, POSTGRES_USER, POSTGRES_DATABASE, POSTGRES_PASSWORD\n" +
        "  - OR POSTGRES_URL\n\n" +
        "Get your connection details from: https://supabase.com/dashboard/project/_/settings/database"
      );
    }

    pool = new Pool(poolConfig);

    // Handle pool errors
    pool.on("error", (err) => {
      console.error("Unexpected error on idle PostgreSQL client", err);
    });
  }

  return pool;
}

/**
 * Execute a SQL query directly against PostgreSQL
 * 
 * @param query - SQL query string
 * @param params - Query parameters (for parameterized queries)
 * @returns Query result
 * 
 * @example
 * ```ts
 * const result = await query('SELECT * FROM assets WHERE id = $1', [assetId]);
 * ```
 */
export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number }> {
  const pool = getPostgresPool();
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  
  // Log slow queries (optional, useful for debugging)
  if (duration > 1000) {
    console.warn(`Slow query detected (${duration}ms):`, text);
  }
  
  return {
    rows: result.rows,
    rowCount: result.rowCount ?? 0,
  };
}

/**
 * Close the PostgreSQL connection pool
 * Call this when shutting down the application
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

