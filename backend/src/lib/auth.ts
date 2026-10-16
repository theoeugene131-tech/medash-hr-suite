import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production" && (!secret || secret.length < 32)) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }
  return secret || "development-only-secret-do-not-use-in-production";
}
const TOKEN_TTL = "14d";

export async function hashPassword(password: string) { return bcrypt.hash(password, 10); }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash); }

export interface TokenPayload {
  userId: string;
  companyId: string;
  role: "owner" | "admin" | "employee";
  employeeId: string | null;
}
export function signToken(payload: TokenPayload) { return jwt.sign(payload, getJwtSecret(), { expiresIn: TOKEN_TTL }); }
export function verifyToken(token: string): TokenPayload | null {
  try { return jwt.verify(token, getJwtSecret()) as TokenPayload; }
  catch { return null; }
}
