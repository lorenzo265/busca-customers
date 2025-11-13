import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "codex-blue": "#0076CE",
        "codex-navy": "#001B2E",
        "codex-cloud": "#F5F7FA",
        "codex-snow": "#FFFFFF",
        "codex-slate": "#94A3B8"
      },
      fontFamily: {
        sans: ["var(--font-dell-sans)", "Inter", "Helvetica Neue", "Segoe UI", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      boxShadow: {
        focus: "0 0 0 3px rgba(0, 118, 206, 0.35)",
        subtle: "0 4px 24px rgba(0, 27, 46, 0.18)"
      },
      borderRadius: {
        xl: "1.25rem"
      },
      transitionDuration: {
        brand: "200ms"
      }
    }
  },
  plugins: [forms]
};

export default config;