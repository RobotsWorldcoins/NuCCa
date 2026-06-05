import { NextResponse } from "next/server";
import { createSession } from "@/lib/session";

const DEV_WALLET = "0x1111111111111111111111111111111111111111";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { ok: false, message: "Development session is disabled in production." },
      { status: 404 },
    );
  }

  await createSession({
    walletAddress: DEV_WALLET,
    username: "local-preview",
  });

  return NextResponse.json({
    ok: true,
    walletAddress: DEV_WALLET,
    message: "Local preview session created.",
  });
}
