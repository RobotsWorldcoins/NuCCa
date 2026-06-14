import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { compositionManifestHash, SAMPLE_LIBRARY } from "@/lib/game";
import { readSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

const compositionSchema = z.object({
  title: z.string().min(2).max(80),
  sampleIds: z.array(z.string()).max(12).default([]),
  arrangement: z.string().min(3).max(2000),
  source: z.enum(["sample-builder", "ai-song-forge"]).default("sample-builder"),
  prompt: z.string().max(1000).optional(),
  genre: z.string().max(40).optional(),
  aiModel: z.string().max(80).optional(),
}).superRefine((value, context) => {
  if (value.source === "sample-builder" && value.sampleIds.length < 2) {
    context.addIssue({
      code: "custom",
      message: "Sample builder compositions need at least two samples.",
      path: ["sampleIds"],
    });
  }

  if (value.source === "ai-song-forge" && (!value.prompt || value.prompt.length < 8)) {
    context.addIssue({
      code: "custom",
      message: "AI song forge compositions need a prompt.",
      path: ["prompt"],
    });
  }
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
    source: body.data.source,
    prompt: body.data.prompt,
    genre: body.data.genre,
    aiModel: body.data.aiModel,
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
      source: body.data.source,
      prompt: body.data.prompt ?? null,
      genre: body.data.genre ?? null,
      aiModel: body.data.aiModel ?? null,
      manifestHash,
      rankedEligible: true,
      persisted: false,
    },
  });
}
