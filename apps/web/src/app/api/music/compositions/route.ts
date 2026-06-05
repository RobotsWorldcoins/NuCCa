import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { compositionManifestHash, SAMPLE_LIBRARY } from "@/lib/game";
import { readSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

const compositionSchema = z.object({
  title: z.string().min(2).max(80),
  sampleIds: z.array(z.string()).min(2).max(12),
  arrangement: z.string().min(3).max(2000),
});

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "WalletAuth is required to create ranked music." },
      { status: 401 },
    );
  }

  const body = compositionSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid composition." },
      { status: 400 },
    );
  }

  const validSamples = new Set(SAMPLE_LIBRARY.map((sample) => sample.id));
  const unknownSample = body.data.sampleIds.find((id) => !validSamples.has(id));
  if (unknownSample) {
    return NextResponse.json(
      { ok: false, message: `Unknown sample: ${unknownSample}` },
      { status: 400 },
    );
  }

  const createdAt = new Date().toISOString();
  const manifest = compositionManifestHash({
    walletAddress: session.walletAddress,
    sampleIds: body.data.sampleIds,
    arrangement: body.data.arrangement,
    createdAt,
  });
  const manifestHash = createHash("sha256").update(manifest).digest("hex");
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from("compositions")
      .insert({
        wallet_address: session.walletAddress,
        title: body.data.title,
        sample_ids: body.data.sampleIds,
        arrangement: body.data.arrangement,
        provenance_manifest: JSON.parse(manifest),
        manifest_hash: manifestHash,
        ranked_eligible: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, composition: data });
  }

  return NextResponse.json({
    ok: true,
    composition: {
      id: crypto.randomUUID(),
      title: body.data.title,
      sampleIds: body.data.sampleIds,
      manifestHash,
      rankedEligible: true,
      persisted: false,
    },
  });
}
