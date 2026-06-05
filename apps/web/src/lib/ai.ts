export type AiJobStatus =
  | "queued"
  | "sleeping"
  | "capacity_full"
  | "offline"
  | "running"
  | "failed"
  | "complete";

export const FREE_AI_GENERATORS = [
  {
    id: "lyrics-qwen3",
    name: "Lyrics Lab",
    model: "Qwen3 small open-weight",
    license: "Apache 2.0",
    status: "queued",
    dailyCap: 3,
  },
  {
    id: "beats-ace-step",
    name: "Beat Forge",
    model: "ACE-Step 1.5",
    license: "MIT",
    status: "capacity_full",
    dailyCap: 1,
  },
  {
    id: "thumb-flux-schnell",
    name: "Thumbnail Reactor",
    model: "FLUX.1 Schnell",
    license: "Apache 2.0",
    status: "sleeping",
    dailyCap: 1,
  },
  {
    id: "voice-openvoice",
    name: "Voice Consent Lab",
    model: "OpenVoice",
    license: "MIT",
    status: "offline",
    dailyCap: 0,
  },
] as const;
