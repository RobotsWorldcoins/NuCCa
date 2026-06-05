import { NextResponse } from "next/server";
import { SWAP_INTEGRATION_STATUS, SWAP_ROUTES } from "@/lib/swap";

export async function GET() {
  return NextResponse.json({
    ok: true,
    routes: SWAP_ROUTES,
    status: SWAP_INTEGRATION_STATUS,
  });
}
