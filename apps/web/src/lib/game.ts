export type CreatorStyleSlot = "frame" | "badge" | "backdrop" | "introFx" | "title";
export type OutfitSlot = "hair" | "jacket" | "top" | "pants" | "shoes" | "accessory" | "aura";
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
};

export type CreatorOutfitItem = {
  id: string;
  name: string;
  genre: MusicGenre;
  slot: OutfitSlot;
  rarity: "common" | "rare" | "epic" | "legendary";
  visual: string;
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
  },
  {
    id: "pop-star-glow",
    name: "Pop Star Glow",
    genre: "pop",
    slot: "aura",
    rarity: "rare",
    visual: "soft white spotlight and glossy stage sparkle",
    priceNucca: 120,
  },
  {
    id: "techno-neon-visor",
    name: "Techno Neon Visor",
    genre: "techno",
    slot: "accessory",
    rarity: "epic",
    visual: "cyan visor with animated equalizer reflection",
    priceNucca: 210,
  },
  {
    id: "commercial-chrome-coat",
    name: "Commercial Chrome Coat",
    genre: "commercial",
    slot: "jacket",
    rarity: "rare",
    visual: "clean silver coat for premium brand drops",
    priceNucca: 160,
  },
  {
    id: "classical-conductor-tailcoat",
    name: "Conductor Tailcoat",
    genre: "classical",
    slot: "jacket",
    rarity: "epic",
    visual: "black formal tailcoat with gold baton accent",
    priceNucca: 220,
  },
  {
    id: "gospel-light-robe",
    name: "Gospel Light Robe",
    genre: "gospel",
    slot: "top",
    rarity: "legendary",
    visual: "white and gold robe with luminous choir halo",
    priceNucca: 360,
  },
  {
    id: "oriental-silk-dragon",
    name: "Silk Dragon Set",
    genre: "oriental",
    slot: "top",
    rarity: "legendary",
    visual: "red silk stage layer with gold dragon trim",
    priceNucca: 390,
  },
  {
    id: "trap-shadow-chain",
    name: "Trap Shadow Chain",
    genre: "trap",
    slot: "accessory",
    rarity: "rare",
    visual: "heavy black-gold chain and dark bass pulse",
    priceNucca: 140,
  },
  {
    id: "latin-solar-shirt",
    name: "Latin Solar Shirt",
    genre: "latin",
    slot: "top",
    rarity: "rare",
    visual: "orange dance shirt with animated percussion glow",
    priceNucca: 130,
  },
  {
    id: "afrobeat-pattern-kicks",
    name: "Afrobeat Pattern Kicks",
    genre: "afrobeat",
    slot: "shoes",
    rarity: "epic",
    visual: "festival pattern sneakers with rhythm particles",
    priceNucca: 190,
  },
  {
    id: "jazz-midnight-suit",
    name: "Jazz Midnight Suit",
    genre: "jazz",
    slot: "jacket",
    rarity: "epic",
    visual: "midnight suit with gold lapel and saxophone pin",
    priceNucca: 240,
  },
  {
    id: "reggaeton-club-glasses",
    name: "Reggaeton Club Glasses",
    genre: "reggaeton",
    slot: "accessory",
    rarity: "rare",
    visual: "summer club sunglasses with pink-blue reflections",
    priceNucca: 125,
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
