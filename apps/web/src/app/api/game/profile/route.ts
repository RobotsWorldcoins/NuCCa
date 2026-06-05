import { NextResponse } from "next/server";
import {
  CREATOR_OUTFIT_ITEMS,
  CREATOR_STYLE_ITEMS,
  MUSIC_GENRES,
  levelForXp,
  SAMPLE_LIBRARY,
} from "@/lib/game";
import { readSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const session = await readSession();
  const walletAddress = session?.walletAddress ?? "preview";
  const supabase = getSupabaseAdmin();

  if (supabase && session) {
    const { data } = await supabase
      .from("studios")
      .select("*")
      .eq("wallet_address", session.walletAddress)
      .maybeSingle();

    const xp = data?.xp ?? 120;
    return NextResponse.json({
      ok: true,
      profile: {
        walletAddress,
        xp,
        energy: data?.energy ?? 100,
        level: levelForXp(xp),
        equipped: ["genesis-frame", "techno-neon-visor"],
        unlockedSamples: SAMPLE_LIBRARY.filter((sample) => sample.unlockLevel <= levelForXp(xp).level),
        shop: CREATOR_STYLE_ITEMS,
        genres: MUSIC_GENRES,
        outfits: CREATOR_OUTFIT_ITEMS,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    profile: {
      walletAddress,
      xp: 120,
    energy: 100,
    level: levelForXp(120),
      equipped: ["genesis-frame", "techno-neon-visor"],
      unlockedSamples: SAMPLE_LIBRARY.filter((sample) => sample.unlockLevel <= 1),
      shop: CREATOR_STYLE_ITEMS,
      genres: MUSIC_GENRES,
      outfits: CREATOR_OUTFIT_ITEMS,
      message: "Preview profile. Connect Supabase for persistence.",
    },
  });
}
