import { Router } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import crypto from "crypto";
import { db } from "../lib/db.js";
import { hashPassword, verifyPassword, signToken } from "../lib/auth.js";
import { requireAuth, requireAdmin, AuthedRequest } from "../middleware/requireAuth.js";

export const authRouter = Router();

const signupSchema = z.object({
  companyName: z.string().min(2),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  countryCode: z.string().regex(/^[A-Z]{2}$/).optional().default("NG"),
});

// Creates a company + its first "owner" login. This replaces the old
// "Viewing as: Owner / HR Admin / Employee" dropdown, which let anyone
// looking at the app switch roles and see any employee's data with no
// authentication at all.
authRouter.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { companyName, name, password, countryCode } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();
  const region = ({ NG: { currency: "NGN", locale: "en-NG", timezone: "Africa/Lagos" }, GB: { currency: "GBP", locale: "en-GB", timezone: "Europe/London" }, US: { currency: "USD", locale: "en-US", timezone: "America/New_York" }, CA: { currency: "CAD", locale: "en-CA", timezone: "America/Toronto" }, AU: { currency: "AUD", locale: "en-AU", timezone: "Australia/Sydney" }, NZ: { currency: "NZD", locale: "en-NZ", timezone: "Pacific/Auckland" }, IE: { currency: "EUR", locale: "en-IE", timezone: "Europe/Dublin" }, GH: { currency: "GHS", locale: "en-GH", timezone: "Africa/Accra" }, KE: { currency: "KES", locale: "en-KE", timezone: "Africa/Nairobi" }, ZA: { currency: "ZAR", locale: "en-ZA", timezone: "Africa/Johannesburg" } } as Record<string, { currency: string; locale: string; timezone: string }>)[countryCode] || { currency: "USD", locale: "en", timezone: "UTC" };

  const existing = ((await db.table("users")) as any[]).find((u) => String(u.email).toLowerCase() === email);
  if (existing) return res.status(409).json({ error: "An account with that email already exists" });

  const companyId = nanoid();
  const trialStartedAt = new Date();
  const trialEndsAt = new Date(trialStartedAt.getTime() + 14 * 24 * 60 * 60 * 1000);
  await db.insert("companies", { id: companyId, name: companyName.trim(), countryCode, ...region, subscriptionStatus: "trial", trialStartedAt: trialStartedAt.toISOString(), trialEndsAt: trialEndsAt.toISOString(), createdAt: trialStartedAt.toISOString() });

  const user = {
    id: nanoid(),
    companyId,
    email,
    name,
    passwordHash: await hashPassword(password),
    role: "owner" as const,
    employeeId: null,
    createdAt: new Date().toISOString(),
  };
  await db.insert("users", user);

  const token = signToken({ userId: user.id, companyId, role: "owner", employeeId: null });
  res.status(201).json({ token, user: { id: user.id, name, email, role: "owner" } });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { password } = parsed.data;
  const email = parsed.data.email.trim().toLowerCase();

  const user = ((await db.table("users")) as any[]).find((u) => String(u.email).toLowerCase() === email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken({
    userId: user.id,
    companyId: user.companyId,
    role: user.role,
    employeeId: user.employeeId ?? null,
  });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// Admin generates a one-time invite link for a specific employee to set
// their own password and log in as themselves (self-service payslips)
// instead of everyone sharing one browser's "Viewing as: Employee" toggle.
authRouter.post("/invite-employee", requireAuth, requireAdmin, async (req: AuthedRequest, res) => {
  const schema = z.object({ employeeId: z.string(), email: z.string().email() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const employee = await db.find("employees", parsed.data.employeeId);
  if (!employee || employee.companyId !== req.auth!.companyId) {
    return res.status(404).json({ error: "Employee not found" });
  }
  const inviteEmail = parsed.data.email.trim().toLowerCase();
  const users = (await db.table("users")) as any[];
  if (users.some((user) => String(user.email).toLowerCase() === inviteEmail)) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }
  if (users.some((user) => user.companyId === req.auth!.companyId && user.employeeId === employee.id)) {
    return res.status(409).json({ error: "This employee already has a login account." });
  }

  const inviteToken = crypto.randomBytes(24).toString("hex");
  await db.insert("invites", {
    id: nanoid(),
    companyId: req.auth!.companyId,
    employeeId: parsed.data.employeeId,
    email: inviteEmail,
    inviteToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    usedAt: null,
    createdAt: new Date().toISOString(),
  });

  // In production, email this URL via Resend/Postmark/etc. instead of returning it.
  res.json({ inviteUrl: `${process.env.APP_URL || "http://localhost:3000"}/accept-invite?token=${inviteToken}` });
});

authRouter.post("/accept-invite", async (req, res) => {
  const schema = z.object({ token: z.string(), password: z.string().min(8) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const invite = ((await db.table("invites")) as any[]).find((i) => i.inviteToken === parsed.data.token);
  if (!invite || invite.usedAt || new Date(invite.expiresAt) < new Date()) {
    return res.status(400).json({ error: "Invite link is invalid or has expired" });
  }
  const email = String(invite.email).trim().toLowerCase();
  const existingUsers = (await db.table("users")) as any[];
  if (existingUsers.some((existing) => String(existing.email).toLowerCase() === email)) {
    return res.status(409).json({ error: "An account with this email already exists. Contact your company administrator." });
  }
  const employee = await db.find("employees", invite.employeeId);
  if (!employee || employee.companyId !== invite.companyId) {
    return res.status(400).json({ error: "The invited employee record is no longer available." });
  }

  const user = {
    id: nanoid(),
    companyId: invite.companyId,
    email,
    name: employee.name || email,
    passwordHash: await hashPassword(parsed.data.password),
    role: "employee" as const,
    employeeId: invite.employeeId,
    createdAt: new Date().toISOString(),
  };
  await db.insert("users", user);
  await db.update("invites", invite.id, { usedAt: new Date().toISOString() });

  const token = signToken({ userId: user.id, companyId: user.companyId, role: "employee", employeeId: invite.employeeId });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: "employee" } });
});
