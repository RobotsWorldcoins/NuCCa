import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";

const completeSchema = z.object({
  jobId: z.string(),
  status: z.enum(["complete", "failed", "sleeping", "capacity_full", "offline"]),
  outputUrl: z.string().url().optional(),
  error: z.string().optional(),
});

export async function POST(request: Request) {
  const secret = request.headers.get("x-ai-worker-secret");
  if (secret !== process.env.AI_WORKER_SHARED_SECRET) {
    return NextResponse.json(
      { ok: false, message: "Invalid worker secret." },
      { status: 401 },
    );
  }

  const body = completeSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid worker completion payload." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: "Supabase is not configured." },
      { status: 503 },
    );
  }

  const { error } = await supabase
    .from("ai_jobs")
    .update({
      status: body.data.status,
      output_url: body.data.outputUrl ?? null,
      error_message: body.data.error ?? null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", body.data.jobId);

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
