"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  variant?: "success" | "error";
}

export function Toast({ open, title, description, onClose, variant = "success" }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "pointer-events-auto fixed right-6 top-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border px-5 py-4 shadow-subtle",
            variant === "success"
              ? "border-codex-blue/20 bg-white text-codex-navy"
              : "border-red-200 bg-red-50 text-red-700"
          )}
        >
          {variant === "success" ? (
            <CheckCircle2 className="mt-0.5 h-6 w-6 text-codex-blue" />
          ) : (
            <X className="mt-0.5 h-6 w-6 text-red-500" />
          )}
          <div className="flex-1">
            <h3 className="text-sm font-semibold">{title}</h3>
            {description && <p className="mt-1 text-xs text-codex-slate">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-transparent p-1 text-codex-slate transition hover:border-codex-blue/30 hover:text-codex-blue"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}