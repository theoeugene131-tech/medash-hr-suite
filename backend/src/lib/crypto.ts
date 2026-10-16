import crypto from "node:crypto";

function getKey(): Buffer {
  const configured = process.env.ENCRYPTION_KEY;
  if (process.env.NODE_ENV === "production" && (!configured || !/^[a-fA-F0-9]{64}$/.test(configured))) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hexadecimal value in production.");
  }
  if (configured && !/^[a-fA-F0-9]{64}$/.test(configured)) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hexadecimal value.");
  }
  return configured
    ? Buffer.from(configured, "hex")
    : crypto.createHash("sha256").update("medash-development-only-not-for-production").digest();
}

export function encryptField(value: string | null | undefined): string | null {
  if (value == null || value === "") return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64");
}
export function decryptField(value: string | null | undefined): string {
  if (!value) return "";
  const bytes = Buffer.from(value, "base64");
  if (bytes.length < 28) throw new Error("Encrypted field is malformed.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), bytes.subarray(0, 12));
  decipher.setAuthTag(bytes.subarray(12, 28));
  return Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString("utf8");
}
