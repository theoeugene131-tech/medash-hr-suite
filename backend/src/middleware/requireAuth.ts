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

  try {
    // A valid signature alone is not enough: the account may have been
    // removed or its role/company changed since this token was issued.
    const user = await db.find("users", payload.userId);
    if (
      !user ||
      user.companyId !== payload.companyId ||
      user.role !== payload.role ||
      (user.employeeId ?? null) !== (payload.employeeId ?? null)
    ) {
      return res.status(401).json({ error: "Account access has changed. Please sign in again." });
    }

    const company = await db.find("companies", user.companyId);
    if (!company) return res.status(403).json({ error: "Company account could not be found." });
    req.auth = {
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
      employeeId: user.employeeId ?? null,
    };

    const isCompanyStatusRead = req.method === "GET" && req.path === "/";
    const now = Date.now();
    const trialEndsAt = company.trialEndsAt ? new Date(company.trialEndsAt).getTime() : null;
    const subscriptionEndsAt = company.subscriptionEndsAt ? new Date(company.subscriptionEndsAt).getTime() : null;
    const trialExpired = company.subscriptionStatus !== "active" && trialEndsAt !== null && trialEndsAt < now;
    const paidSubscriptionExpired = company.subscriptionStatus === "active" && subscriptionEndsAt !== null && subscriptionEndsAt < now;
    if (!isCompanyStatusRead && (trialExpired || paidSubscriptionExpired)) {
      return res.status(402).json({ error: trialExpired ? "Your 14-day Medash trial has ended. Contact Medash support to arrange manual subscription activation." : "Your Medash subscription has expired. Contact Medash support to renew access." });
    }
    return next();
  } catch (error) {
    console.error("Authentication access check failed:", error);
    return res.status(503).json({ error: "Could not verify account access. Please try again shortly." });
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
