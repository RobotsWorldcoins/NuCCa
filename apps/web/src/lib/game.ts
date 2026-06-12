export type CreatorStyleSlot = "frame" | "badge" | "backdrop" | "introFx" | "title";
export type OutfitSlot = "hair" | "jacket" | "top" | "pants" | "shoes" | "accessory" | "aura";
export type SampleType = "kick" | "bass" | "lead" | "vocal" | "fx";
export type ItemAttributeId = "rhythm" | "melody" | "stage" | "production" | "fan" | "focus";
export type ItemAttributes = Partial<Record<ItemAttributeId, number>>;
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
  attributes: ItemAttributes;
  gameplayUse: string;
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
  attributes: ItemAttributes;
  gameplayUse: string;
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

export type DiscoveryRewardType = "xp" | "sample" | "equipment" | "nucca" | "empty";

export type DiscoveryReward = {
  id: string;
  type: DiscoveryRewardType;
  name: string;
  description: string;
  weight: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  xp?: number;
  energy?: number;
  reputationPoints?: number;
  attributes?: ItemAttributes;
  sampleType?: SampleType;
  tokenShare?: "daily-pool";
  paidEligible: boolean;
};

export type MapZone = {
  id: string;
  name: string;
  theme: string;
  unlockLevel: number;
  focus: string;
  rewardHint: string;
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
  motto: string;
  monthlyPoints: number;
  reputation: number;
  wins: number;
  winRate: number;
  weeklyBattles: number;
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
  attributes: ItemAttributes;
  gameplayUse: string;
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
    attributes: { stage: 3, fan: 2 },
    gameplayUse: "Improves vote conversion on battle cards and gives small stage presence.",
  },
  {
    id: "neon-label-badge",
    name: "Neon Label Badge",
    slot: "badge",
    rarity: "epic",
    cosmeticEffect: "Animated badge beside your name in leaderboards.",
    priceNucca: 180,
    reputationPoints: 30,
    attributes: { fan: 7, stage: 4 },
    gameplayUse: "Boosts fan appeal and makes ranking cards more visible.",
  },
  {
    id: "solar-stage",
    name: "Solar Stage",
    slot: "backdrop",
    rarity: "legendary",
    cosmeticEffect: "Premium profile background and battle entrance scene.",
    priceNucca: 420,
    reputationPoints: 75,
    attributes: { stage: 14, fan: 8, focus: 3 },
    gameplayUse: "Strong battle entrance item for reputation pressure and fan voting.",
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
    attributes: { stage: 6, rhythm: 4, fan: 2 },
    gameplayUse: "Adds stage pressure and rhythm power for rock battles.",
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
    attributes: { fan: 5, stage: 3, melody: 2 },
    gameplayUse: "Improves fan appeal and chorus voting strength.",
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
    attributes: { production: 7, rhythm: 5, focus: 2 },
    gameplayUse: "Helps electronic tracks score higher on production and timing.",
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
    attributes: { fan: 4, production: 4, stage: 3 },
    gameplayUse: "Raises commercial polish and broad audience score.",
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
    attributes: { melody: 8, focus: 4, stage: 2 },
    gameplayUse: "Improves melodic structure and long-form performance consistency.",
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
    attributes: { melody: 9, fan: 6, focus: 5 },
    gameplayUse: "Boosts emotional voting and harmony-focused tracks.",
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
    attributes: { stage: 10, melody: 6, focus: 4 },
    gameplayUse: "Strong cinematic stage boost for high-reputation battles.",
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
    attributes: { rhythm: 7, stage: 3, production: 2 },
    gameplayUse: "Raises bass impact and aggressive battle pressure.",
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
    attributes: { rhythm: 6, fan: 3, stage: 2 },
    gameplayUse: "Improves danceability and crowd response.",
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
    attributes: { rhythm: 6, focus: 4, stage: 3 },
    gameplayUse: "Improves rhythm consistency and daily activity stamina.",
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
    attributes: { melody: 7, stage: 5, fan: 3 },
    gameplayUse: "Improves live-style performance score and melodic identity.",
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
    attributes: { fan: 5, rhythm: 4, stage: 1 },
    gameplayUse: "Improves club appeal and short battle voting speed.",
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
    attributes: { stage: 14, fan: 8, focus: 3 },
    gameplayUse: "Legendary stage item: stronger battle entrance, more fan conversion, higher band reputation.",
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
    attributes: { production: 7, rhythm: 5, focus: 2 },
    gameplayUse: "Electronic production gear: improves beat timing and production score.",
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
    attributes: { melody: 9, fan: 6, focus: 5 },
    gameplayUse: "Vocal/emotional gear: improves fan voting and melodic tracks.",
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
    attributes: { rhythm: 7, stage: 3, production: 2 },
    gameplayUse: "Bass pressure accessory: better rhythm score and aggressive stage presence.",
    rarity: "rare",
  },
  {
    id: "listing-orbit-drum-pad",
    itemId: "orbit-drum-pad",
    itemName: "Orbit Drum Pad",
    itemType: "equipment",
    seller: "Genesis Sound",
    priceNucca: 480,
    reputationPoints: 45,
    attributes: { rhythm: 10, production: 5, focus: 2 },
    gameplayUse: "Producer equipment: boosts beat-builder score and unlocks stronger drum missions.",
    rarity: "epic",
  },
  {
    id: "listing-vocal-core",
    itemId: "vocal-core",
    itemName: "Vocal Core",
    itemType: "equipment",
    seller: "Eternal Frequency",
    priceNucca: 690,
    reputationPoints: 58,
    attributes: { melody: 10, fan: 6, production: 3 },
    gameplayUse: "Vocal equipment: improves hook quality, vote appeal, and melody-based battle scoring.",
    rarity: "legendary",
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
  { label: "Daily map scan", points: 15 },
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

export const GENESIS_MAP_ZONES: MapZone[] = [
  {
    id: "neon-docks",
    name: "Neon Docks",
    theme: "Fast beats, underground crews, low-level samples",
    unlockLevel: 1,
    focus: "kicks, bass, XP",
    rewardHint: "Best zone for daily streak and starter track parts.",
  },
  {
    id: "solar-stage",
    name: "Solar Stage",
    theme: "Premium spotlight arena and creator outfits",
    unlockLevel: 2,
    focus: "equipment, reputation, style shards",
    rewardHint: "Best zone for outfit progression before battles.",
  },
  {
    id: "oracle-vault",
    name: "Oracle Vault",
    theme: "Locked community treasury signals and rare NUCCA pool drops",
    unlockLevel: 3,
    focus: "free NUCCA pool, rare samples, energy",
    rewardHint: "Free scan can hit the capped daily NUCCA pool when budget remains.",
  },
  {
    id: "genesis-tower",
    name: "Genesis Tower",
    theme: "Monthly ranking headquarters and clan strategy",
    unlockLevel: 4,
    focus: "ranking points, clan boosts, epic items",
    rewardHint: "Late-game zone for monthly leaderboard pushes.",
  },
];

export const DISCOVERY_REWARDS: DiscoveryReward[] = [
  {
    id: "xp-cache",
    type: "xp",
    name: "Studio XP Cache",
    description: "Guaranteed progression bump for the monthly ranking loop.",
    weight: 32,
    rarity: "common",
    xp: 35,
    energy: 5,
    attributes: { focus: 1 },
    paidEligible: true,
  },
  {
    id: "sample-fragment",
    type: "sample",
    name: "Hidden Sample Fragment",
    description: "Unlocks a new approved sample slot for in-app compositions.",
    weight: 28,
    rarity: "common",
    xp: 15,
    attributes: { production: 1 },
    sampleType: "lead",
    paidEligible: true,
  },
  {
    id: "reputation-gear",
    type: "equipment",
    name: "Chrome Stage Gear",
    description: "Adds outfit reputation that improves battle pressure.",
    weight: 18,
    rarity: "rare",
    xp: 20,
    reputationPoints: 8,
    attributes: { stage: 3, fan: 1 },
    paidEligible: true,
  },
  {
    id: "nucca-pool",
    type: "nucca",
    name: "Oracle NUCCA Pool",
    description: "Draws from the capped 1,000 NUCCA daily discovery pool.",
    weight: 7,
    rarity: "epic",
    tokenShare: "daily-pool",
    xp: 10,
    attributes: { focus: 1 },
    paidEligible: false,
  },
  {
    id: "empty-signal",
    type: "empty",
    name: "Empty Signal",
    description: "No item found, but the scan still counts for streak activity.",
    weight: 15,
    rarity: "common",
    xp: 5,
    paidEligible: false,
  },
];

export const DISCOVERY_RULES = [
  "Every human-verified user gets one free map scan per day.",
  "The free scan can discover XP, samples, equipment, a small NUCCA pool share, or nothing.",
  "The NUCCA discovery pool is capped at 1,000 NUCCA/day across all eligible users.",
  "Extra scans cost 100 NUCCA each and are capped at 10/day.",
  "Extra paid scans always return progression value: XP, sample, equipment, or attributes. They do not use the random NUCCA pool and do not return Empty Signal.",
  "Map activity gives ranking points, keeps streak pressure high, and feeds the music builder with in-app-only assets.",
];

export const CLANS: Clan[] = [
  {
    id: "genesis-sound",
    name: "Genesis Sound",
    style: "Premium pop, hooks, clean visuals",
    focus: "Monthly league consistency",
    motto: "Clean hooks win long wars.",
    monthlyPoints: 12840,
    reputation: 920,
    wins: 18,
    winRate: 64,
    weeklyBattles: 11,
    members: 3,
    maxMembers: CLAN_MAX_MEMBERS,
    creationCostNucca: CLAN_CREATION_COST_NUCCA,
  },
  {
    id: "neon-syndicate",
    name: "Neon Syndicate",
    style: "Trap, cyber beats, aggressive drops",
    focus: "Fast battle wins",
    motto: "Win fast, vote louder.",
    monthlyPoints: 11920,
    reputation: 780,
    wins: 16,
    winRate: 61,
    weeklyBattles: 14,
    members: 2,
    maxMembers: CLAN_MAX_MEMBERS,
    creationCostNucca: CLAN_CREATION_COST_NUCCA,
  },
  {
    id: "shadow-records",
    name: "Shadow Records",
    style: "Dark vocals, cinematic loops",
    focus: "Crew 3v3 strategy",
    motto: "Pressure beats popularity.",
    monthlyPoints: 10550,
    reputation: 690,
    wins: 14,
    winRate: 58,
    weeklyBattles: 9,
    members: 3,
    maxMembers: CLAN_MAX_MEMBERS,
    creationCostNucca: CLAN_CREATION_COST_NUCCA,
  },
  {
    id: "eternal-frequency",
    name: "Eternal Frequency",
    style: "Melodic, emotional, viral choruses",
    focus: "Fan voting power",
    motto: "Emotion converts voters.",
    monthlyPoints: 9820,
    reputation: 610,
    wins: 10,
    winRate: 54,
    weeklyBattles: 7,
    members: 1,
    maxMembers: CLAN_MAX_MEMBERS,
    creationCostNucca: CLAN_CREATION_COST_NUCCA,
  },
];

export const MONTHLY_RANKING_RULES = [
  "Monthly ranking rewards are admin-funded from disclosed reserve balances.",
  "Points come from in-app music creation, daily map scans, verified votes, solo wins, crew wins, missions, and referrals.",
  "Crew 3v3 wins give clan points to every verified member on the winning side.",
  "Outfits, equipment, and accessories give RPG attributes. Reputation, stage, fan, rhythm, melody, production, and focus all influence battle strength and ranking.",
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

export function addAttributes(items: { attributes: ItemAttributes }[]) {
  return items.reduce((totals, item) => {
    for (const [key, value] of Object.entries(item.attributes)) {
      const attribute = key as ItemAttributeId;
      totals[attribute] = (totals[attribute] ?? 0) + (value ?? 0);
    }
    return totals;
  }, {} as Record<ItemAttributeId, number>);
}

export function battlePowerFromAttributes(attributes: ItemAttributes, reputation: number) {
  const stage = attributes.stage ?? 0;
  const fan = attributes.fan ?? 0;
  const rhythm = attributes.rhythm ?? 0;
  const melody = attributes.melody ?? 0;
  const production = attributes.production ?? 0;
  const focus = attributes.focus ?? 0;
  return Math.round(
    reputation * 1.4 +
      stage * 8 +
      fan * 7 +
      rhythm * 5 +
      melody * 5 +
      production * 4 +
      focus * 3,
  );
}

export function pickDiscoveryReward(seed: string, paidScan: boolean) {
  const rewards = paidScan
    ? DISCOVERY_REWARDS.filter((reward) => reward.paidEligible)
    : DISCOVERY_REWARDS;
  const totalWeight = rewards.reduce((total, reward) => total + reward.weight, 0);
  const hashValue = seed.split("").reduce((total, char) => {
    return (total * 31 + char.charCodeAt(0)) % 1_000_000;
  }, 17);
  let cursor = hashValue % totalWeight;

  for (const reward of rewards) {
    if (cursor < reward.weight) return reward;
    cursor -= reward.weight;
  }

  return rewards[0];
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
