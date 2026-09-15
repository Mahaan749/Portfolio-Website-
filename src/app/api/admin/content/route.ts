import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { readContent, writeContent } from "@/lib/portfolio-content";
function allowed(request: NextRequest) { return verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value); }
export async function GET(request: NextRequest) { if (!allowed(request)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 }); return NextResponse.json(await readContent()); }
export async function PUT(request: NextRequest) { if (!allowed(request)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 }); try { await writeContent(await request.json()); return NextResponse.json({ ok: true }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Save failed" }, { status: 500 }); } }
