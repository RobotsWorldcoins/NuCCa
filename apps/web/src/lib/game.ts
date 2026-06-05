export type CreatorStyleSlot = "frame" | "badge" | "backdrop" | "introFx" | "title";

export type CreatorStyleItem = {
  id: string;
  name: string;
  slot: CreatorStyleSlot;
  rarity: "common" | "rare" | "epic" | "legendary";
  cosmeticEffect: string;
  priceNucca: number;
};

export type Sample = {
  id: string;
  name: string;
  bpm: number;
  key: string;
  type: "drums" | "bass" | "melody" | "vocal" | "fx";
  unlockLevel: number;
  license: "in-app";
};

export type BattleRule = {
  id: string;
  title: string;
  value: string;
};

export type Clan = {
  id: string;
  name: string;
  style: string;
  focus: string;
  monthlyPoints: number;
};

export const CREATOR_STYLE_ITEMS: CreatorStyleItem[] = [
  {
    id: "genesis-frame",
    name: "Genesis Frame",
    slot: "frame",
    rarity: "rare",
    cosmeticEffect: "Orange chrome profile border and battle card frame.",
    priceNucca: 75,
  },
  {
    id: "neon-label-badge",
    name: "Neon Label Badge",
    slot: "badge",
    rarity: "epic",
    cosmeticEffect: "Animated badge beside your name in leaderboards.",
    priceNucca: 180,
  },
  {
    id: "solar-stage",
    name: "Solar Stage",
    slot: "backdrop",
    rarity: "legendary",
    cosmeticEffect: "Premium profile background and battle entrance scene.",
    priceNucca: 420,
  },
];

export const SAMPLE_LIBRARY: Sample[] = [
  {
    id: "kick-nova-90",
    name: "Nova Kick",
    bpm: 90,
    key: "C",
    type: "drums",
    unlockLevel: 1,
    license: "in-app",
  },
  {
    id: "bass-orbit-90",
    name: "Orbit Bass",
    bpm: 90,
    key: "C minor",
    type: "bass",
    unlockLevel: 1,
    license: "in-app",
  },
  {
    id: "lead-genesis-90",
    name: "Genesis Lead",
    bpm: 90,
    key: "C minor",
    type: "melody",
    unlockLevel: 2,
    license: "in-app",
  },
  {
    id: "vox-spark-90",
    name: "Spark Vox",
    bpm: 90,
    key: "C minor",
    type: "vocal",
    unlockLevel: 3,
    license: "in-app",
  },
];

export const CLANS: Clan[] = [
  {
    id: "genesis-sound",
    name: "Genesis Sound",
    style: "Premium pop, hooks, clean visuals",
    focus: "Monthly league consistency",
    monthlyPoints: 12840,
  },
  {
    id: "neon-syndicate",
    name: "Neon Syndicate",
    style: "Trap, cyber beats, aggressive drops",
    focus: "Fast battle wins",
    monthlyPoints: 11920,
  },
  {
    id: "shadow-records",
    name: "Shadow Records",
    style: "Dark vocals, cinematic loops",
    focus: "Crew 3v3 strategy",
    monthlyPoints: 10550,
  },
  {
    id: "eternal-frequency",
    name: "Eternal Frequency",
    style: "Melodic, emotional, viral choruses",
    focus: "Fan voting power",
    monthlyPoints: 9820,
  },
];

export const MONTHLY_RANKING_RULES = [
  "Monthly ranking rewards are admin-funded from disclosed reserve balances.",
  "Points come from in-app music creation, verified votes, solo wins, crew wins, missions, and referrals.",
  "Crew 3v3 wins give clan points to every verified member on the winning side.",
  "Cosmetic items affect identity and status, not hidden battle power.",
  "NUCCA prize sizes must be published before each month starts and can be lowered if reserves are weak.",
];

export const BATTLE_RULES: BattleRule[] = [
  {
    id: "in-app-only",
    title: "In-app music only",
    value: "Ranked battles accept only compositions created from the NuCCa builder manifest.",
  },
  {
    id: "crew-battles",
    title: "Solo and 3v3 crew battles",
    value:
      "Creators can enter 1v1 or 3v3 battles. Crew battles require more total NUCCA and award more clan points.",
  },
  {
    id: "human-vote-weight",
    title: "Human vote weight",
    value: "World ID verified voters count at full weight; unverified votes are advisory only.",
  },
  {
    id: "no-upload-finals",
    title: "No outside uploads",
    value: "Uploaded files can be used for practice, not ranked rewards, unless re-built from approved samples.",
  },
  {
    id: "transparent-revenue",
    title: "Transparent revenue",
    value:
      "The app tracks commission, monthly prize reserve, AI operations reserve, and reward reserve before entry.",
  },
  {
    id: "no-token-betting",
    title: "Support without casino risk",
    value: "Fans can back creators with Hype for XP/status. Spectator NUCCA betting stays disabled until licensing exists.",
  },
];

export const CREATOR_LEVELS = [
  { level: 1, title: "Bedroom Creator", xpRequired: 0 },
  { level: 2, title: "Studio Rookie", xpRequired: 250 },
  { level: 3, title: "Neon Producer", xpRequired: 750 },
  { level: 4, title: "Label Captain", xpRequired: 1600 },
  { level: 5, title: "Genesis Icon", xpRequired: 3200 },
];

export function levelForXp(xp: number) {
  return CREATOR_LEVELS.reduce((current, next) => {
    return xp >= next.xpRequired ? next : current;
  }, CREATOR_LEVELS[0]);
}

export function compositionManifestHash(input: {
  walletAddress: string;
  sampleIds: string[];
  arrangement: string;
  createdAt: string;
}) {
  return JSON.stringify({
    app: "nucca-genesis-studio",
    version: 1,
    walletAddress: input.walletAddress.toLowerCase(),
    sampleIds: input.sampleIds.slice().sort(),
    arrangement: input.arrangement,
    createdAt: input.createdAt,
    provenance: "in-app-builder",
  });
}
