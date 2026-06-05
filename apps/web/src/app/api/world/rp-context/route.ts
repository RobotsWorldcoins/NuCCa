import { NextResponse } from "next/server";
import { signRequest } from "@worldcoin/idkit/signing";
import { publicWorldConfig } from "@/lib/env";

export async function POST(request: Request) {
  const config = publicWorldConfig();
  const signingKey = process.env.WORLD_RP_SIGNING_KEY;
  const body = (await request.json().catch(() => ({}))) as {
    kind?: "session" | "action";
    action?: string;
  };

  if (!config.appId || !config.rpId || !signingKey) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "World RP config is missing. Set NEXT_PUBLIC_WORLD_APP_ID, NEXT_PUBLIC_WORLD_RP_ID, and WORLD_RP_SIGNING_KEY.",
      },
      { status: 503 },
    );
  }

  const signature = signRequest({
    signingKeyHex: signingKey,
    action: body.kind === "action" ? body.action : undefined,
    ttl: 60 * 10,
  });

  return NextResponse.json({
    ok: true,
    app_id: config.appId,
    environment: config.environment,
    rp_context: {
      rp_id: config.rpId,
      nonce: signature.nonce,
      created_at: signature.createdAt,
      expires_at: signature.expiresAt,
      signature: signature.sig,
    },
  });
}
