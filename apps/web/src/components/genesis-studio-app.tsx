"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeftRight,
  Bot,
  Clock3,
  Copy,
  Crown,
  ExternalLink,
  Gift,
  Headphones,
  ImageIcon,
  LockKeyhole,
  Map as MapIcon,
  Medal,
  Orbit,
  Plus,
  Radar,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Users,
  X,
  Zap,
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
import {
  ECONOMY_SPLIT,
  PUF_LOCKS,
  TOKEN_FACTS,
  TREASURY_POLICY,
} from "@/lib/constants";
import { DAILY_REWARD_POLICY } from "@/lib/economy";
import {
  BATTLE_RULES,
  CLAN_CREATION_COST_NUCCA,
  CLAN_MAX_MEMBERS,
  CLANS,
  CREATOR_MARKETPLACE_LISTINGS,
  CREATOR_OUTFIT_ITEMS,
  CREATOR_STYLE_ITEMS,
  DISCOVERY_RULES,
  GENESIS_MAP_ZONES,
  MUSIC_GENRES,
  MONTHLY_RANKING_ROWS,
  MONTHLY_RANKING_RULES,
  RANKING_SCORING_RULES,
  SAMPLE_LIBRARY,
  SAMPLE_LIBRARY_COUNTS,
  SAMPLE_TYPE_LABELS,
  addAttributes,
  battlePowerFromAttributes,
  reputationEffortMultiplier,
  type ItemAttributeId,
  type MusicGenre,
  type SampleType,
} from "@/lib/game";
import {
  SWAP_ROUTES,
  SWAP_TOKEN_DECIMALS,
  decimalToBaseUnits,
  worldSwapQuickActionUrl,
  type SwapRouteId,
} from "@/lib/swap";
import {
  createBestReferralCode,
  normalizeReferralCode,
} from "@/lib/referrals";
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

type ChainState = {
  totalSupply: number;
  burnedTokens: number;
  burnedPercent: number | null;
  reportedHolders: number;
  rewardReserveBalance: number | null;
  fetchedAt: string;
};

type MapScanState = {
  zone: { id: string; name: string };
  paid: boolean;
  paidCostNucca: number;
  reward: {
    type: string;
    name: string;
    description: string;
    rarity: string;
    xp?: number;
    energy?: number;
    reputationPoints?: number;
    attributes?: Partial<Record<ItemAttributeId, number>>;
  };
  tokenReward: number;
  rankingPoints: number;
};

type TabKey = "home" | "claim" | "music" | "arena" | "ranking" | "clans";
type WorldProfile = {
  username: string | null;
  profilePictureUrl: string | null;
  referralCode: string | null;
};
const DEV_MODE_ENABLED = process.env.NODE_ENV !== "production";

function initialReferralCodeFromUrl() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  const code = params.get("ref") ?? params.get("code");
  return code ? normalizeReferralCode(code) : "";
}

