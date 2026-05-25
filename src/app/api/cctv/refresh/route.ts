import { NextResponse } from "next/server";

export async function POST() {
  // Legacy refresh endpoint — cache is managed by /api/cctv POST handler
  return NextResponse.json({ status: "ok", message: "Use POST /api/cctv to force refresh", timestamp: new Date().toISOString() });
}
