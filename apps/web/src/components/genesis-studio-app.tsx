"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeftRight,
  Bot,
  Crown,
  ExternalLink,
  Gift,
  Headphones,
  ImageIcon,
  Medal,
  Orbit,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { MiniKit } from "@worldcoin/minikit-js";
import { MiniKitBoot } from "@/components/mini-kit-boot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { FREE_AI_GENERATORS } from "@/lib/ai";
import {
  BATTLE_FORMATS,
  BATTLE_MODES,
  calculateBattleSplit,
  calculateMinimumContestNucca,
  type BattleFormatId,
  type BattleModeId,
} from "@/lib/battle-economy";
import { ECONOMY_SPLIT, TOKEN_FACTS } from "@/lib/constants";
import {
  BATTLE_RULES,
  CLANS,
  CREATOR_OUTFIT_ITEMS,
  CREATOR_STYLE_ITEMS,
  MUSIC_GENRES,
  MONTHLY_RANKING_RULES,
  SAMPLE_LIBRARY,
  type MusicGenre,
} from "@/lib/game";
import { SWAP_ROUTES, type SwapRouteId } from "@/lib/swap";
import { formatNucca, formatUsd, shortAddress } from "@/lib/utils";

type WalletState = {
  address: string | null;
  status: string;
};

type MarketState = {
  priceUsd: number | null;
  liquidityUsd: number | null;
  volume24h: number | null;
  txns24h: number;
  trustedForRewards: boolean;
  warning: string | null;
  url: string | null;
};

type ReferralState = {
  referralReward: number;
  referredUserBonus: number;
  monthIndex: number;
  userLoadMultiplier: number;
  maxFriends: number;
  rules: string[];
};

type TabKey = "home" | "claim" | "music" | "arena" | "clans";

