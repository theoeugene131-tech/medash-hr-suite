import { Router } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "../lib/db.js";

export const adminRouter = Router();

adminRouter.post("/subscriptions/activate", async (req, res) => {
  const configured = process.env.ADMIN_ACTIVATION_SECRET || "";
  const supplied = String(req.header("x-admin-activation-secret") || "");
  if (!configured || configured.length < 32 || supplied.length !== configured.length ||
      !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(configured))) {
    return res.status(403).json({ error: "Not authorised to activate subscriptions." });
  }

  const parsed = z.object({
    companyId: z.string().min(1),
    plan: z.enum(["monthly", "annual"]).default("monthly"),
    subscriptionEndsAt: z.string().datetime().optional(),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Provide a valid companyId, plan, and optional ISO subscription end date." });

  const company = await db.find("companies", parsed.data.companyId);
  if (!company) return res.status(404).json({ error: "Company not found." });
  const updated = await db.update("companies", company.id, {
    subscriptionStatus: "active",
    subscriptionPlan: parsed.data.plan,
    subscriptionActivatedAt: new Date().toISOString(),
    subscriptionEndsAt: parsed.data.subscriptionEndsAt || null,
  });
  return res.json({ ok: true, companyId: updated.id, subscriptionStatus: updated.subscriptionStatus, subscriptionPlan: updated.subscriptionPlan });
});
