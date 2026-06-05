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
    id: "tts-piper",
    name: "Simple TTS Booth",
    model: "Piper",
    license: "MIT",
    status: "queued",
    dailyCap: 2,
  },
  {
    id: "prompt-qwen3",
    name: "Hook Prompt Engine",
    model: "Qwen3 small open-weight",
    license: "Apache 2.0",
    status: "queued",
    dailyCap: 5,
  },
  {
    id: "arranger-local",
    name: "Arrangement Coach",
    model: "local rules + Qwen3 optional",
    license: "in-app",
    status: "queued",
    dailyCap: 10,
  },
  {
    id: "voice-openvoice",
    name: "Voice Consent Lab",
    model: "OpenVoice",
    license: "MIT",
    status: "offline",
    dailyCap: 0,
  },
  {
    id: "cover-consent",
    name: "Cover Consent Gate",
    model: "user-owned audio only",
    license: "consent-required",
    status: "offline",
    dailyCap: 0,
  },
] as const;
