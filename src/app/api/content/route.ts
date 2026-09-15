import { NextResponse } from "next/server";
import { readContent } from "@/lib/portfolio-content";
export async function GET() { return NextResponse.json(await readContent()); }
