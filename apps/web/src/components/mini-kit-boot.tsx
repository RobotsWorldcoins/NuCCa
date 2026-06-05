"use client";

import { useEffect, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

export function MiniKitBoot() {
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID;
      const result = MiniKit.install(appId);
      setInstalled(Boolean(result.success || MiniKit.isInstalled()));
    });
  }, []);

  return (
    <span className="rounded-full border border-line bg-white/70 px-2.5 py-1 text-xs font-semibold text-muted shadow-sm">
      MiniKit {installed ? "ready" : "web preview"}
    </span>
  );
}
