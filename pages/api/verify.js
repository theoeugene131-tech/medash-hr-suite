import { ensureSchema, db } from "../../backend/dist/lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ valid: false, reason: "Method not allowed" });
  const code = String(req.body?.key || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!/^MEDASH-[A-Z0-9]{4,}-[A-Z0-9-]{4,}$/.test(code)) return res.status(400).json({ valid: false, reason: "Invalid Medash licence format." });
  try {
    await ensureSchema();
    const license = await db.find("licenses", code);
    if (!license || license.status !== "active") return res.status(403).json({ valid: false, reason: "Licence not activated yet. Contact support after purchase confirmation." });
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) return res.status(403).json({ valid: false, reason: "Licence expired." });
    return res.status(200).json({ valid: true, plan: license.plan || "standard" });
  } catch {
    return res.status(503).json({ valid: false, reason: "Licence verification temporarily unavailable." });
  }
}
