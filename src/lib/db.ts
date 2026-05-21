import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Use discrete parameters option if available to prevent URL parsing errors with special chars (like '@') in password.
// Otherwise fall back to DATABASE_URL.
let poolConfig: any = {};

if (process.env.PGHOST || process.env.PGUSER || process.env.PGPASSWORD || process.env.PGDATABASE) {
  poolConfig = {
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'postgres',
  };
} else if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
  };
}

let pool: pg.Pool | null = null;
let isDbConnected = false;

/**
 * Initialize PostgreSQL connection pool lazily and gracefully.
 * This prevents the application from crashing on startup if PostgreSQL is not available/reachable.
 */
export function getDbPool(): pg.Pool | null {
  if (pool) return pool;

  // Check if password or host is defined to avoid running default connections that will fail and print errors
  const hasConfig = !!(process.env.DATABASE_URL || process.env.PGHOST || process.env.PGPASSWORD);
  
  if (!hasConfig) {
    console.log("ℹ️ PostgreSQL environment variables not fully configured. Using mock/in-memory storage fallback.");
    return null;
  }

  try {
    pool = new Pool({
      ...poolConfig,
      ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 5000, // Fail fast (5s timeout)
    });

    // Handle background pool errors
    pool.on('error', (err) => {
      console.warn('⚡ PostgreSQL Pool Error:', err.message);
    });

    return pool;
  } catch (err: any) {
    console.warn('❌ Failed to initialize PostgreSQL Pool:', err.message);
    pool = null;
    return null;
  }
}

/**
 * Test connections and initialize table structures
 */
export async function initializeDatabase() {
  const activePool = getDbPool();
  if (!activePool) {
    console.log("⚠️ Database initialization skipped. Defaulting to standard operational mode.");
    return;
  }

  try {
    const client = await activePool.connect();
    console.log("✅ Successfully connected to PostgreSQL Database!");
    isDbConnected = true;

    // Create News cache table
    await client.query(`
      CREATE TABLE IF NOT EXISTS news (
        id VARCHAR(100) PRIMARY KEY,
        title TEXT UNIQUE,
        source VARCHAR(100),
        source_type VARCHAR(100),
        category VARCHAR(50),
        url TEXT,
        summary TEXT,
        date VARCHAR(100),
        pub_date_str TEXT,
        impact_type VARCHAR(50),
        impact_score INTEGER,
        impacted_sectors JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create Trading Plans / Market Analysis Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trading_plans (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(50) NOT NULL,
        last_price NUMERIC,
        volatility VARCHAR(50),
        score INTEGER,
        pivot NUMERIC,
        target_main NUMERIC,
        stop_loss NUMERIC,
        tranche1_entry NUMERIC,
        tranche2_breakout NUMERIC,
        tranche3_after_resistance NUMERIC,
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `);

    client.release();
    console.log("🎉 PostgreSQL Database Tables validated & initialized successfully.");
  } catch (err: any) {
    console.warn("❌ Could not connect or run migrations on PostgreSQL server:", err.message);
    console.warn("   Make sure your PostgreSQL server is active, credentials are correct, and accessible from this runtime.");
    isDbConnected = false;
  }
}

/**
 * Check if PostgreSQL is actively connected
 */
export function checkDbStatus(): boolean {
  return isDbConnected;
}

/**
 * Save multiple news items into PostgreSQL cache
 */
export async function saveNewsToDb(newsItems: any[]) {
  const activePool = getDbPool();
  if (!activePool || !isDbConnected) return;

  try {
    const client = await activePool.connect();
    for (const item of newsItems) {
      try {
        await client.query(
          `INSERT INTO news (
            id, title, source, source_type, category, url, summary, date, pub_date_str, impact_type, impact_score, impacted_sectors
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
          ON CONFLICT (title) DO UPDATE SET
            summary = EXCLUDED.summary,
            impact_score = EXCLUDED.impact_score,
            impact_type = EXCLUDED.impact_type`,
          [
            item.id,
            item.title,
            item.source,
            item.sourceType,
            item.category,
            item.url,
            item.summary,
            item.date,
            item.pubDateStr,
            item.impactType,
            item.impactScore,
            JSON.stringify(item.impactedSectors || [])
          ]
        );
      } catch (innerErr) {
        // Suppress on conflicts or parse errors for individual items
      }
    }
    client.release();
  } catch (err: any) {
    console.warn("⚠️ Failed to write news to PostgreSQL:", err.message);
  }
}