export function GenesisStudioApp() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    status: "Disconnected",
  });
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [market, setMarket] = useState<MarketState | null>(null);
  const [referral, setReferral] = useState<ReferralState | null>(null);
  const [claimStatus, setClaimStatus] = useState("Ready");
  const [worldStatus, setWorldStatus] = useState("Not verified");
  const [aiStatus, setAiStatus] = useState("Idle");
  const [builderStatus, setBuilderStatus] = useState("No ranked track yet");
  const [battleStatus, setBattleStatus] = useState("No active battle");
  const [lastCompositionId, setLastCompositionId] = useState<string | null>(null);
  const [selectedBattleMode, setSelectedBattleMode] =
    useState<BattleModeId>("genesis-duel");
  const [selectedBattleFormat, setSelectedBattleFormat] =
    useState<BattleFormatId>("solo-1v1");
  const [customContestNucca, setCustomContestNucca] = useState(1000);
  const [selectedGenre, setSelectedGenre] = useState<MusicGenre>("techno");
  const [selectedSwapRoute, setSelectedSwapRoute] =
    useState<SwapRouteId>("nucca-wld");

  const referralCode = useMemo(() => {
    if (!wallet.address) return "Connect wallet";
    return `nucca${wallet.address.toLowerCase().replace(/^0x/, "").slice(0, 8)}`;
  }, [wallet.address]);

  const currentBattleMode =
    BATTLE_MODES.find((mode) => mode.id === selectedBattleMode) ??
    BATTLE_MODES[0];
  const currentBattleFormat =
    BATTLE_FORMATS.find((format) => format.id === selectedBattleFormat) ??
    BATTLE_FORMATS[0];
  const minimumContestNucca = calculateMinimumContestNucca(
    currentBattleMode,
    currentBattleFormat,
  );
  const normalizedContestNucca = Math.max(
    customContestNucca,
    minimumContestNucca,
  );
  const currentBattleSplit = calculateBattleSplit(
    currentBattleMode,
    normalizedContestNucca,
    currentBattleFormat,
  );
  const currentGenre =
    MUSIC_GENRES.find((genre) => genre.id === selectedGenre) ?? MUSIC_GENRES[0];
  const genreOutfits = CREATOR_OUTFIT_ITEMS.filter(
    (item) => item.genre === selectedGenre,
  );
  const currentSwapRoute =
    SWAP_ROUTES.find((route) => route.id === selectedSwapRoute) ??
    SWAP_ROUTES[0];

  useEffect(() => {
    let active = true;

    Promise.all([
      fetch("/api/market/nucca").then((response) => response.json()),
      fetch("/api/referrals/summary").then((response) => response.json()),
    ])
      .then(([marketJson, referralJson]) => {
        if (!active) return;
        setMarket(marketJson.market);
        setReferral(referralJson.referral);
      })
      .catch(() => {
        if (!active) return;
        setMarket(null);
        setReferral(null);
      });

    return () => {
      active = false;
    };
  }, []);

  async function connectWallet() {
    setWallet((current) => ({ ...current, status: "Opening WalletAuth" }));
    const nonceResponse = await fetch("/api/auth/nonce", { method: "POST" });
    const { nonce } = await nonceResponse.json();
    const result = await MiniKit.walletAuth({
      nonce,
      statement: "Sign in to NuCCa Genesis Studio.",
    });

    if (!("data" in result) || !result.data) {
      setWallet({ address: null, status: "WalletAuth failed" });
      return;
    }

    const verifyResponse = await fetch("/api/auth/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.data),
    });
    const verified = await verifyResponse.json();
    setWallet({
      address: verified.walletAddress ?? result.data.address,
      status: verified.ok
        ? "WalletAuth verified"
        : "Wallet connected, server not configured",
    });
  }

  async function verifyHumanSession() {
    setWorldStatus("Creating IDKit 4.x session");
    const rpResponse = await fetch("/api/world/rp-context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "session" }),
    });
    const context = await rpResponse.json();

    if (!context.ok) {
      setWorldStatus("RP signing not configured");
      return;
    }

    const { IDKit, CredentialRequest, any } = await import("@worldcoin/idkit");
    const request = await IDKit.createSession({
      app_id: context.app_id,
      rp_context: context.rp_context,
      environment: context.environment,
      action_description: "NuCCa proof-of-human onboarding",
      require_user_presence: true,
    }).constraints(any(CredentialRequest("proof_of_human")));

    if (request.connectorURI) {
      window.location.href = request.connectorURI;
      return;
    }

    const result = await request.pollUntilCompletion({
      timeout: 120_000,
      pollInterval: 1_500,
    });

    if (!result.success) {
      setWorldStatus(`IDKit failed: ${result.error}`);
      return;
    }

    const verifyResponse = await fetch("/api/world/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.result),
    });
    const verified = await verifyResponse.json();
    setWorldStatus(
      verified.ok ? "Human session verified" : "Verification pending server config",
    );
  }

  async function claimDaily() {
    setClaimStatus("Checking budget and cooldown");
    const response = await fetch("/api/claims/daily", { method: "POST" });
    const json = await response.json();
    setClaimStatus(
      json.ok
        ? `${formatNucca(json.claim.tokenReward)} NUCCA + ${json.claim.xpReward} XP`
        : json.message,
    );
  }

  async function queueAiJob(generatorId: string) {
    setAiStatus("Queueing free AI job");
    const response = await fetch("/api/ai/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        generatorId,
        prompt: "Create a futuristic NUCCA studio hook.",
      }),
    });
    const json = await response.json();
    setAiStatus(json.message ?? json.job?.status ?? "Queued");
  }

  async function createBuilderTrack() {
    setBuilderStatus("Building provenance manifest");
    const response = await fetch("/api/music/compositions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Genesis Battle Loop",
        sampleIds: SAMPLE_LIBRARY.slice(0, 3).map((sample) => sample.id),
        arrangement: "intro:8|drop:16|hook:8|outro:4",
      }),
    });
    const json = await response.json();
    if (!json.ok) {
      setBuilderStatus(json.message);
      return;
    }

    setLastCompositionId(json.composition.id);
    setBuilderStatus(
      json.composition.manifestHash
        ? `Ranked hash ${json.composition.manifestHash.slice(0, 10)}...`
        : "Ranked composition created",
    );
  }

  async function createBattle() {
    if (!lastCompositionId) {
      setBattleStatus("Create an in-app track first");
      return;
    }

    setBattleStatus("Opening battle room");
    const response = await fetch("/api/battles/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        compositionId: lastCompositionId,
        mode: "open",
        battleModeId: selectedBattleMode,
        battleFormatId: selectedBattleFormat,
        totalContestNucca: normalizedContestNucca,
      }),
    });
    const json = await response.json();
    setBattleStatus(json.ok ? json.message ?? `Battle ${json.battle.status}` : json.message);
  }

  return (
    <main className="noise min-h-screen pb-28">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-4">
        <header className="sticky top-0 z-20 -mx-4 border-b border-line bg-background/82 px-4 py-3 backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/80 bg-white shadow-lg shadow-orange-200/50">
                <Image
                  alt="NuCCa Genesis Studio logo"
                  className="object-cover"
                  fill
                  sizes="48px"
                  src="/brand/nucca-genesis-studio.png"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">
                  NuCCa
                </p>
                <h1 className="text-xl font-black tracking-tight">
                  Genesis Studio
                </h1>
              </div>
            </div>
            <MiniKitBoot />
          </div>
        </header>

        <section className="holo-border overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_24px_70px_rgba(49,61,94,0.17)]">
          <div className="relative">
            <Image
              alt="NuCCa Genesis Studio hero logo"
              className="aspect-[1.1/1] w-full object-cover"
              height={1000}
              priority
              src="/brand/nucca-genesis-studio.png"
              width={1000}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/88 to-transparent p-5 pt-24">
              <Badge className="border-orange-200 bg-white/80 text-accent">
                WorldChain creator universe
              </Badge>
              <h2 className="mt-3 text-3xl font-black leading-[0.96] tracking-tight text-foreground">
                Create. Upgrade. Battle. Earn.
              </h2>
              <p className="mt-2 max-w-xs text-sm font-medium leading-5 text-muted">
                A light futuristic music game where NUCCA unlocks creation,
                battles, clans, rankings, and creator status.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-line bg-white/75 p-3 text-center">
            <Metric label="Holders" value={formatNucca(TOKEN_FACTS.holders)} />
            <Metric label="Locked" value={`${TOKEN_FACTS.pufLockedPercent}%`} />
            <Metric label="Burned" value={`${TOKEN_FACTS.burnedPercent}%`} />
          </div>
        </section>

        {activeTab === "home" ? (
          <>
        <Card className="holo-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Mission Control</CardTitle>
              <p className="mt-1 text-sm text-muted">
                Wallet, human verification, and referral identity.
              </p>
            </div>
            <IconBubble icon={<ShieldCheck size={20} />} />
          </div>
          <div className="mt-4 grid gap-3">
            <StatusRow icon={<Wallet size={18} />} label="WalletAuth" value={wallet.address ? shortAddress(wallet.address) : wallet.status} />
            <StatusRow icon={<ShieldCheck size={18} />} label="World ID" value={worldStatus} />
            <StatusRow icon={<Users size={18} />} label="Referral code" value={referralCode} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button onClick={connectWallet}>Connect</Button>
            <Button onClick={verifyHumanSession} variant="secondary">
              Verify Human
            </Button>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Creator Identity</CardTitle>
              <p className="mt-1 text-sm text-muted">
                Upload your image, dress your performer, and make the music screen feel alive.
              </p>
            </div>
            <IconBubble icon={<ImageIcon size={20} />} />
          </div>
          <div className="mt-4 grid gap-3 rounded-3xl border border-line bg-white/60 p-3">
            <div className="grid grid-cols-[1fr_7rem] gap-3">
              <div className="relative min-h-52 overflow-hidden rounded-[28px] border border-line bg-gradient-to-b from-white via-cyan-50 to-orange-50">
                <div className="absolute inset-x-8 top-8 h-20 rounded-full bg-cyan-200/50 blur-2xl" />
                <div className="absolute inset-x-12 bottom-8 h-16 rounded-full bg-orange-200/60 blur-2xl" />
                <NuccaPerformer genre={selectedGenre} />
                <div className="absolute bottom-3 left-3 rounded-full border border-white/80 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-accent shadow-sm">
                  {currentGenre.label} performer
                </div>
              </div>
              <div className="grid gap-2">
                <div className="relative overflow-hidden rounded-3xl border-4 border-white bg-white shadow-xl shadow-orange-200/60">
                  <Image
                    alt="Creator profile image"
                    className="aspect-square object-cover"
                    height={160}
                    sizes="112px"
                    src="/brand/nucca-token.jpeg"
                    width={160}
                  />
                </div>
                <Button size="sm" variant="secondary">
                  Upload
                </Button>
              </div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
                Outfit genre
              </p>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {MUSIC_GENRES.map((genre) => (
                  <button
                    className={
                      selectedGenre === genre.id
                        ? "shrink-0 rounded-full bg-foreground px-3 py-2 text-xs font-black text-white shadow-lg"
                        : "shrink-0 rounded-full border border-line bg-white/75 px-3 py-2 text-xs font-black text-muted"
                    }
                    key={genre.id}
                    onClick={() => setSelectedGenre(genre.id)}
                    type="button"
                  >
                    {genre.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs leading-5 text-muted">
                {currentGenre.mood}. Built as lightweight layered animation for mobile; true 3D only after optimized assets.
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {genreOutfits.map((item) => (
              <div className="rounded-2xl border border-line bg-white/58 p-2" key={item.id}>
                <p className="truncate text-xs font-black">{item.name}</p>
                <p className="mt-1 text-[10px] uppercase text-muted">{item.slot}</p>
                <p className="mt-2 font-mono text-xs font-black">{item.priceNucca} NUCCA</p>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {CREATOR_STYLE_ITEMS.map((item) => (
              <div className="rounded-2xl border border-line bg-white/58 p-2" key={item.id}>
                <p className="truncate text-xs font-black">{item.name}</p>
                <p className="mt-1 text-[10px] uppercase text-muted">{item.rarity}</p>
                <p className="mt-2 font-mono text-xs font-black">{item.priceNucca} NUCCA</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-2xl border border-line bg-white/60 p-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
              Why it matters
            </p>
            <p className="mt-1 text-xs leading-5 text-muted">
              During playback and battles, the performer can dance, sing, and show the creator outfit instead of leaving the app as text-only music cards.
            </p>
          </div>
        </Card>
          </>
        ) : null}

        {activeTab === "music" ? (
        <Card className="holo-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Music Builder</CardTitle>
              <p className="mt-1 text-sm text-muted">
                Ranked songs are made from approved samples and saved with an in-app manifest hash.
              </p>
            </div>
            <IconBubble icon={<Headphones size={20} />} />
          </div>
          <div className="mt-4 grid gap-2">
            {SAMPLE_LIBRARY.slice(0, 4).map((sample) => (
              <div
                className="flex items-center justify-between rounded-2xl border border-line bg-white/58 p-3"
                key={sample.id}
              >
                <div>
                  <p className="text-sm font-black">{sample.name}</p>
                  <p className="text-xs text-muted">
                    {sample.type} / {sample.bpm} BPM / {sample.key}
                  </p>
                </div>
                <span className="rounded-full bg-cyan-50 px-2 py-1 text-[10px] font-black uppercase text-accent-2">
                  L{sample.unlockLevel}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-line bg-white/60 p-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
              Provenance status
            </p>
            <p className="mt-1 text-sm font-bold text-muted">{builderStatus}</p>
          </div>
          <Button className="mt-4 w-full" onClick={createBuilderTrack}>
            Build Ranked Track
          </Button>
        </Card>
        ) : null}

        {activeTab === "clans" ? (
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Clans</CardTitle>
              <p className="mt-1 text-sm text-muted">
                Join a label, build songs with your crew, and fight for the monthly league.
              </p>
            </div>
            <IconBubble icon={<Crown size={20} />} />
          </div>
          <div className="mt-4 grid gap-2">
            {CLANS.map((clan, index) => (
              <div
                className="flex items-center justify-between rounded-2xl border border-line bg-white/58 p-3"
                key={clan.id}
              >
                <div className="min-w-0">
                  <p className="text-sm font-black">
                    #{index + 1} {clan.name}
                  </p>
                  <p className="truncate text-xs text-muted">{clan.style}</p>
                </div>
                <span className="font-mono text-xs font-black">
                  {formatNucca(clan.monthlyPoints)} pts
                </span>
              </div>
            ))}
          </div>
        </Card>
        ) : null}

        {activeTab === "arena" ? (
          <>
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Battle Arena</CardTitle>
              <p className="mt-1 text-sm text-muted">
                In-app tracks enter solo or 3v3 skill battles with admin commission and monthly ranking reserve.
              </p>
            </div>
            <IconBubble icon={<Swords size={20} />} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {BATTLE_FORMATS.map((format) => {
              const active = selectedBattleFormat === format.id;
              return (
                <button
                  className={
                    active
                      ? "rounded-2xl border border-foreground bg-foreground p-3 text-left text-white shadow-lg"
                      : "rounded-2xl border border-line bg-white/58 p-3 text-left shadow-sm"
                  }
                  key={format.id}
                  onClick={() => setSelectedBattleFormat(format.id)}
                  type="button"
                >
                  <p className="text-sm font-black">{format.name}</p>
                  <p className={active ? "mt-1 text-xs text-white/70" : "mt-1 text-xs text-muted"}>
                    {format.teamSize} per side
                  </p>
                </button>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {BATTLE_MODES.map((mode) => {
              const split = calculateBattleSplit(
                mode,
                calculateMinimumContestNucca(mode, currentBattleFormat),
                currentBattleFormat,
              );
              const active = selectedBattleMode === mode.id;
              return (
                <button
                  className={
                    active
                      ? "rounded-2xl border border-foreground bg-foreground p-3 text-left text-white shadow-lg"
                      : "rounded-2xl border border-line bg-white/58 p-3 text-left shadow-sm"
                  }
                  key={mode.id}
                  onClick={() => setSelectedBattleMode(mode.id)}
                  type="button"
                >
                  <p className="text-sm font-black">{mode.name}</p>
                  <p className={active ? "mt-1 text-xs text-white/70" : "mt-1 text-xs text-muted"}>
                    {mode.durationHours}h / min {split.minimumContestNucca} NUCCA
                  </p>
                  <p className={active ? "mt-2 font-mono text-xs font-black text-white" : "mt-2 font-mono text-xs font-black"}>
                    {split.creatorEntryNucca} each
                  </p>
                  <p className={active ? "mt-1 text-[10px] text-white/70" : "mt-1 text-[10px] text-muted"}>
                    Winner: {split.creatorPrize} / Admin: {split.platformCommission}
                  </p>
                </button>
              );
            })}
          </div>
          <div className="mt-3 rounded-2xl border border-line bg-white/60 p-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
              Creator-funded pool
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[minimumContestNucca, minimumContestNucca * 2, minimumContestNucca * 5].map((amount) => (
                <button
                  className={
                    normalizedContestNucca === amount
                      ? "rounded-2xl bg-foreground px-2 py-2 font-mono text-xs font-black text-white"
                      : "rounded-2xl border border-line bg-white/70 px-2 py-2 font-mono text-xs font-black"
                  }
                  key={amount}
                  onClick={() => setCustomContestNucca(amount)}
                  type="button"
                >
                  {amount}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">
              No max cap. Each creator pays the same entry. Bigger pools increase admin commission and monthly prizes.
            </p>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Metric label="Creator prize" value={`${currentBattleSplit.creatorPrize}`} />
            <Metric label="Admin" value={`${currentBattleSplit.platformCommission}`} />
            <Metric label="Monthly" value={`${currentBattleSplit.monthlyLeagueReserve}`} />
          </div>
          <div className="mt-4 grid gap-2">
            {BATTLE_RULES.map((rule) => (
              <div className="rounded-2xl border border-line bg-white/58 p-3" key={rule.id}>
                <p className="text-sm font-black">{rule.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{rule.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-line bg-white/60 p-3">
            <p className="text-sm font-bold text-muted">{battleStatus}</p>
            <Button onClick={createBattle} size="sm" variant="secondary">
              Open
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Monthly Ranking</CardTitle>
              <p className="mt-1 text-sm text-muted">
                The monthly prize pool turns activity into a reason to return.
              </p>
            </div>
            <IconBubble icon={<Medal size={20} />} />
          </div>
          <div className="mt-4 grid gap-2">
            {MONTHLY_RANKING_RULES.slice(0, 4).map((rule) => (
              <div className="rounded-2xl border border-line bg-white/58 p-3 text-xs font-medium leading-5 text-muted" key={rule}>
                {rule}
              </div>
            ))}
          </div>
        </Card>
          </>
        ) : null}

        {activeTab === "home" ? (
          <>
        <Card className="overflow-hidden p-0">
          <div className="flex gap-4 p-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl border border-white bg-white shadow-xl shadow-cyan-200/50">
              <Image
                alt="NUCCA token logo"
                className="object-cover"
                fill
                sizes="96px"
                src="/brand/nucca-token.jpeg"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <CardTitle>NUCCA Market</CardTitle>
                <span className={market?.trustedForRewards ? "text-xs font-bold text-accent-2" : "text-xs font-bold text-warning"}>
                  {market?.trustedForRewards ? "trusted" : "guarded"}
                </span>
              </div>
              <p className="mt-2 text-3xl font-black tracking-tight">
                {formatUsd(market?.priceUsd)}
              </p>
              <p className="mt-1 text-xs text-muted">
                Dexscreener + Uniswap pool data with liquidity guards.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-line bg-white/60 p-3 text-center">
            <Metric label="Liquidity" value={formatUsd(market?.liquidityUsd)} />
            <Metric label="24h vol" value={formatUsd(market?.volume24h)} />
            <Metric label="24h txns" value={`${market?.txns24h ?? 0}`} />
          </div>
          {market?.warning ? (
            <p className="mx-4 mb-4 rounded-xl border border-warning/30 bg-orange-50 p-3 text-xs font-medium text-warning">
              {market.warning}
            </p>
          ) : null}
        </Card>

        <Card className="holo-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Swap Studio</CardTitle>
              <p className="mt-1 text-sm text-muted">
                Real Uniswap WorldChain routes for NUCCA/WLD and routed NUCCA/USDC.
              </p>
            </div>
            <IconBubble icon={<ArrowLeftRight size={20} />} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {SWAP_ROUTES.map((route) => (
              <button
                className={
                  selectedSwapRoute === route.id
                    ? "rounded-2xl border border-foreground bg-foreground p-3 text-left text-white shadow-lg"
                    : "rounded-2xl border border-line bg-white/58 p-3 text-left shadow-sm"
                }
                key={route.id}
                onClick={() => setSelectedSwapRoute(route.id)}
                type="button"
              >
                <p className="text-sm font-black">{route.label}</p>
                <p className={selectedSwapRoute === route.id ? "mt-1 text-xs text-white/70" : "mt-1 text-xs text-muted"}>
                  {route.routeType === "direct_pool" ? "Direct pool" : "Routed swap"}
                </p>
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-2xl border border-line bg-white/60 p-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
              Active route
            </p>
            <p className="mt-1 text-sm font-black">{currentSwapRoute.pathLabel}</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              {currentSwapRoute.liquidityNote}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-3 py-3 text-sm font-black text-white shadow-lg"
              href={currentSwapRoute.uniswapUrl}
              rel="noreferrer"
              target="_blank"
            >
              Uniswap <ExternalLink size={15} />
            </a>
            <a
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-line bg-white/70 px-3 py-3 text-sm font-black text-foreground shadow-sm"
              href={currentSwapRoute.dexscreenerUrl}
              rel="noreferrer"
              target="_blank"
            >
              Chart <ExternalLink size={15} />
            </a>
          </div>
          <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50/80 p-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-warning">
              Native in-app swap
            </p>
            <p className="mt-1 text-xs leading-5 text-warning">
              To execute swaps directly with MiniKit, the World Developer Portal must allowlist NUCCA, WLD, USDC, Permit2, and the Uniswap router. Until then, Uniswap is the real execution surface.
            </p>
          </div>
        </Card>

        <Card className="holo-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Aggressive Referrals</CardTitle>
              <p className="mt-1 text-sm text-muted">
                Max 100 friends with transparent monthly halving.
              </p>
            </div>
            <IconBubble icon={<Gift size={20} />} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Metric label="Max friends" value={`${referral?.maxFriends ?? 100}`} />
            <Metric label="You earn" value={`${formatNucca(referral?.referralReward ?? 0)}`} />
            <Metric label="Friend gets" value={`${formatNucca(referral?.referredUserBonus ?? 0)}`} />
          </div>
          <div className="mt-4 rounded-2xl border border-line bg-white/60 p-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
              Published rule
            </p>
            <p className="mt-1 text-sm font-medium leading-5 text-muted">
              Month 1: 1 NUCCA, month 2: 0.5, month 3: 0.25, then halves
              monthly. Budget, active users, and market trust can reduce token
              payout.
            </p>
          </div>
        </Card>
          </>
        ) : null}

        {activeTab === "claim" ? (
        <div className="grid gap-3">
          <Card className="min-h-40">
            <div className="flex items-center justify-between">
              <CardTitle>Daily Claim</CardTitle>
              <Gift className="text-accent" size={20} />
            </div>
            <p className="mt-4 text-sm font-bold">{claimStatus}</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              XP and energy remain available when token budget is guarded.
            </p>
            <Button className="mt-4 w-full" onClick={claimDaily} size="sm">
              Claim
            </Button>
          </Card>
        </div>
        ) : null}

        {activeTab === "music" ? (
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Free AI Creator Lab</CardTitle>
              <p className="mt-1 text-sm text-muted">
                Queued, capacity-aware, no paid AI providers.
              </p>
            </div>
            <IconBubble icon={<Bot size={20} />} />
          </div>
          <div className="mt-4 grid gap-3">
            {FREE_AI_GENERATORS.map((generator) => (
              <div
                className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white/58 p-3"
                key={generator.id}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{generator.name}</p>
                  <p className="truncate text-xs text-muted">
                    {generator.model} / {generator.license}
                  </p>
                </div>
                <Button
                  disabled={generator.dailyCap === 0}
                  onClick={() => queueAiJob(generator.id)}
                  size="sm"
                  variant="secondary"
                >
                  Queue
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs font-bold text-accent">{aiStatus}</p>
        </Card>
        ) : null}

        {activeTab === "arena" ? (
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Economy Engine</CardTitle>
            <Orbit className="text-accent-2" size={20} />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            <Metric label="Treasury" value={`${ECONOMY_SPLIT.treasury}%`} />
            <Metric label="Monthly" value={`${ECONOMY_SPLIT.monthlyLeagueReserve}%`} />
            <Metric label="AI" value={`${ECONOMY_SPLIT.aiReserve}%`} />
            <Metric label="Rewards" value={`${ECONOMY_SPLIT.rewardsReserve}%`} />
          </div>
        </Card>
        ) : null}

        <nav
          aria-label="NuCCa sections"
          className="fixed inset-x-0 bottom-0 z-20 border-t border-white/70 bg-white/84 px-3 py-2 shadow-[0_-16px_40px_rgba(49,61,94,0.12)] backdrop-blur-2xl"
        >
          <div className="mx-auto grid max-w-md grid-cols-5 gap-1 text-center text-[10px] font-bold text-muted">
            <Tab
              active={activeTab === "home"}
              icon={<Sparkles size={18} />}
              label="Home"
              onClick={() => setActiveTab("home")}
            />
            <Tab
              active={activeTab === "claim"}
              icon={<Gift size={18} />}
              label="Claim"
              onClick={() => setActiveTab("claim")}
            />
            <Tab
              active={activeTab === "music"}
              icon={<Headphones size={18} />}
              label="Music"
              onClick={() => setActiveTab("music")}
            />
            <Tab
              active={activeTab === "arena"}
              icon={<Trophy size={18} />}
              label="Arena"
              onClick={() => setActiveTab("arena")}
            />
            <Tab
              active={activeTab === "clans"}
              icon={<Users size={18} />}
              label="Clans"
              onClick={() => setActiveTab("clans")}
            />
          </div>
        </nav>
      </div>
    </main>
  );
}

function NuccaPerformer({ genre }: { genre: MusicGenre }) {
  const palette: Record<MusicGenre, { jacket: string; aura: string; accent: string }> = {
    rock: {
      jacket: "from-slate-950 to-zinc-700",
      aura: "bg-orange-300/50",
      accent: "bg-orange-500",
    },
    pop: {
      jacket: "from-pink-400 to-orange-300",
      aura: "bg-pink-200/60",
      accent: "bg-pink-500",
    },
    techno: {
      jacket: "from-cyan-500 to-slate-900",
      aura: "bg-cyan-300/60",
      accent: "bg-cyan-400",
    },
    commercial: {
      jacket: "from-white to-slate-300",
      aura: "bg-slate-200/70",
      accent: "bg-slate-400",
    },
    classical: {
      jacket: "from-slate-950 to-amber-800",
      aura: "bg-amber-200/60",
      accent: "bg-amber-500",
    },
    gospel: {
      jacket: "from-white to-yellow-200",
      aura: "bg-yellow-200/70",
      accent: "bg-yellow-500",
    },
    oriental: {
      jacket: "from-red-600 to-yellow-500",
      aura: "bg-red-200/60",
      accent: "bg-red-500",
    },
    trap: {
      jacket: "from-slate-950 to-purple-900",
      aura: "bg-purple-300/50",
      accent: "bg-purple-500",
    },
    latin: {
      jacket: "from-orange-500 to-red-500",
      aura: "bg-orange-200/70",
      accent: "bg-red-500",
    },
    afrobeat: {
      jacket: "from-emerald-500 to-yellow-500",
      aura: "bg-emerald-200/70",
      accent: "bg-emerald-500",
    },
    jazz: {
      jacket: "from-slate-900 to-yellow-900",
      aura: "bg-yellow-200/50",
      accent: "bg-yellow-600",
    },
    reggaeton: {
      jacket: "from-fuchsia-500 to-cyan-400",
      aura: "bg-fuchsia-200/60",
      accent: "bg-fuchsia-500",
    },
  };
  const style = palette[genre];

  return (
    <div className="performer-dance absolute inset-0 flex items-center justify-center pt-8">
      <div className={`absolute h-36 w-36 rounded-full blur-2xl ${style.aura}`} />
      <div className="relative h-44 w-32">
        <div className="absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2 rounded-full border border-orange-100 bg-gradient-to-b from-orange-100 to-orange-200 shadow-lg" />
        <div className="absolute left-1/2 top-7 h-4 w-14 -translate-x-1/2 rounded-full bg-slate-950 shadow-sm" />
        <div className={`absolute left-1/2 top-16 h-20 w-24 -translate-x-1/2 rounded-t-[34px] rounded-b-2xl bg-gradient-to-br ${style.jacket} shadow-xl`} />
        <div className="absolute left-2 top-20 h-14 w-5 -rotate-12 rounded-full bg-slate-800 shadow-md" />
        <div className="absolute right-2 top-20 h-14 w-5 rotate-12 rounded-full bg-slate-800 shadow-md" />
        <div className={`absolute left-1/2 top-[5.75rem] h-3 w-16 -translate-x-1/2 rounded-full ${style.accent}`} />
        <div className="absolute bottom-6 left-9 h-12 w-5 rounded-full bg-slate-900 shadow-md" />
        <div className="absolute bottom-6 right-9 h-12 w-5 rounded-full bg-slate-900 shadow-md" />
        <div className="absolute bottom-3 left-7 h-4 w-9 rounded-full bg-white shadow-md" />
        <div className="absolute bottom-3 right-7 h-4 w-9 rounded-full bg-white shadow-md" />
        <div className="absolute -bottom-1 left-1/2 h-3 w-28 -translate-x-1/2 rounded-full bg-slate-900/10 blur-sm" />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white/58 p-2 shadow-sm">
      <p className="truncate font-mono text-sm font-black">{value}</p>
      <p className="mt-1 truncate text-[10px] uppercase tracking-wide text-muted">
        {label}
      </p>
    </div>
  );
}

function StatusRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white/58 p-3 shadow-sm">
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <span className="max-w-[11rem] truncate text-right text-sm font-black">
        {value}
      </span>
    </div>
  );
}

function IconBubble({ icon }: { icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3 text-accent shadow-sm">
      {icon}
    </div>
  );
}

function Tab({
  active,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "flex min-w-0 flex-col items-center gap-1 rounded-2xl bg-foreground px-1.5 py-1.5 text-white shadow-lg"
          : "flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1.5 py-1.5 text-muted"
      }
      onClick={onClick}
      type="button"
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
