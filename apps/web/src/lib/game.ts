export type CreatorStyleSlot = "frame" | "badge" | "backdrop" | "introFx" | "title";
export type OutfitSlot = "hair" | "jacket" | "top" | "pants" | "shoes" | "accessory" | "aura";
export type SampleType = "kick" | "bass" | "lead" | "vocal" | "fx";
export type MusicGenre =
  | "rock"
  | "pop"
  | "techno"
  | "commercial"
  | "classical"
  | "gospel"
  | "oriental"
  | "trap"
  | "latin"
  | "afrobeat"
  | "jazz"
  | "reggaeton";

export type CreatorStyleItem = {
  id: string;
  name: string;
  slot: CreatorStyleSlot;
  rarity: "common" | "rare" | "epic" | "legendary";
  cosmeticEffect: string;
  priceNucca: number;
  reputationPoints: number;
};

export type CreatorOutfitItem = {
  id: string;
  name: string;
  genre: MusicGenre;
  slot: OutfitSlot;
  rarity: "common" | "rare" | "epic" | "legendary";
  visual: string;
  priceNucca: number;
  reputationPoints: number;
};

export type Sample = {
  id: string;
  name: string;
  bpm: number;
  key: string;
  type: SampleType;
  unlockLevel: number;
  license: "in-app" | "user-provided";
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
  members: number;
  maxMembers: number;
  creationCostNucca: number;
};

export type MarketplaceListing = {
  id: string;
  itemId: string;
  itemName: string;
  itemType: "outfit" | "style" | "equipment";
  seller: string;
  priceNucca: number;
  reputationPoints: number;
  rarity: "common" | "rare" | "epic" | "legendary";
};

export type RankingRow = {
  rank: number;
  name: string;
  type: "solo" | "clan";
  points: number;
  wins: number;
  tracks: number;
  votes: number;
  reputation: number;
  prizeNucca: number;
};

export const CLAN_CREATION_COST_NUCCA = 100_000;
export const CLAN_MAX_MEMBERS = 3;

export const CREATOR_STYLE_ITEMS: CreatorStyleItem[] = [
  {
    id: "genesis-frame",
    name: "Genesis Frame",
    slot: "frame",
    rarity: "rare",
    cosmeticEffect: "Orange chrome profile border and battle card frame.",
    priceNucca: 75,
    reputationPoints: 12,
  },
  {
    id: "neon-label-badge",
    name: "Neon Label Badge",
    slot: "badge",
    rarity: "epic",
    cosmeticEffect: "Animated badge beside your name in leaderboards.",
    priceNucca: 180,
    reputationPoints: 30,
  },
  {
    id: "solar-stage",
    name: "Solar Stage",
    slot: "backdrop",
    rarity: "legendary",
    cosmeticEffect: "Premium profile background and battle entrance scene.",
    priceNucca: 420,
    reputationPoints: 75,
  },
];

export const MUSIC_GENRES: { id: MusicGenre; label: string; mood: string }[] = [
  { id: "rock", label: "Rock", mood: "leather, metal, stage fire" },
  { id: "pop", label: "Pop", mood: "clean shine, bright color, star polish" },
  { id: "techno", label: "Techno", mood: "neon, chrome, cyber motion" },
  { id: "commercial", label: "Commercial", mood: "premium, brand-ready, clean camera" },
  { id: "classical", label: "Classical", mood: "orchestra, gold trim, formal stage" },
  { id: "gospel", label: "Gospel", mood: "white/gold, choir, light aura" },
  { id: "oriental", label: "Oriental", mood: "silk, red/gold, cinematic motion" },
  { id: "trap", label: "Trap", mood: "street luxury, dark shine, heavy bass" },
  { id: "latin", label: "Latin", mood: "warm color, dance energy, percussion" },
  { id: "afrobeat", label: "Afrobeat", mood: "pattern, rhythm, festival color" },
  { id: "jazz", label: "Jazz", mood: "suit, smoke club, late-night gold" },
  { id: "reggaeton", label: "Reggaeton", mood: "clubwear, sunglasses, summer neon" },
];

