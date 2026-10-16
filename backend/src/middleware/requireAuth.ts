import { Request, Response, NextFunction } from "express";
import { verifyToken, TokenPayload } from "../lib/auth.js";
import { db } from "../lib/db.js";

export interface AuthedRequest extends Request {
  auth?: TokenPayload;
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  }
  const payload = verifyToken(header.slice("Bearer ".length));
  if (!payload) return res.status(401).json({ error: "Invalid or expired token" });
  req.auth = payload;

  try {
    const company = await db.find("companies", payload.companyId);
    if (!company) return res.status(403).json({ error: "Company account could not be found." });
    const isCompanyStatusRead = req.method === "GET" && req.path === "/";
    const trialEndsAt = company.trialEndsAt ? new Date(company.trialEndsAt).getTime() : null;
    if (!isCompanyStatusRead && company.subscriptionStatus !== "active" && trialEndsAt !== null && trialEndsAt < Date.now()) {
      return res.status(402).json({ error: "Your 14-day Medash trial has ended. Contact Medash support to arrange manual subscription activation." });
    }
    return next();
  } catch (error) {
    console.error("Subscription access check failed:", error);
    return res.status(503).json({ error: "Could not verify company access. Please try again shortly." });
  }
}

// Only owner/admin can manage employees, run payroll, etc. — an "employee"
// role can only ever read their own record (enforced in the routes).
export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.auth?.role !== "owner" && req.auth?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
