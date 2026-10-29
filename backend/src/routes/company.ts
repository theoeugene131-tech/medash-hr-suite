import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/db.js";
import { requireAuth, requireAdmin, AuthedRequest } from "../middleware/requireAuth.js";

export const companyRouter = Router();
companyRouter.use(requireAuth);

const REGIONS: Record<string, { currency: string; locale: string; timezone: string }> = {
  NG: { currency: "NGN", locale: "en-NG", timezone: "Africa/Lagos" },
  GB: { currency: "GBP", locale: "en-GB", timezone: "Europe/London" },
  US: { currency: "USD", locale: "en-US", timezone: "America/New_York" },
};

companyRouter.get("/", async (req: AuthedRequest, res) => {
  const company = await db.find("companies", req.auth!.companyId);
  if (!company) return res.status(404).json({ error: "Company not found" });
  const countryCode = typeof company.countryCode === "string" && /^[A-Z]{2}$/.test(company.countryCode) ? company.countryCode : "NG";
  const fallback = REGIONS[countryCode] || { currency: "USD", locale: "en", timezone: "UTC" };
  return res.json({
    id: company.id,
    name: company.name,
    countryCode,
    currency: company.currency || fallback.currency,
    locale: company.locale || fallback.locale,
    timezone: company.timezone || fallback.timezone,
    subscriptionStatus: company.subscriptionStatus || "active",
    trialStartedAt: company.trialStartedAt || null,
    trialEndsAt: company.trialEndsAt || null,
    subscriptionPlan: company.subscriptionPlan || null,
    subscriptionActivatedAt: company.subscriptionActivatedAt || null,
    subscriptionEndsAt: company.subscriptionEndsAt || null,
  });
});

companyRouter.patch("/region", requireAdmin, async (req: AuthedRequest, res) => {
  const parsed = z.object({ countryCode: z.string().regex(/^[A-Z]{2}$/), currency: z.string().regex(/^[A-Z]{3}$/).optional() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Choose a valid country code and currency code." });
  const company = await db.find("companies", req.auth!.companyId);
  if (!company) return res.status(404).json({ error: "Company not found" });
  const region = REGIONS[parsed.data.countryCode] || { currency: parsed.data.currency || "USD", locale: "en", timezone: "UTC" };
  const updated = await db.update("companies", company.id, {
    countryCode: parsed.data.countryCode,
    currency: parsed.data.currency || region.currency,
    locale: region.locale,
    timezone: region.timezone,
    updatedAt: new Date().toISOString(),
  });
  return res.json({
    id: updated.id,
    name: updated.name,
    countryCode: updated.countryCode,
    currency: updated.currency,
    locale: updated.locale,
    timezone: updated.timezone,
  });
});
