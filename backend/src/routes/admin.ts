import { Router } from "express";
import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../lib/db.js";

export const adminRouter = Router();

function requirePlatformAdmin(req: Request, res: Response, next: NextFunction) {
  const configured = process.env.ADMIN_ACTIVATION_SECRET || "";
  const supplied = String(req.header("x-admin-activation-secret") || "");
  if (!configured || configured.length < 32 || supplied.length !== configured.length ||
      !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(configured))) {
    return res.status(403).json({ error: "Not authorised to access the platform admin area." });
  }
  return next();
}

adminRouter.get("/companies", requirePlatformAdmin, async (_req, res) => {
  const [companies, users] = await Promise.all([db.table("companies"), db.table("users")]);
  const result = companies.map((company: any) => {
    const owner = users.find((user: any) => user.companyId === company.id && user.role === "owner");
    return {
      id: company.id,
      name: company.name,
      countryCode: company.countryCode || "NG",
      createdAt: company.createdAt || null,
      ownerEmail: owner?.email || null,
      subscriptionStatus: company.subscriptionStatus || "active",
      trialStartedAt: company.trialStartedAt || null,
      trialEndsAt: company.trialEndsAt || null,
      subscriptionPlan: company.subscriptionPlan || null,
      subscriptionActivatedAt: company.subscriptionActivatedAt || null,
      subscriptionEndsAt: company.subscriptionEndsAt || null,
    };
  });
  return res.json(result);
});

adminRouter.get("/subscription-payment-requests", requirePlatformAdmin, async (_req, res) => {
  const [requests, companies, users] = await Promise.all([
    db.table("subscriptionPaymentRequests"), db.table("companies"), db.table("users"),
  ]);
  const result = requests
    .filter((item: any) => item.status === "pending")
    .map((item: any) => {
      const company = companies.find((entry: any) => entry.id === item.companyId);
      const owner = users.find((entry: any) => entry.id === item.userId);
      return {
        id: item.id, companyId: item.companyId, companyName: company?.name || "Unknown company",
        ownerEmail: owner?.email || null, plan: item.plan, paymentReference: item.paymentReference,
        payerName: item.payerName || "", note: item.note || "", createdAt: item.createdAt,
      };
    })
    .sort((a: any, b: any) => String(a.createdAt).localeCompare(String(b.createdAt)));
  return res.json(result);
});

adminRouter.post("/subscriptions/activate", requirePlatformAdmin, async (req, res) => {

  const parsed = z.object({
    companyId: z.string().min(1),
    paymentRequestId: z.string().min(1).optional(),
    plan: z.enum(["monthly", "annual"]).default("monthly"),
    subscriptionEndsAt: z.string().datetime().optional(),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Provide a valid companyId, plan, and optional ISO subscription end date." });

  const company = await db.find("companies", parsed.data.companyId);
  if (!company) return res.status(404).json({ error: "Company not found." });
  let paymentRequest: any = null;
  if (parsed.data.paymentRequestId) {
    paymentRequest = await db.find("subscriptionPaymentRequests", parsed.data.paymentRequestId);
    if (!paymentRequest || paymentRequest.companyId !== company.id || paymentRequest.status !== "pending") {
      return res.status(404).json({ error: "Pending payment request not found for this company." });
    }
  }
  const activatedAt = new Date();
  const defaultEnd = new Date(activatedAt.getTime() + (parsed.data.plan === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000);
  const updated = await db.update("companies", company.id, {
    subscriptionStatus: "active",
    subscriptionPlan: parsed.data.plan,
    subscriptionActivatedAt: activatedAt.toISOString(),
    subscriptionEndsAt: parsed.data.subscriptionEndsAt || defaultEnd.toISOString(),
    ...(paymentRequest ? { lastPaymentReference: paymentRequest.paymentReference, lastPaymentVerifiedAt: activatedAt.toISOString() } : {}),
  });
  if (paymentRequest) {
    await db.update("subscriptionPaymentRequests", paymentRequest.id, {
      status: "approved", reviewedAt: activatedAt.toISOString(), approvedPlan: parsed.data.plan,
    });
  }
  return res.json({ ok: true, companyId: updated.id, subscriptionStatus: updated.subscriptionStatus, subscriptionPlan: updated.subscriptionPlan, subscriptionEndsAt: updated.subscriptionEndsAt });
});
