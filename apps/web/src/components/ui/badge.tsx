import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-white/70 px-2.5 py-1 text-xs font-semibold text-muted shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
