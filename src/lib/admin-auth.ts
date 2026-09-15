import crypto from "crypto";

const COOKIE = "portfolio_admin";

function signingKey() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function isAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || password.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(password), Buffer.from(expected));
}

export function createAdminToken() {
  const payload = `${Date.now()}.${crypto.randomBytes(16).toString("hex")}`;
  const signature = crypto.createHmac("sha256", signingKey()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifyAdminToken(token?: string) {
  if (!token || !signingKey()) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const signature = crypto.createHmac("sha256", signingKey()).update(payload).digest("hex");
  if (signature.length !== parts[2].length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(parts[2]))) return false;
  return Date.now() - Number(parts[0]) < 1000 * 60 * 60 * 12;
}

export const ADMIN_COOKIE = COOKIE;
