import { NextResponse } from "next/server";
import { ADMIN_COOKIE, createAdminToken, isAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { password } = await request.json();
  if (!isAdminPassword(String(password || ""))) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createAdminToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 12, path: "/" });
  return response;
}