/**
 * Get news items cached in PostgreSQL database
 */
export async function getNewsFromDb(limit: number = 80): Promise<any[] | null> {
  const activePool = getDbPool();
  if (!activePool || !isDbConnected) return null;

  try {
    const { rows } = await activePool.query(
      `SELECT * FROM news ORDER BY created_at DESC, pub_date_str DESC LIMIT $1`,
      [limit]
    );
    
    return rows.map(r => {
      let sourceType = r.source_type;
      if (r.source === 'IDX' || r.source === 'KSEI') {
        sourceType = 'Announcement';
      }
      return {
        id: r.id,
        title: r.title,
        source: r.source,
        sourceType: sourceType,
        category: r.category,
        url: r.url,
        summary: r.summary,
        date: r.date,
        pubDateStr: r.pub_date_str,
        impactType: r.impact_type,
        impactScore: r.impact_score,
        impactedSectors: typeof r.impacted_sectors === 'string' ? JSON.parse(r.impacted_sectors) : r.impacted_sectors
      };
    });
  } catch (err: any) {
    console.warn("⚠️ Failed to read news from PostgreSQL, falling back to real-time parser:", err.message);
    return null;
  }
}

/**
 * Save Trading Plan / Analysis Result
 */
export async function saveTradingPlanToDb(plan: any) {
  const activePool = getDbPool();
  if (!activePool || !isDbConnected) return;

  try {
    const { symbol, lastPrice, volatility, score, levels } = plan;
    await activePool.query(
      `INSERT INTO trading_plans (
        symbol, last_price, volatility, score, pivot, target_main, stop_loss, tranche1_entry, tranche2_breakout, tranche3_after_resistance
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        symbol,
        lastPrice,
        volatility,
        score,
        levels?.pivot,
        levels?.targetMain,
        levels?.stopLoss,
        levels?.tranche1_Entry,
        levels?.tranche2_Breakout,
        levels?.tranche3_AfterResistance
      ]
    );
  } catch (err: any) {
    console.warn("⚠️ Failed to save trading plan to PostgreSQL:", err.message);
  }
}

/**
 * Get recent Trading Plans
 */
export async function getTradingPlansFromDb(symbol?: string, limit: number = 10): Promise<any[] | null> {
  const activePool = getDbPool();
  if (!activePool || !isDbConnected) return null;

  try {
    let querySpec = `SELECT * FROM trading_plans`;
    let params: any[] = [];
    
    if (symbol) {
      querySpec += ` WHERE symbol = $1`;
      params.push(symbol);
    }
    
    querySpec += ` ORDER BY timestamp DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const { rows } = await activePool.query(querySpec, params);
    return rows.map(r => ({
      id: r.id,
      symbol: r.symbol,
      lastPrice: parseFloat(r.last_price),
      volatility: r.volatility,
      score: r.score,
      levels: {
        pivot: parseFloat(r.pivot),
        targetMain: parseFloat(r.target_main),
        stopLoss: parseFloat(r.stop_loss),
        tranche1_Entry: parseFloat(r.tranche1_entry),
        tranche2_Breakout: parseFloat(r.tranche2_breakout),
        tranche3_AfterResistance: parseFloat(r.tranche3_after_resistance)
      },
      timestamp: r.timestamp
    }));
  } catch (err: any) {
    console.warn("⚠️ Failed to read trading plans from PostgreSQL:", err.message);
    return null;
  }
}
