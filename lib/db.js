import { Pool } from "pg";

// Un singur pool reutilizat intre request-uri (evita "too many connections" pe serverless).
let pool;

// Scoatem sslmode/channel_binding din connection string: le suprascriem oricum explicit
// mai jos cu optiunea `ssl`, iar pastrarea lor in string declanseaza un warning de la
// pg-connection-string despre schimbarea semanticii in v3 (alias ambiguu pentru verify-full).
function cleanConnectionString(raw) {
  if (!raw) return raw;
  try {
    const url = new URL(raw);
    url.searchParams.delete("sslmode");
    url.searchParams.delete("channel_binding");
    return url.toString();
  } catch {
    return raw;
  }
}

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: cleanConnectionString(process.env.DATABASE_URL),
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

export async function query(text, params) {
  const client = await getPool().connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}
