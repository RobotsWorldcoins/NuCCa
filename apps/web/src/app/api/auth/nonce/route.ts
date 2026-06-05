import { NextResponse } from "next/server";
import { setWalletNonce } from "@/lib/session";

function alphanumericNonce(length = 24) {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

export async function POST() {
  const nonce = alphanumericNonce();
  await setWalletNonce(nonce);
  return NextResponse.json({ nonce });
}
