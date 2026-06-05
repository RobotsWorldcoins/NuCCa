"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Bot,
  Crown,
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
  Zap,
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
  CREATOR_STYLE_ITEMS,
  MONTHLY_RANKING_RULES,
  SAMPLE_LIBRARY,
} from "@/lib/game";
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

export function GenesisStudioApp() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    status: "Disconnected",
  });
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
            <Metric label="Clans" value={`${CLANS.length}`} />
          </div>
        </section>

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
                Use a visual creator image with cosmetic frames, badges, stages,
                and battle entrances.
              </p>
            </div>
            <IconBubble icon={<ImageIcon size={20} />} />
          </div>
          <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-white/60">
            <div className="relative h-36">
              <Image
                alt="Creator identity background"
                className="object-cover"
                fill
                sizes="448px"
                src="/brand/nucca-genesis-studio.png"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
            </div>
            <div className="-mt-14 flex items-end gap-4 p-4 pt-0">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[32px] border-4 border-white bg-white shadow-xl shadow-orange-200/60">
                <Image
                  alt="Creator profile image"
                  className="object-cover"
                  fill
                  sizes="112px"
                  src="/brand/nucca-token.jpeg"
                />
              </div>
              <div className="relative min-w-0 flex-1 pb-2">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
                  Level 1
                </p>
                <p className="truncate text-xl font-black">Genesis Creator</p>
                <p className="mt-1 text-xs text-muted">
                  Cosmetic identity only. No hidden power boost.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {CREATOR_STYLE_ITEMS.map((item) => (
              <div className="rounded-2xl border border-line bg-white/58 p-2" key={item.id}>
                <p className="truncate text-xs font-black">{item.name}</p>
                <p className="mt-1 text-[10px] uppercase text-muted">{item.rarity}</p>
                <p className="mt-2 font-mono text-xs font-black">{item.priceNucca} NUCCA</p>
              </div>
            ))}
          </div>
        </Card>

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

        <div className="grid grid-cols-2 gap-3">
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

          <Card className="min-h-40">
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Split</CardTitle>
              <Zap className="text-accent" size={20} />
            </div>
            <p className="mt-4 text-4xl font-black">{ECONOMY_SPLIT.treasury}%</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Admin treasury share from premium spends and battle fees.
            </p>
          </Card>
        </div>

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

        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/70 bg-white/84 px-4 py-2 shadow-[0_-16px_40px_rgba(49,61,94,0.12)] backdrop-blur-2xl">
          <div className="mx-auto grid max-w-md grid-cols-4 text-center text-[11px] font-bold text-muted">
            <Tab active icon={<Sparkles size={18} />} label="Studio" />
            <Tab icon={<Gift size={18} />} label="Claim" />
            <Tab icon={<Users size={18} />} label="Clans" />
            <Tab icon={<Trophy size={18} />} label="Leagues" />
          </div>
        </nav>
      </div>
    </main>
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
}: {
  active?: boolean;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      className={
        active
          ? "flex flex-col items-center gap-1 rounded-2xl bg-foreground px-2 py-1.5 text-white shadow-lg"
          : "flex flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-muted"
      }
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
