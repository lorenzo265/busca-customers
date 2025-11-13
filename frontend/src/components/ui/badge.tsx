import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-codex-blue/20 bg-codex-blue/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-codex-blue",
        className
      )}
      {...props}
    />
  );
}