export const CREATOR_OUTFIT_ITEMS: CreatorOutfitItem[] = [
  {
    id: "rock-legend-jacket",
    name: "Rock Legend Jacket",
    genre: "rock",
    slot: "jacket",
    rarity: "epic",
    visual: "black leather jacket with orange chrome studs",
    priceNucca: 180,
    reputationPoints: 28,
  },
  {
    id: "pop-star-glow",
    name: "Pop Star Glow",
    genre: "pop",
    slot: "aura",
    rarity: "rare",
    visual: "soft white spotlight and glossy stage sparkle",
    priceNucca: 120,
    reputationPoints: 18,
  },
  {
    id: "techno-neon-visor",
    name: "Techno Neon Visor",
    genre: "techno",
    slot: "accessory",
    rarity: "epic",
    visual: "cyan visor with animated equalizer reflection",
    priceNucca: 210,
    reputationPoints: 34,
  },
  {
    id: "commercial-chrome-coat",
    name: "Commercial Chrome Coat",
    genre: "commercial",
    slot: "jacket",
    rarity: "rare",
    visual: "clean silver coat for premium brand drops",
    priceNucca: 160,
    reputationPoints: 24,
  },
  {
    id: "classical-conductor-tailcoat",
    name: "Conductor Tailcoat",
    genre: "classical",
    slot: "jacket",
    rarity: "epic",
    visual: "black formal tailcoat with gold baton accent",
    priceNucca: 220,
    reputationPoints: 36,
  },
  {
    id: "gospel-light-robe",
    name: "Gospel Light Robe",
    genre: "gospel",
    slot: "top",
    rarity: "legendary",
    visual: "white and gold robe with luminous choir halo",
    priceNucca: 360,
    reputationPoints: 62,
  },
  {
    id: "oriental-silk-dragon",
    name: "Silk Dragon Set",
    genre: "oriental",
    slot: "top",
    rarity: "legendary",
    visual: "red silk stage layer with gold dragon trim",
    priceNucca: 390,
    reputationPoints: 68,
  },
  {
    id: "trap-shadow-chain",
    name: "Trap Shadow Chain",
    genre: "trap",
    slot: "accessory",
    rarity: "rare",
    visual: "heavy black-gold chain and dark bass pulse",
    priceNucca: 140,
    reputationPoints: 22,
  },
  {
    id: "latin-solar-shirt",
    name: "Latin Solar Shirt",
    genre: "latin",
    slot: "top",
    rarity: "rare",
    visual: "orange dance shirt with animated percussion glow",
    priceNucca: 130,
    reputationPoints: 20,
  },
  {
    id: "afrobeat-pattern-kicks",
    name: "Afrobeat Pattern Kicks",
    genre: "afrobeat",
    slot: "shoes",
    rarity: "epic",
    visual: "festival pattern sneakers with rhythm particles",
    priceNucca: 190,
    reputationPoints: 31,
  },
  {
    id: "jazz-midnight-suit",
    name: "Jazz Midnight Suit",
    genre: "jazz",
    slot: "jacket",
    rarity: "epic",
    visual: "midnight suit with gold lapel and saxophone pin",
    priceNucca: 240,
    reputationPoints: 40,
  },
  {
    id: "reggaeton-club-glasses",
    name: "Reggaeton Club Glasses",
    genre: "reggaeton",
    slot: "accessory",
    rarity: "rare",
    visual: "summer club sunglasses with pink-blue reflections",
    priceNucca: 125,
    reputationPoints: 19,
  },
];

export const CREATOR_MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  {
    id: "listing-solar-stage",
    itemId: "solar-stage",
    itemName: "Solar Stage",
    itemType: "style",
    seller: "Genesis Sound",
    priceNucca: 620,
    reputationPoints: 75,
    rarity: "legendary",
  },
  {
    id: "listing-techno-visor",
    itemId: "techno-neon-visor",
    itemName: "Techno Neon Visor",
    itemType: "outfit",
    seller: "Neon Syndicate",
    priceNucca: 315,
    reputationPoints: 34,
    rarity: "epic",
  },
  {
    id: "listing-gospel-robe",
    itemId: "gospel-light-robe",
    itemName: "Gospel Light Robe",
    itemType: "outfit",
    seller: "Eternal Frequency",
    priceNucca: 540,
    reputationPoints: 62,
    rarity: "legendary",
  },
  {
    id: "listing-trap-chain",
    itemId: "trap-shadow-chain",
    itemName: "Trap Shadow Chain",
    itemType: "outfit",
    seller: "Shadow Records",
    priceNucca: 230,
    reputationPoints: 22,
    rarity: "rare",
  },
];

export const MONTHLY_RANKING_ROWS: RankingRow[] = [
  {
    rank: 1,
    name: "Genesis Sound",
    type: "clan",
    points: 12840,
    wins: 18,
    tracks: 42,
    votes: 3810,
    reputation: 920,
    prizeNucca: 12000,
  },
  {
    rank: 2,
    name: "Neon Syndicate",
    type: "clan",
    points: 11920,
    wins: 16,
    tracks: 38,
    votes: 3420,
    reputation: 780,
    prizeNucca: 7500,
  },
  {
    rank: 3,
    name: "Shadow Records",
    type: "clan",
    points: 10550,
    wins: 14,
    tracks: 31,
    votes: 2980,
    reputation: 690,
    prizeNucca: 4500,
  },
  {
    rank: 4,
    name: "nucca",
    type: "solo",
    points: 9820,
    wins: 11,
    tracks: 27,
    votes: 2510,
    reputation: 340,
    prizeNucca: 2500,
  },
  {
    rank: 5,
    name: "Eternal Frequency",
    type: "clan",
    points: 9410,
    wins: 10,
    tracks: 29,
    votes: 2310,
    reputation: 610,
    prizeNucca: 1500,
  },
];

