import { NextResponse } from "next/server";
import { verifySiweMessage } from "@worldcoin/minikit-js/siwe";
import { z } from "zod";
import {
  clearWalletNonce,
  createSession,
  readWalletNonce,
} from "@/lib/session";

const walletAuthSchema = z.object({
  address: z.string().startsWith("0x"),
  message: z.string().min(1),
  signature: z.string().min(1),
  version: z.number().optional(),
});

export async function POST(request: Request) {
  const nonce = await readWalletNonce();
  if (!nonce) {
    return NextResponse.json(
      { ok: false, message: "WalletAuth nonce expired." },
      { status: 401 },
    );
  }

  const body = walletAuthSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid WalletAuth payload." },
      { status: 400 },
    );
  }

  const verification = await verifySiweMessage(body.data, nonce);
  if (!verification.isValid) {
    return NextResponse.json(
      { ok: false, message: "WalletAuth signature failed." },
      { status: 401 },
    );
  }

  await createSession({ walletAddress: body.data.address.toLowerCase() });
  await clearWalletNonce();

  return NextResponse.json({
    ok: true,
    walletAddress: body.data.address.toLowerCase(),
  });
}
