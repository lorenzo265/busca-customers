import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
};

export function Input({ className, startAdornment, endAdornment, ...props }: InputProps) {
  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 rounded-full border border-codex-blue/30 bg-white px-4 py-3 shadow-subtle transition focus-within:border-codex-blue focus-within:ring-2 focus-within:ring-codex-blue/40",
        className
      )}
    >
      {startAdornment && <span className="text-codex-blue transition group-focus-within:text-codex-blue">{startAdornment}</span>}
      <input
        className="w-full border-none bg-transparent text-sm text-codex-navy outline-none placeholder:text-codex-slate"
        {...props}
      />
      {endAdornment}
    </div>
  );
}