import { NextResponse } from "next/server";
import { publicWorldConfig } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const config = publicWorldConfig();
  const proof = await request.json();

  if (!config.rpId) {
    return NextResponse.json(
      { ok: false, message: "NEXT_PUBLIC_WORLD_RP_ID is missing." },
      { status: 503 },
    );
  }

  const response = await fetch(
    `https://developer.world.org/api/v4/verify/${config.rpId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proof),
    },
  );

  const verification = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json(
      { ok: false, message: "World verification failed.", verification },
      { status: response.status },
    );
  }

  const supabase = getSupabaseAdmin();
  if (supabase && proof.session_id) {
    await supabase.from("world_id_sessions").upsert({
      session_id: proof.session_id,
      protocol_version: proof.protocol_version,
      verified_at: new Date().toISOString(),
      raw_result: proof,
    });
  }

  return NextResponse.json({ ok: true, verification });
}
