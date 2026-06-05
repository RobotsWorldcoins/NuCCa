import { NextResponse } from "next/server";
import { z } from "zod";
import { FREE_AI_GENERATORS } from "@/lib/ai";
import { readSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

const jobSchema = z.object({
  generatorId: z.string(),
  prompt: z.string().min(1).max(1000),
});

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Connect with WalletAuth first." },
      { status: 401 },
    );
  }

  const body = jobSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid AI job request." },
      { status: 400 },
    );
  }

  const generator = FREE_AI_GENERATORS.find(
    (item) => item.id === body.data.generatorId,
  );
  if (!generator) {
    return NextResponse.json(
      { ok: false, message: "Unknown generator." },
      { status: 404 },
    );
  }

  if (generator.dailyCap === 0) {
    return NextResponse.json({
      ok: false,
      message: `${generator.name} is offline until consent and free compute are configured.`,
      job: { status: generator.status },
    });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({
      ok: true,
      message:
        "Queued in preview mode. Configure Supabase and a free worker before production.",
      job: {
        id: crypto.randomUUID(),
        generatorId: generator.id,
        status: generator.status,
      },
    });
  }

  const { data, error } = await supabase
    .from("ai_jobs")
    .insert({
      wallet_address: session.walletAddress,
      generator_id: generator.id,
      prompt: body.data.prompt,
      status: "queued",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, job: data });
}