export function GenesisStudioApp() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    status: "Disconnected",
  });
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [market, setMarket] = useState<MarketState | null>(null);
  const [chain, setChain] = useState<ChainState | null>(null);
  const [referral, setReferral] = useState<ReferralState | null>(null);
  const [worldProfile, setWorldProfile] = useState<WorldProfile>({
    username: null,
    profilePictureUrl: null,
    referralCode: null,
  });
  const [referralInput, setReferralInput] = useState(initialReferralCodeFromUrl);
  const [referralClaimStatus, setReferralClaimStatus] = useState(() =>
    initialReferralCodeFromUrl()
      ? "Referral code detected from invite link."
      : "Use a friend link or code.",
  );
  const [claimStatus, setClaimStatus] = useState("Ready");
  const [mapStatus, setMapStatus] = useState("One free discovery scan available today.");
  const [worldStatus, setWorldStatus] = useState("Not verified");
  const [aiStatus, setAiStatus] = useState("Idle");
  const [lastMapScan, setLastMapScan] = useState<MapScanState | null>(null);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [builderStatus, setBuilderStatus] = useState("No ranked track yet");
  const [battleStatus, setBattleStatus] = useState("No active battle");
  const [lastCompositionId, setLastCompositionId] = useState<string | null>(null);
  const [builtTrack, setBuiltTrack] = useState<{
    id: string;
    title: string;
    manifestHash: string | null;
    sampleIds: string[];
  } | null>(null);
  const [selectedBattleMode, setSelectedBattleMode] =
    useState<BattleModeId>("genesis-duel");
  const [selectedBattleFormat, setSelectedBattleFormat] =
    useState<BattleFormatId>("solo-1v1");
  const [customContestNucca, setCustomContestNucca] = useState(1000);
  const [selectedGenre, setSelectedGenre] = useState<MusicGenre>("techno");
  const [selectedSwapRoute, setSelectedSwapRoute] =
    useState<SwapRouteId>("nucca-wld");
  const [swapAmount, setSwapAmount] = useState("1");
  const [swapStatus, setSwapStatus] = useState("World Swap Quick Action ready.");
  const [selectedSampleType, setSelectedSampleType] =
    useState<SampleType>("kick");
  const [selectedMapZone, setSelectedMapZone] = useState(GENESIS_MAP_ZONES[0].id);
  const [selectedSampleIds, setSelectedSampleIds] = useState<string[]>([
    "kick-001",
    "bass-001",
    "lead-001",
    "vocal-001",
  ]);
  const [clanSearch, setClanSearch] = useState("");
  const [clanName, setClanName] = useState("");
  const [clanStyle, setClanStyle] = useState("Techno / trap / futuristic");
  const [clanFocus, setClanFocus] = useState("Crew 3v3 battles and monthly ranking");
  const [clanLogoPreview, setClanLogoPreview] = useState<string | null>(null);
  const [clanStatus, setClanStatus] = useState(
    "Create a clan only after the 100,000 NUCCA treasury payment is confirmed.",
  );

  const referralCode = useMemo(() => {
    if (worldProfile.referralCode) return worldProfile.referralCode;
    if (!wallet.address) return "Connect wallet";
    return createBestReferralCode({
      username: worldProfile.username,
      walletAddress: wallet.address,
    });
  }, [wallet.address, worldProfile.referralCode, worldProfile.username]);

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
  const swapAmountBaseUnits = decimalToBaseUnits(
    swapAmount,
    SWAP_TOKEN_DECIMALS[currentSwapRoute.inputSymbol],
  );
  const worldSwapUrl = swapAmountBaseUnits
    ? worldSwapQuickActionUrl({
        route: currentSwapRoute,
        amountBaseUnits: swapAmountBaseUnits,
        sourceAppId: process.env.NEXT_PUBLIC_WORLD_APP_ID,
      })
    : null;
  const equippedOutfits = genreOutfits.slice(0, 2);
  const equippedStyleItems = CREATOR_STYLE_ITEMS.slice(0, 2);
  const equippedItems = [...equippedOutfits, ...equippedStyleItems];
  const equippedAttributes = addAttributes(equippedItems);
  const creatorReputation = equippedItems.reduce(
    (total, item) => total + item.reputationPoints,
    0,
  );
  const creatorBattlePower = battlePowerFromAttributes(
    equippedAttributes,
    creatorReputation,
  );
  const bandReputation = creatorReputation * 3;
  const rivalBandReputation = Math.max(1, Math.round(bandReputation / 2));
  const bandEffortMultiplier = reputationEffortMultiplier(
    bandReputation,
    rivalBandReputation,
  );
  const totalVisibleLocked = PUF_LOCKS.reduce(
    (total, lock) => total + lock.amountNucca,
    0,
  );
  const nextLock = PUF_LOCKS.map((lock) => ({
    ...lock,
    remainingMs: new Date(lock.unlocksAt).getTime() - now.getTime(),
  }))
    .filter((lock) => lock.remainingMs > 0)
    .sort((a, b) => a.remainingMs - b.remainingMs)[0];
  const rankingPrizePool = MONTHLY_RANKING_ROWS.reduce(
    (total, row) => total + row.prizeNucca,
    0,
  );
  const visibleSamples = SAMPLE_LIBRARY.filter(
    (sample) => sample.type === selectedSampleType,
  ).slice(0, 18);
  const selectedSamples = SAMPLE_LIBRARY.filter((sample) =>
    selectedSampleIds.includes(sample.id),
  );
  const selectedZone =
    GENESIS_MAP_ZONES.find((zone) => zone.id === selectedMapZone) ??
    GENESIS_MAP_ZONES[0];
  const tabBackground = `/backgrounds/${activeTab}.webp`;
  const filteredClans = CLANS.filter((clan) => {
    const query = clanSearch.trim().toLowerCase();
    if (!query) return true;
    return [clan.name, clan.style, clan.focus].some((value) =>
      value.toLowerCase().includes(query),
    );
  });

  useEffect(() => {
    let active = true;

    Promise.all([
      fetch("/api/market/nucca").then((response) => response.json()),
      fetch("/api/referrals/summary").then((response) => response.json()),
      fetch("/api/chain/nucca").then((response) => response.json()),
    ])
      .then(([marketJson, referralJson, chainJson]) => {
        if (!active) return;
        setMarket(marketJson.market);
        setReferral(referralJson.referral);
        setChain(chainJson.chain ?? null);
      })
      .catch(() => {
        if (!active) return;
        setMarket(null);
        setReferral(null);
        setChain(null);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!lockModalOpen) return;
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [lockModalOpen]);

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
    const walletAddress = verified.walletAddress ?? result.data.address;
    setWallet({
      address: walletAddress,
      status: verified.ok
        ? "WalletAuth verified"
        : "Wallet connected, server not configured",
    });
    await resolveAndPersistWorldProfile(walletAddress);
  }

  async function startDevSession() {
    setWallet((current) => ({ ...current, status: "Creating local preview" }));
    const response = await fetch("/api/auth/dev-session", { method: "POST" });
    const json = await response.json();
    setWallet({
      address: json.walletAddress ?? null,
      status: json.ok ? "Local preview session" : json.message,
    });
    if (json.walletAddress) {
      await persistWorldProfile({
        walletAddress: json.walletAddress,
        username: "localpreview",
        profilePictureUrl: null,
      });
    }
  }

  async function resolveAndPersistWorldProfile(walletAddress: string) {
    const minikit = MiniKit as typeof MiniKit & {
      user?: { username?: string; profilePictureUrl?: string };
      getUserByAddress?: (address: string) => Promise<{
        username?: string;
        profilePictureUrl?: string;
      } | null>;
    };

    let username = minikit.user?.username ?? null;
    let profilePictureUrl = minikit.user?.profilePictureUrl ?? null;

    if (!username && minikit.getUserByAddress) {
      const worldUser = await minikit.getUserByAddress(walletAddress).catch(() => null);
      username = worldUser?.username ?? null;
      profilePictureUrl = worldUser?.profilePictureUrl ?? profilePictureUrl;
    }

    await persistWorldProfile({ walletAddress, username, profilePictureUrl });
  }

  async function persistWorldProfile({
    walletAddress,
    username,
    profilePictureUrl,
  }: {
    walletAddress: string;
    username: string | null;
    profilePictureUrl: string | null;
  }) {
    const response = await fetch("/api/users/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, profilePictureUrl }),
    });
    const json = await response.json();
    const referralCodeValue =
      json.profile?.referral_code ??
      json.profile?.referralCode ??
      createBestReferralCode({ username, walletAddress });
    setWorldProfile({
      username,
      profilePictureUrl,
      referralCode: referralCodeValue,
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

  async function scanGenesisMap(paid: boolean) {
    setMapStatus(
      paid
        ? `Scanning extra route for ${DAILY_REWARD_POLICY.paidMapScanCostNucca} NUCCA`
        : "Scanning free daily route",
    );
    const response = await fetch("/api/map/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zoneId: selectedZone.id, paid }),
    });
    const json = await response.json();

    if (!json.ok) {
      setMapStatus(json.message ?? "Map scan failed.");
      return;
    }

    setLastMapScan(json.scan);
    setMapStatus(
      `${json.scan.reward.name}: +${json.scan.reward.xp ?? 0} XP, +${json.scan.rankingPoints} ranking pts${
        json.scan.tokenReward > 0
          ? `, ${formatNucca(json.scan.tokenReward)} NUCCA`
          : ""
      }`,
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
    if (selectedSampleIds.length < 2) {
      setBuilderStatus("Select at least two samples");
      return;
    }

    setBuilderStatus("Building provenance manifest");
    const response = await fetch("/api/music/compositions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Genesis Battle Loop",
        sampleIds: selectedSampleIds,
        arrangement: "intro:8|drop:16|hook:8|outro:4",
      }),
    });
    const json = await response.json();
    if (!json.ok) {
      setBuilderStatus(json.message);
      return;
    }

    const composition = json.composition;
    const manifestHash = composition.manifestHash ?? composition.manifest_hash ?? null;
    const sampleIds = composition.sampleIds ?? composition.sample_ids ?? selectedSampleIds;
    setLastCompositionId(composition.id);
    setBuiltTrack({
      id: composition.id,
      title: composition.title ?? "Genesis Battle Loop",
      manifestHash,
      sampleIds,
    });
    setBuilderStatus(
      manifestHash
        ? `Ranked hash ${manifestHash.slice(0, 10)}...`
        : "Ranked composition created",
    );
  }

  async function shareInvite() {
    if (!wallet.address || referralCode === "Connect wallet") {
      setReferralClaimStatus("Connect wallet before sharing your code.");
      return;
    }

    const invitePath = `/?ref=${encodeURIComponent(referralCode)}`;
    const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID;
    const inviteLink = appId
      ? `https://world.org/mini-app?app_id=${appId}&path=${encodeURIComponent(invitePath)}`
      : `https://nucca.vercel.app${invitePath}`;

    const minikit = MiniKit as typeof MiniKit & {
      share?: (input: { title: string; text: string; url: string }) => Promise<unknown>;
    };

    if (minikit.share) {
      await minikit
        .share({
          title: "Join NuCCa Genesis Studio",
          text: `Use my NuCCa code ${referralCode}. We both get rewards when you qualify.`,
          url: inviteLink,
        })
        .then(() => setReferralClaimStatus("Invite shared through World App."))
        .catch(() => setReferralClaimStatus("Share cancelled."));
      return;
    }

    await navigator.clipboard?.writeText(inviteLink).catch(() => undefined);
    setReferralClaimStatus("Invite link copied.");
  }

  async function claimReferralCode() {
    if (!wallet.address) {
      setReferralClaimStatus("Connect wallet before using a referral code.");
      return;
    }

    const code = normalizeReferralCode(referralInput);
    if (!code) {
      setReferralClaimStatus("Enter a valid referral code.");
      return;
    }

    if (code === normalizeReferralCode(referralCode)) {
      setReferralClaimStatus("You cannot use your own referral code.");
      return;
    }

    const response = await fetch("/api/referrals/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, ownCode: referralCode }),
    });
    const json = await response.json();
    setReferralClaimStatus(json.ok ? "Referral accepted." : json.message);
  }

  function toggleSample(sampleId: string) {
    setSelectedSampleIds((current) => {
      if (current.includes(sampleId)) {
        if (current.length <= 2) return current;
        return current.filter((id) => id !== sampleId);
      }

      if (current.length >= 12) return current;
      return [...current, sampleId];
    });
  }

  async function createClan() {
    setClanStatus("Preparing clan creation");
    const response = await fetch("/api/clans/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: clanName,
        style: clanStyle,
        focus: clanFocus,
      }),
    });
    const json = await response.json();
    setClanStatus(json.message ?? "Clan request checked");
  }

  function selectClanLogo(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setClanStatus("Clan logo must be an image.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setClanLogoPreview(previewUrl);
    setClanStatus(
      "Logo preview ready. Production upload should store this in Supabase Storage or R2 before clan creation.",
    );
  }

  function openWorldSwap() {
    if (!worldSwapUrl) {
      setSwapStatus("Enter a valid amount first.");
      return;
    }

    setSwapStatus("Opening World Swap inside World App.");
    window.location.href = worldSwapUrl;
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
    <main
      className="min-h-screen bg-cover bg-fixed bg-center pb-28"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(251, 253, 255, 0.92) 0%, rgba(241, 247, 255, 0.88) 48%, rgba(255, 247, 237, 0.92) 100%), url(${tabBackground})`,
      }}
    >
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
            <Metric label="Holders" value={formatNucca(chain?.reportedHolders ?? TOKEN_FACTS.holders)} />
            <Metric
              label="Locked"
              onClick={() => setLockModalOpen(true)}
              value={`${TOKEN_FACTS.pufLockedPercent}%`}
            />
            <Metric label="Burned" value={`${chain?.burnedPercent?.toFixed(2) ?? TOKEN_FACTS.burnedPercent}%`} />
          </div>
        </section>

        {lockModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-end bg-slate-950/55 p-3 backdrop-blur-xl">
            <div className="mx-auto max-h-[88vh] w-full max-w-md overflow-y-auto rounded-[32px] border border-white/10 bg-[#0b0d10] p-5 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <button
                  aria-label="Close locks"
                  className="rounded-2xl border border-white/10 bg-white/5 p-2"
                  onClick={() => setLockModalOpen(false)}
                  type="button"
                >
                  <X size={22} />
                </button>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                    PUF Wallet
                  </p>
                  <h2 className="text-xl font-black">My Locks</h2>
                </div>
                <div className="h-10 w-10" />
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                <DarkMetric label="Locked" value="6" />
                <DarkMetric label="Visible" value={`${formatNucca(totalVisibleLocked / 1_000_000)}M`} />
                <DarkMetric label="Reported" value={`${TOKEN_FACTS.pufLockedPercent}%`} />
              </div>
              <div className="mt-4 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <div className="flex items-center gap-2 text-emerald-300">
                  <Clock3 size={16} />
                  <p className="text-xs font-black uppercase tracking-[0.16em]">
                    Next unlock clock
                  </p>
                </div>
                <p className="mt-2 font-mono text-3xl font-black">
                  {nextLock ? formatLockCountdown(nextLock.remainingMs) : "Unlocked"}
                </p>
                <p className="mt-1 text-xs font-bold text-white/55">
                  {nextLock
                    ? `${formatNucca(nextLock.amountNucca)} NUCCA unlocks on ${formatLockDate(nextLock.unlocksAt)}`
                    : "No future visible locks in the current manual schedule."}
                </p>
              </div>
              <div className="mt-5 grid gap-4">
                {PUF_LOCKS.map((lock) => {
                  const remainingMs = new Date(lock.unlocksAt).getTime() - now.getTime();
                  return (
                    <div className="flex items-center justify-between gap-4" key={lock.id}>
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-emerald-400 bg-white">
                          <Image
                            alt="NUCCA lock"
                            className="object-cover"
                            fill
                            sizes="56px"
                            src="/brand/nucca-token.jpeg"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-lg font-black">
                            {formatNucca(lock.amountNucca / 1_000_000)}M NUCCA
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-sm font-bold text-white/55">
                            <LockKeyhole className="text-emerald-300" size={15} />
                            {remainingMs > 0 ? formatLockCountdown(remainingMs) : "Unlocked"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black">{formatUsd(lock.usdValue)}</p>
                        <p className="mt-1 text-sm font-bold text-white/45">
                          {formatLockDate(lock.unlocksAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs font-medium leading-5 text-white/55">
                These values are manually mirrored from the PUF Wallet screenshot for community transparency. On-chain lock reading should replace this before using it as an audit source.
              </p>
            </div>
          </div>
        ) : null}

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
          <div className={DEV_MODE_ENABLED ? "mt-4 grid grid-cols-3 gap-2" : "mt-4 grid grid-cols-2 gap-2"}>
            <Button onClick={connectWallet}>Connect</Button>
            <Button onClick={verifyHumanSession} variant="secondary">
              Verify Human
            </Button>
            {DEV_MODE_ENABLED ? (
              <Button onClick={startDevSession} variant="secondary">
                Demo
              </Button>
            ) : null}
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
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Metric label="Creator rep" value={`${creatorReputation}`} />
            <Metric label="Battle power" value={`${creatorBattlePower}`} />
            <Metric label="Equipped" value={`${equippedOutfits.length + equippedStyleItems.length}`} />
          </div>
          <AttributeGrid attributes={equippedAttributes} />
          <div className="mt-3 grid grid-cols-3 gap-2">
            {genreOutfits.map((item) => (
              <div className="rounded-2xl border border-line bg-white/58 p-2" key={item.id}>
                <p className="truncate text-xs font-black">{item.name}</p>
                <p className="mt-1 text-[10px] uppercase text-muted">{item.slot}</p>
                <p className="mt-2 font-mono text-xs font-black">{item.priceNucca} NUCCA</p>
                <p className="mt-1 text-[10px] font-black text-accent">+{item.reputationPoints} rep</p>
                <p className="mt-1 text-[10px] leading-4 text-muted">{formatAttributes(item.attributes)}</p>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {CREATOR_STYLE_ITEMS.map((item) => (
              <div className="rounded-2xl border border-line bg-white/58 p-2" key={item.id}>
                <p className="truncate text-xs font-black">{item.name}</p>
                <p className="mt-1 text-[10px] uppercase text-muted">{item.rarity}</p>
                <p className="mt-2 font-mono text-xs font-black">{item.priceNucca} NUCCA</p>
                <p className="mt-1 text-[10px] font-black text-accent">+{item.reputationPoints} rep</p>
                <p className="mt-1 text-[10px] leading-4 text-muted">{formatAttributes(item.attributes)}</p>
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
          <div className="mt-4 grid grid-cols-5 gap-2 text-center">
            {(Object.keys(SAMPLE_TYPE_LABELS) as SampleType[]).map((type) => (
              <button
                className={
                  selectedSampleType === type
                    ? "rounded-2xl bg-foreground px-2 py-2 text-white shadow-lg"
                    : "rounded-2xl border border-line bg-white/60 px-2 py-2 text-muted"
                }
                key={type}
                onClick={() => setSelectedSampleType(type)}
                type="button"
              >
                <p className="truncate text-[10px] font-black">
                  {SAMPLE_TYPE_LABELS[type]}
                </p>
                <p className="mt-1 font-mono text-[10px] font-black">
                  {SAMPLE_LIBRARY_COUNTS[type]}
                </p>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-line bg-white/60 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
                Selected samples
              </p>
              <span className="font-mono text-xs font-black">
                {selectedSampleIds.length}/12
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedSamples.map((sample) => (
                <button
                  className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-black text-foreground"
                  key={sample.id}
                  onClick={() => toggleSample(sample.id)}
                  type="button"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto pr-1">
            {visibleSamples.map((sample) => {
              const selected = selectedSampleIds.includes(sample.id);
              return (
                <button
                  className={
                    selected
                      ? "flex items-center justify-between rounded-2xl border border-foreground bg-foreground p-3 text-left text-white shadow-lg"
                      : "flex items-center justify-between rounded-2xl border border-line bg-white/58 p-3 text-left shadow-sm"
                  }
                  key={sample.id}
                  onClick={() => toggleSample(sample.id)}
                  type="button"
                >
                  <div>
                    <p className="text-sm font-black">{sample.name}</p>
                    <p className={selected ? "text-xs text-white/70" : "text-xs text-muted"}>
                      {sample.bpm} BPM / {sample.key} / {sample.license}
                    </p>
                  </div>
                  <span className={selected ? "rounded-full bg-white/15 px-2 py-1 text-[10px] font-black uppercase" : "rounded-full bg-cyan-50 px-2 py-1 text-[10px] font-black uppercase text-accent-2"}>
                    L{sample.unlockLevel}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 rounded-2xl border border-line bg-white/60 p-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
              Provenance status
            </p>
            <p className="mt-1 text-sm font-bold text-muted">{builderStatus}</p>
            {builtTrack ? (
              <div className="mt-3 rounded-2xl border border-white bg-white/70 p-3">
                <p className="text-sm font-black">{builtTrack.title}</p>
                <p className="mt-1 font-mono text-[11px] text-muted">
                  ID: {builtTrack.id.slice(0, 14)}...
                </p>
                <p className="mt-1 font-mono text-[11px] text-muted">
                  Hash: {builtTrack.manifestHash?.slice(0, 18) ?? "pending"}...
                </p>
                <p className="mt-2 text-xs font-bold text-accent">
                  This is the track used when you open a battle in Arena.
                </p>
              </div>
            ) : null}
          </div>
          <Button className="mt-4 w-full" onClick={createBuilderTrack}>
            Build Ranked Track
          </Button>
        </Card>
        ) : null}

        {activeTab === "clans" ? (
          <>
        <Card className="holo-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Create Clan</CardTitle>
              <p className="mt-1 text-sm text-muted">
                Clan ownership costs 100,000 NUCCA and is paid to the admin treasury.
              </p>
            </div>
            <IconBubble icon={<LockKeyhole size={20} />} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Metric label="Create cost" value={formatNucca(CLAN_CREATION_COST_NUCCA)} />
            <Metric label="Members" value={`${CLAN_MAX_MEMBERS} max`} />
            <Metric label="Battle team" value="3v3" />
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-white/60 p-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white bg-white shadow-lg">
              {clanLogoPreview ? (
                <Image
                  alt="Clan logo preview"
                  className="object-cover"
                  fill
                  sizes="64px"
                  src={clanLogoPreview}
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-100 to-orange-100">
                  <Crown className="text-accent" size={24} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black">Clan mini thumb</p>
              <p className="mt-1 text-xs text-muted">
                Upload a small logo for ranking and battle cards.
              </p>
              <input
                accept="image/*"
                className="mt-2 block w-full text-xs font-bold text-muted file:mr-3 file:rounded-xl file:border-0 file:bg-foreground file:px-3 file:py-2 file:text-xs file:font-black file:text-white"
                onChange={(event) => selectClanLogo(event.target.files?.[0] ?? null)}
                type="file"
              />
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <input
              className="rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm font-bold outline-none"
              maxLength={32}
              onChange={(event) => setClanName(event.target.value)}
              placeholder="Clan name"
              value={clanName}
            />
            <input
              className="rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm font-bold outline-none"
              maxLength={80}
              onChange={(event) => setClanStyle(event.target.value)}
              placeholder="Music style"
              value={clanStyle}
            />
            <input
              className="rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm font-bold outline-none"
              maxLength={120}
              onChange={(event) => setClanFocus(event.target.value)}
              placeholder="Clan focus"
              value={clanFocus}
            />
          </div>
          <Button className="mt-4 w-full" onClick={createClan}>
            <Plus size={16} /> Prepare 100k NUCCA Clan
          </Button>
          <p className="mt-3 rounded-2xl border border-line bg-white/60 p-3 text-xs font-medium leading-5 text-muted">
            {clanStatus}
          </p>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Find Clans</CardTitle>
              <p className="mt-1 text-sm text-muted">
                Search labels, styles, and battle focus. Each clan is capped at three members.
              </p>
            </div>
            <IconBubble icon={<Crown size={20} />} />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-line bg-white/70 px-3 py-2">
            <Search className="text-muted" size={18} />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none"
              onChange={(event) => setClanSearch(event.target.value)}
              placeholder="Search clans"
              value={clanSearch}
            />
          </div>
          <div className="mt-4 grid gap-2">
            {filteredClans.map((clan, index) => (
              <div
                className="rounded-2xl border border-line bg-white/58 p-3"
                key={clan.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-black">
                      #{index + 1} {clan.name}
                    </p>
                    <p className="truncate text-xs text-muted">{clan.style}</p>
                    <p className="mt-1 truncate text-[11px] font-bold text-accent">
                      {clan.motto}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-black">
                    {formatNucca(clan.monthlyPoints)} pts
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <Metric label="Members" value={`${clan.members}/${clan.maxMembers}`} />
                  <Metric label="Rep" value={`${clan.reputation}`} />
                  <Metric label="Win rate" value={`${clan.winRate}%`} />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <Metric label="Wins" value={`${clan.wins}`} />
                  <Metric label="Week battles" value={`${clan.weeklyBattles}`} />
                  <Metric label="Create cost" value={formatNucca(clan.creationCostNucca)} />
                </div>
                <p className="mt-3 rounded-2xl border border-line bg-white/62 p-3 text-xs font-medium leading-5 text-muted">
                  {clan.focus}
                </p>
              </div>
            ))}
            {filteredClans.length === 0 ? (
              <p className="rounded-2xl border border-line bg-white/58 p-3 text-sm font-bold text-muted">
                No clans found.
              </p>
            ) : null}
          </div>
        </Card>
          </>
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
          <div className="mt-4 rounded-2xl border border-line bg-white/60 p-3">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
              Battle track
            </p>
            <p className="mt-1 text-sm font-bold text-muted">
              {builtTrack
                ? `${builtTrack.title} / ${builtTrack.sampleIds.length} samples`
                : "Create an in-app track in Music Builder first."}
            </p>
          </div>
          <div className="mt-3 rounded-2xl border border-line bg-white/60 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
                  Reputation advantage
                </p>
                <p className="mt-1 text-sm font-bold text-muted">
                  Gear reputation makes stronger bands harder to beat.
                </p>
              </div>
              <Trophy className="text-gold" size={20} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <Metric label="Your band" value={`${bandReputation}`} />
              <Metric label="Rival band" value={`${rivalBandReputation}`} />
              <Metric label="Needs" value={`${Math.round((bandEffortMultiplier - 1) * 100)}%+`} />
            </div>
            <p className="mt-2 text-xs leading-5 text-muted">
              Example rule: if Band A has 300 reputation and Band B has 150,
              Band B needs about 50% stronger performance/vote score to win.
            </p>
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

          </>
        ) : null}

        {activeTab === "ranking" ? (
          <>
        <Card className="holo-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Monthly Ranking</CardTitle>
              <p className="mt-1 text-sm text-muted">
                Full ranking, prize pool, scoring rules, and reputation stats.
              </p>
            </div>
            <IconBubble icon={<Medal size={20} />} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Metric label="Prize pool" value={`${formatNucca(rankingPrizePool)}`} />
            <Metric label="Leaders" value={`${MONTHLY_RANKING_ROWS.length}`} />
            <Metric label="Top rep" value={`${MONTHLY_RANKING_ROWS[0]?.reputation ?? 0}`} />
          </div>
          <p className="mt-3 rounded-2xl border border-line bg-white/60 p-3 text-xs font-medium leading-5 text-muted">
            {TREASURY_POLICY.rewardSource}
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Leaderboard</CardTitle>
            <Trophy className="text-gold" size={20} />
          </div>
          <div className="mt-4 grid gap-2">
            {MONTHLY_RANKING_ROWS.map((row) => (
              <div className="rounded-2xl border border-line bg-white/58 p-3" key={`${row.type}-${row.rank}-${row.name}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">
                      #{row.rank} {row.name}
                    </p>
                    <p className="text-xs text-muted">
                      {row.type === "clan" ? "Clan" : "Solo creator"} / {formatNucca(row.points)} pts
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-black">
                      {formatNucca(row.prizeNucca)}
                    </p>
                    <p className="text-[10px] font-black uppercase text-accent">
                      prize
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                  <Metric label="Wins" value={`${row.wins}`} />
                  <Metric label="Tracks" value={`${row.tracks}`} />
                  <Metric label="Votes" value={formatNucca(row.votes)} />
                  <Metric label="Rep" value={`${row.reputation}`} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Scoring Rules</CardTitle>
            <Orbit className="text-accent-2" size={20} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {RANKING_SCORING_RULES.map((rule) => (
              <div className="rounded-2xl border border-line bg-white/58 p-3" key={rule.label}>
                <p className="text-xs font-bold text-muted">{rule.label}</p>
                <p className="mt-1 font-mono text-lg font-black">+{rule.points}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            {MONTHLY_RANKING_RULES.map((rule) => (
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
          <div className="grid grid-cols-3 gap-2 border-t border-line bg-white/50 p-3 text-center">
            <Metric label="Supply" value={formatNucca(chain?.totalSupply ?? TOKEN_FACTS.originalSupply)} />
            <Metric label="Dead wallet" value={formatNucca(chain?.burnedTokens ?? TOKEN_FACTS.burned)} />
            <Metric
              label="Reserve"
              value={
                chain?.rewardReserveBalance !== null && chain?.rewardReserveBalance !== undefined
                  ? formatNucca(chain.rewardReserveBalance)
                  : "Config"
              }
            />
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
          <div className="mt-3 grid gap-2 rounded-3xl border border-line bg-[#17191f] p-3 text-white">
            {["NUCCA", "WLD", "USDC"].map((symbol) => (
              <div
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3"
                key={symbol}
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white">
                    {symbol === "NUCCA" ? (
                      <Image
                        alt="NUCCA"
                        className="object-cover"
                        fill
                        sizes="40px"
                        src="/brand/nucca-token.jpeg"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-sm font-black text-foreground">
                        {symbol}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-black">{symbol}</p>
                    <p className="text-xs text-white/45">
                      {symbol === currentSwapRoute.inputSymbol
                        ? "From token"
                        : symbol === currentSwapRoute.outputSymbol
                          ? "To token"
                          : "Available route"}
                    </p>
                  </div>
                </div>
                <span className="rounded-xl border border-white/10 px-3 py-1 text-xs font-black text-white/75">
                  Actions
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
            <input
              className="rounded-2xl border border-line bg-white/70 px-4 py-3 font-mono text-sm font-black outline-none"
              inputMode="decimal"
              onChange={(event) => setSwapAmount(event.target.value)}
              placeholder={`Amount in ${currentSwapRoute.inputSymbol}`}
              value={swapAmount}
            />
            <Button onClick={openWorldSwap}>
              Swap
            </Button>
          </div>
          <p className="mt-2 rounded-2xl border border-line bg-white/60 p-3 text-xs font-bold text-muted">
            {swapStatus}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-3 py-3 text-sm font-black text-white shadow-lg"
              href={worldSwapUrl ?? currentSwapRoute.uniswapUrl}
              rel="noreferrer"
              target="_blank"
            >
              World Swap <ExternalLink size={15} />
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
              World Swap Quick Action opens the supported swap screen inside World App. Direct Uniswap router execution inside this UI still requires token/router allowlisting, quote/slippage protection, and userOp receipt polling.
            </p>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Creator Marketplace</CardTitle>
              <p className="mt-1 text-sm text-muted">
                Trade RPG music gear in NUCCA. Items change creator stats, battle pressure, music quality, and ranking power.
              </p>
            </div>
            <IconBubble icon={<ShoppingBag size={20} />} />
          </div>
          <div className="mt-4 grid gap-2">
            {CREATOR_MARKETPLACE_LISTINGS.map((listing) => (
                <div
                  className="rounded-2xl border border-line bg-white/58 p-3"
                  key={listing.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">{listing.itemName}</p>
                      <p className="text-xs text-muted">
                        {listing.itemType} / {listing.seller}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-black">
                        {formatNucca(listing.priceNucca)}
                      </p>
                      <Badge className="mt-1 border-orange-200 bg-orange-50 text-[10px] text-accent">
                        {listing.rarity}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <Metric label="Rep" value={`+${listing.reputationPoints}`} />
                    <Metric label="Power" value={`${battlePowerFromAttributes(listing.attributes, listing.reputationPoints)}`} />
                    <Metric label="Stats" value={formatAttributes(listing.attributes, true)} />
                  </div>
                  <p className="mt-3 rounded-2xl border border-line bg-white/68 p-3 text-xs font-medium leading-5 text-muted">
                    {listing.gameplayUse}
                  </p>
                  <Button
                    className="mt-3 w-full"
                    size="sm"
                    variant="secondary"
                  >
                    Buy with NUCCA
                  </Button>
                </div>
              ))}
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
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
                  Your code
                </p>
                <p className="mt-1 truncate font-mono text-lg font-black">
                  {referralCode}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {worldProfile.username
                    ? `World username: ${worldProfile.username}`
                    : "Connect in World App to use your World username if available."}
                </p>
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard?.writeText(referralCode).catch(() => undefined);
                  setReferralClaimStatus("Referral code copied.");
                }}
                size="sm"
                variant="secondary"
              >
                <Copy size={15} />
              </Button>
            </div>
            <Button className="mt-3 w-full" onClick={shareInvite} variant="secondary">
              <Share2 size={16} /> Share invite link
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
            <input
              className="rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm font-bold outline-none"
              onChange={(event) => setReferralInput(event.target.value)}
              placeholder="Friend code"
              value={referralInput}
            />
            <Button onClick={claimReferralCode}>Use</Button>
          </div>
          <p className="mt-2 rounded-2xl border border-line bg-white/60 p-3 text-xs font-bold text-muted">
            {referralClaimStatus}
          </p>
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
          <Card className="min-h-40 holo-border">
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

          <Card className="overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Genesis Map</CardTitle>
                <p className="mt-1 text-sm text-muted">
                  Explore once per day for free. Extra scans cost {DAILY_REWARD_POLICY.paidMapScanCostNucca} NUCCA, max {DAILY_REWARD_POLICY.maxPaidMapScansPerDay}/day.
                </p>
              </div>
              <IconBubble icon={<MapIcon size={20} />} />
            </div>
            <div className="mt-4 rounded-[28px] border border-line bg-gradient-to-br from-white via-cyan-50 to-orange-50 p-3">
              <div className="relative min-h-56 overflow-hidden rounded-[24px] border border-white bg-white/50">
                <div className="absolute left-6 top-8 h-24 w-24 rounded-full bg-cyan-300/40 blur-2xl" />
                <div className="absolute right-4 top-16 h-28 w-28 rounded-full bg-orange-300/45 blur-2xl" />
                <div className="absolute bottom-4 left-12 h-20 w-48 rounded-full bg-emerald-200/35 blur-2xl" />
                <div className="relative grid min-h-56 grid-cols-2 gap-3 p-4">
                  {GENESIS_MAP_ZONES.map((zone, index) => {
                    const active = selectedZone.id === zone.id;
                    return (
                      <button
                        className={
                          active
                            ? "rounded-3xl border border-foreground bg-foreground/94 p-3 text-left text-white shadow-xl"
                            : "rounded-3xl border border-white/80 bg-white/72 p-3 text-left shadow-sm backdrop-blur"
                        }
                        key={zone.id}
                        onClick={() => setSelectedMapZone(zone.id)}
                        type="button"
                      >
                        <div className="flex items-center justify-between">
                          <span className={active ? "rounded-full bg-white/15 p-2" : "rounded-full bg-cyan-50 p-2 text-accent-2"}>
                            {index === 0 ? <Radar size={16} /> : index === 1 ? <Star size={16} /> : index === 2 ? <Zap size={16} /> : <Trophy size={16} />}
                          </span>
                          <span className={active ? "font-mono text-[10px] font-black text-white/75" : "font-mono text-[10px] font-black text-muted"}>
                            L{zone.unlockLevel}
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-black">{zone.name}</p>
                        <p className={active ? "mt-1 line-clamp-2 text-[11px] leading-4 text-white/68" : "mt-1 line-clamp-2 text-[11px] leading-4 text-muted"}>
                          {zone.focus}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-line bg-white/72 p-3">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-accent">
                  {selectedZone.name}
                </p>
                <p className="mt-1 text-sm font-bold text-muted">{selectedZone.theme}</p>
                <p className="mt-1 text-xs leading-5 text-muted">{selectedZone.rewardHint}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Metric label="Daily pool" value={formatNucca(DAILY_REWARD_POLICY.dailyDiscoveryNuccaPool)} />
              <Metric label="User cap" value={`${DAILY_REWARD_POLICY.maxPaidMapScansPerDay}+1`} />
              <Metric label="Scan cost" value={formatNucca(DAILY_REWARD_POLICY.paidMapScanCostNucca)} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button onClick={() => scanGenesisMap(false)}>
                Free Scan
              </Button>
              <Button onClick={() => scanGenesisMap(true)} variant="secondary">
                Extra Scan
              </Button>
            </div>
            <p className="mt-3 rounded-2xl border border-line bg-white/60 p-3 text-xs font-bold text-muted">
              {mapStatus}
            </p>
            {lastMapScan ? (
              <div className="mt-3 rounded-3xl border border-line bg-white/70 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black">{lastMapScan.reward.name}</p>
                    <p className="mt-1 text-xs text-muted">{lastMapScan.reward.description}</p>
                  </div>
                  <Badge className="border-orange-200 bg-orange-50 text-accent">
                    {lastMapScan.reward.rarity}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <Metric label="XP" value={`${lastMapScan.reward.xp ?? 0}`} />
                  <Metric label="Ranking" value={`+${lastMapScan.rankingPoints}`} />
                  <Metric label="NUCCA" value={formatNucca(lastMapScan.tokenReward)} />
                </div>
                {lastMapScan.reward.attributes ? (
                  <AttributeGrid attributes={lastMapScan.reward.attributes} compact />
                ) : null}
              </div>
            ) : null}
            <div className="mt-4 grid gap-2">
              {DISCOVERY_RULES.slice(0, 4).map((rule) => (
                <div
                  className="rounded-2xl border border-line bg-white/58 p-3 text-xs font-medium leading-5 text-muted"
                  key={rule}
                >
                  {rule}
                </div>
              ))}
            </div>
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

        {activeTab === "home" ? (
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
          <p className="mt-3 rounded-2xl border border-line bg-white/60 p-3 text-xs font-medium leading-5 text-muted">
            {TREASURY_POLICY.publicRule} {TREASURY_POLICY.rewardSource}
          </p>
        </Card>
        ) : null}

        <nav
          aria-label="NuCCa sections"
          className="fixed inset-x-0 bottom-0 z-20 border-t border-white/70 bg-white/84 px-3 py-2 shadow-[0_-16px_40px_rgba(49,61,94,0.12)] backdrop-blur-2xl"
        >
          <div className="mx-auto grid max-w-md grid-cols-6 gap-1 text-center text-[9px] font-bold text-muted">
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
              active={activeTab === "ranking"}
              icon={<Medal size={18} />}
              label="Rank"
              onClick={() => setActiveTab("ranking")}
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
  const palette: Record<MusicGenre, { jacket: string; pants: string; aura: string; accent: string; trim: string }> = {
    rock: {
      jacket: "from-slate-950 to-zinc-700",
      pants: "bg-slate-950",
      aura: "bg-orange-300/50",
      accent: "bg-orange-500",
      trim: "border-orange-300",
    },
    pop: {
      jacket: "from-pink-400 to-orange-300",
      pants: "bg-pink-950",
      aura: "bg-pink-200/60",
      accent: "bg-pink-500",
      trim: "border-pink-300",
    },
    techno: {
      jacket: "from-cyan-500 to-slate-900",
      pants: "bg-slate-950",
      aura: "bg-cyan-300/60",
      accent: "bg-cyan-400",
      trim: "border-cyan-300",
    },
    commercial: {
      jacket: "from-white to-slate-300",
      pants: "bg-slate-800",
      aura: "bg-slate-200/70",
      accent: "bg-slate-400",
      trim: "border-slate-300",
    },
    classical: {
      jacket: "from-slate-950 to-amber-800",
      pants: "bg-slate-950",
      aura: "bg-amber-200/60",
      accent: "bg-amber-500",
      trim: "border-amber-300",
    },
    gospel: {
      jacket: "from-white to-yellow-200",
      pants: "bg-yellow-900",
      aura: "bg-yellow-200/70",
      accent: "bg-yellow-500",
      trim: "border-yellow-300",
    },
    oriental: {
      jacket: "from-red-600 to-yellow-500",
      pants: "bg-red-950",
      aura: "bg-red-200/60",
      accent: "bg-red-500",
      trim: "border-red-300",
    },
    trap: {
      jacket: "from-slate-950 to-purple-900",
      pants: "bg-slate-950",
      aura: "bg-purple-300/50",
      accent: "bg-purple-500",
      trim: "border-purple-300",
    },
    latin: {
      jacket: "from-orange-500 to-red-500",
      pants: "bg-red-950",
      aura: "bg-orange-200/70",
      accent: "bg-red-500",
      trim: "border-orange-300",
    },
    afrobeat: {
      jacket: "from-emerald-500 to-yellow-500",
      pants: "bg-emerald-950",
      aura: "bg-emerald-200/70",
      accent: "bg-emerald-500",
      trim: "border-emerald-300",
    },
    jazz: {
      jacket: "from-slate-900 to-yellow-900",
      pants: "bg-slate-950",
      aura: "bg-yellow-200/50",
      accent: "bg-yellow-600",
      trim: "border-yellow-300",
    },
    reggaeton: {
      jacket: "from-fuchsia-500 to-cyan-400",
      pants: "bg-fuchsia-950",
      aura: "bg-fuchsia-200/60",
      accent: "bg-fuchsia-500",
      trim: "border-fuchsia-300",
    },
  };
  const style = palette[genre];

  return (
    <div className="performer-dance absolute inset-0 flex items-center justify-center pt-4">
      <div className={`absolute h-44 w-44 rounded-full blur-2xl ${style.aura}`} />
      <div className="absolute bottom-8 h-12 w-44 rounded-full bg-slate-950/10 blur-md" />
      <div className="relative h-52 w-36 [filter:drop-shadow(0_24px_30px_rgba(15,23,42,0.22))]">
        <div className={`absolute left-1/2 top-0 h-20 w-20 -translate-x-1/2 overflow-hidden rounded-full border-4 bg-white shadow-xl ${style.trim}`}>
          <Image
            alt="NuCCa human avatar face"
            className="object-cover"
            fill
            sizes="80px"
            src="/brand/nucca-token.jpeg"
          />
        </div>
        <div className="absolute left-1/2 top-[4.35rem] h-5 w-10 -translate-x-1/2 rounded-b-full bg-orange-200" />
        <div className={`absolute left-1/2 top-[5.1rem] h-24 w-28 -translate-x-1/2 rounded-t-[42px] rounded-b-3xl border border-white/50 bg-gradient-to-br ${style.jacket}`} />
        <div className="absolute left-7 top-[5.9rem] h-16 w-6 -rotate-[18deg] rounded-full bg-gradient-to-b from-orange-100 to-orange-200 shadow-md" />
        <div className="absolute right-7 top-[5.9rem] h-16 w-6 rotate-[18deg] rounded-full bg-gradient-to-b from-orange-100 to-orange-200 shadow-md" />
        <div className={`absolute left-1/2 top-[6.6rem] h-4 w-20 -translate-x-1/2 rounded-full ${style.accent} shadow-lg`} />
        <div className="absolute left-1/2 top-[8.15rem] h-8 w-14 -translate-x-1/2 rounded-b-3xl bg-white/70" />
        <div className={`absolute bottom-7 left-10 h-16 w-6 rounded-full ${style.pants} shadow-lg`} />
        <div className={`absolute bottom-7 right-10 h-16 w-6 rounded-full ${style.pants} shadow-lg`} />
        <div className="absolute bottom-4 left-7 h-5 w-12 -rotate-6 rounded-full bg-white shadow-md" />
        <div className="absolute bottom-4 right-7 h-5 w-12 rotate-6 rounded-full bg-white shadow-md" />
        <div className={`absolute left-1/2 top-[1.8rem] h-4 w-16 -translate-x-1/2 rounded-full ${style.accent} opacity-80 mix-blend-screen`} />
        <div className="absolute left-1/2 top-[3.1rem] h-2 w-14 -translate-x-1/2 rounded-full bg-slate-950/75" />
      </div>
    </div>
  );
}

function formatLockCountdown(ms: number) {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function formatLockDate(input: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(input));
}

const ATTRIBUTE_LABELS: Record<ItemAttributeId, string> = {
  rhythm: "Rhythm",
  melody: "Melody",
  stage: "Stage",
  production: "Prod",
  fan: "Fan",
  focus: "Focus",
};

function formatAttributes(
  attributes: Partial<Record<ItemAttributeId, number>>,
  compact = false,
) {
  const entries = Object.entries(attributes).filter(([, value]) => value);
  if (entries.length === 0) return "No stats";
  return entries
    .map(([key, value]) => {
      const label = ATTRIBUTE_LABELS[key as ItemAttributeId];
      return compact ? `+${value} ${label}` : `${label} +${value}`;
    })
    .join(compact ? " / " : ", ");
}

function AttributeGrid({
  attributes,
  compact,
}: {
  attributes: Partial<Record<ItemAttributeId, number>>;
  compact?: boolean;
}) {
  const entries = (Object.keys(ATTRIBUTE_LABELS) as ItemAttributeId[]).filter(
    (attribute) => attributes[attribute],
  );

  if (entries.length === 0) return null;

  return (
    <div className={compact ? "mt-3 grid grid-cols-3 gap-2" : "mt-3 grid grid-cols-6 gap-1.5"}>
      {entries.map((attribute) => (
        <div
          className="rounded-2xl border border-line bg-white/62 p-2 text-center shadow-sm"
          key={attribute}
        >
          <p className="font-mono text-xs font-black">+{attributes[attribute]}</p>
          <p className="mt-1 truncate text-[9px] font-bold uppercase text-muted">
            {ATTRIBUTE_LABELS[attribute]}
          </p>
        </div>
      ))}
    </div>
  );
}

function Metric({
  label,
  onClick,
  value,
}: {
  label: string;
  onClick?: () => void;
  value: string;
}) {
  const className = "rounded-2xl border border-line bg-white/58 p-2 shadow-sm";
  const content = (
    <>
      <p className="truncate font-mono text-sm font-black">{value}</p>
      <p className="mt-1 truncate text-[10px] uppercase tracking-wide text-muted">
        {label}
      </p>
    </>
  );

  if (onClick) {
    return (
      <button className={`${className} text-center`} onClick={onClick} type="button">
        {content}
      </button>
    );
  }

  return (
    <div className={className}>{content}</div>
  );
}

function DarkMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-2 shadow-sm">
      <p className="truncate font-mono text-sm font-black text-white">{value}</p>
      <p className="mt-1 truncate text-[10px] uppercase tracking-wide text-white/45">
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
