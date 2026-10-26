import { Pool } from "pg";
const url = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: url, ...(process.env.NODE_ENV === "production" ? { ssl: { rejectUnauthorized: false } } : {}) });
export async function ensureSchema() {
  if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required.");
  }
  await pool.query("CREATE TABLE IF NOT EXISTS records (table_name TEXT NOT NULL, id TEXT NOT NULL, company_id TEXT, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY (table_name, id))");
  await pool.query("CREATE INDEX IF NOT EXISTS idx_records_table_company ON records (table_name, company_id)");
}
export const db = {
  async table(name: string, companyId?: string): Promise<any[]> {
    const result = companyId
      ? await pool.query("SELECT data FROM records WHERE table_name = $1 AND company_id = $2 ORDER BY created_at", [name, companyId])
      : await pool.query("SELECT data FROM records WHERE table_name = $1 ORDER BY created_at", [name]);
    return result.rows.map((row) => row.data);
  },
  async insert(name: string, row: any) {
    await pool.query("INSERT INTO records (table_name, id, company_id, data) VALUES ($1, $2, $3, $4)", [name, row.id, row.companyId ?? null, JSON.stringify(row)]);
    return row;
  },
  async update(name: string, id: string, patch: Record<string, any>) {
    const result = await pool.query("SELECT data FROM records WHERE table_name = $1 AND id = $2", [name, id]);
    if (!result.rowCount) return null;
    const merged = { ...result.rows[0].data, ...patch };
    await pool.query("UPDATE records SET data = $1, company_id = $2, updated_at = now() WHERE table_name = $3 AND id = $4", [JSON.stringify(merged), merged.companyId ?? null, name, id]);
    return merged;
  },
  // Tenant-scoped mutations keep the company boundary inside the SQL query,
  // rather than relying only on a separate ownership check in a route.
  async findForCompany(name: string, id: string, companyId: string) {
    const result = await pool.query(
      "SELECT data FROM records WHERE table_name = $1 AND id = $2 AND company_id = $3",
      [name, id, companyId]
    );
    return result.rowCount ? result.rows[0].data : null;
  },
  async updateForCompany(name: string, id: string, companyId: string, patch: Record<string, any>) {
    const result = await pool.query(
      "SELECT data FROM records WHERE table_name = $1 AND id = $2 AND company_id = $3",
      [name, id, companyId]
    );
    if (!result.rowCount) return null;
    const merged = { ...result.rows[0].data, ...patch, companyId };
    const updated = await pool.query(
      "UPDATE records SET data = $1, updated_at = now() WHERE table_name = $2 AND id = $3 AND company_id = $4 RETURNING data",
      [JSON.stringify(merged), name, id, companyId]
    );
    return updated.rowCount ? updated.rows[0].data : null;
  },
  async deleteForCompany(name: string, id: string, companyId: string) {
    const result = await pool.query(
      "DELETE FROM records WHERE table_name = $1 AND id = $2 AND company_id = $3",
      [name, id, companyId]
    );
    return (result.rowCount ?? 0) > 0;
  },
  async find(name: string, id: string) {
    const result = await pool.query("SELECT data FROM records WHERE table_name = $1 AND id = $2", [name, id]);
    return result.rowCount ? result.rows[0].data : null;
  },
  async delete(name: string, id: string) {
    const result = await pool.query("DELETE FROM records WHERE table_name = $1 AND id = $2", [name, id]);
    return (result.rowCount ?? 0) > 0;
  },
  async close() { await pool.end(); }
};