export const RANKING_SCORING_RULES = [
  { label: "Track built in app", points: 25 },
  { label: "Verified vote received", points: 1 },
  { label: "Solo battle win", points: 120 },
  { label: "3v3 clan battle win", points: 260 },
  { label: "Daily mission completed", points: 20 },
  { label: "Qualified referral", points: 100 },
];

export const SAMPLE_TYPE_LABELS: Record<SampleType, string> = {
  kick: "Kicks",
  bass: "Bass",
  lead: "Leads",
  vocal: "Vox",
  fx: "FX",
};

const SAMPLE_KEYS = [
  "C",
  "C minor",
  "D minor",
  "E minor",
  "F",
  "G",
  "A minor",
  "B minor",
] as const;
const SAMPLE_BPMS = [80, 90, 96, 100, 110, 120, 128, 140, 150, 160] as const;
const SAMPLE_SERIES: {
  type: SampleType;
  count: number;
  prefix: string;
  unlockBase: number;
}[] = [
  { type: "kick", count: 100, prefix: "Genesis Kick", unlockBase: 1 },
  { type: "bass", count: 100, prefix: "Orbit Bass", unlockBase: 1 },
  { type: "lead", count: 200, prefix: "Neon Lead", unlockBase: 2 },
  { type: "vocal", count: 200, prefix: "Creator Vox", unlockBase: 3 },
  { type: "fx", count: 100, prefix: "Portal FX", unlockBase: 1 },
];

export const SAMPLE_LIBRARY: Sample[] = SAMPLE_SERIES.flatMap(
  (series, seriesIndex) =>
    Array.from({ length: series.count }, (_, offset) => {
      const number = offset + 1;
      const padded = String(number).padStart(3, "0");

      return {
        id: `${series.type}-${padded}`,
        name: `${series.prefix} ${padded}`,
        bpm: SAMPLE_BPMS[(offset + seriesIndex) % SAMPLE_BPMS.length],
        key: SAMPLE_KEYS[(offset + seriesIndex) % SAMPLE_KEYS.length],
        type: series.type,
        unlockLevel: Math.min(10, series.unlockBase + Math.floor(offset / 40)),
        license: "in-app",
      };
    }),
);

export const SAMPLE_LIBRARY_COUNTS = SAMPLE_LIBRARY.reduce(
  (counts, sample) => {
    counts[sample.type] += 1;
    return counts;
  },
  { kick: 0, bass: 0, lead: 0, vocal: 0, fx: 0 } as Record<SampleType, number>,
);

export const CLANS: Clan[] = [
  {
    id: "genesis-sound",
    name: "Genesis Sound",
    style: "Premium pop, hooks, clean visuals",
    focus: "Monthly league consistency",
    monthlyPoints: 12840,
    members: 3,
    maxMembers: CLAN_MAX_MEMBERS,
    creationCostNucca: CLAN_CREATION_COST_NUCCA,
  },
  {
    id: "neon-syndicate",
    name: "Neon Syndicate",
    style: "Trap, cyber beats, aggressive drops",
    focus: "Fast battle wins",
    monthlyPoints: 11920,
    members: 2,
    maxMembers: CLAN_MAX_MEMBERS,
    creationCostNucca: CLAN_CREATION_COST_NUCCA,
  },
  {
    id: "shadow-records",
    name: "Shadow Records",
    style: "Dark vocals, cinematic loops",
    focus: "Crew 3v3 strategy",
    monthlyPoints: 10550,
    members: 3,
    maxMembers: CLAN_MAX_MEMBERS,
    creationCostNucca: CLAN_CREATION_COST_NUCCA,
  },
  {
    id: "eternal-frequency",
    name: "Eternal Frequency",
    style: "Melodic, emotional, viral choruses",
    focus: "Fan voting power",
    monthlyPoints: 9820,
    members: 1,
    maxMembers: CLAN_MAX_MEMBERS,
    creationCostNucca: CLAN_CREATION_COST_NUCCA,
  },
];

export const MONTHLY_RANKING_RULES = [
  "Monthly ranking rewards are admin-funded from disclosed reserve balances.",
  "Points come from in-app music creation, verified votes, solo wins, crew wins, missions, and referrals.",
  "Crew 3v3 wins give clan points to every verified member on the winning side.",
  "Outfits, equipment, and accessories give reputation. Reputation increases battle advantage transparently.",
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
    id: "reputation-pressure",
    title: "Reputation pressure",
    value:
      "If one side has 300 band reputation and the other has 150, the lower reputation side needs about 50% stronger performance/votes to overcome the gap.",
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

export function reputationEffortMultiplier(favoriteReputation: number, underdogReputation: number) {
  if (favoriteReputation <= 0 || underdogReputation >= favoriteReputation) return 1;
  const gapRatio = (favoriteReputation - underdogReputation) / favoriteReputation;
  return Number((1 + gapRatio).toFixed(2));
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
