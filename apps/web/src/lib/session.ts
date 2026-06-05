import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { optionalServerEnv } from "@/lib/env";

export type AppSession = {
  walletAddress: string;
  username?: string;
  worldSessionId?: `session_${string}`;
};

const COOKIE_NAME = "nucca_session";
const NONCE_COOKIE = "nucca_wallet_nonce";

function sessionSecret() {
  const configured = optionalServerEnv("SESSION_SECRET");
  return new TextEncoder().encode(
    configured ?? "development-only-nucca-session-secret-change-me",
  );
}

export async function setWalletNonce(nonce: string) {
  const jar = await cookies();
  jar.set(NONCE_COOKIE, nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
  });
}

export async function readWalletNonce() {
  const jar = await cookies();
  return jar.get(NONCE_COOKIE)?.value ?? null;
}

export async function clearWalletNonce() {
  const jar = await cookies();
  jar.delete(NONCE_COOKIE);
}

export async function createSession(session: AppSession) {
  const token = await new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(sessionSecret());

  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function readSession(): Promise<AppSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const verified = await jwtVerify(token, sessionSecret());
    return verified.payload as AppSession;
  } catch {
    return null;
  }
}
