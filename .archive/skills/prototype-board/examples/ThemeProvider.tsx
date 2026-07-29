// Reference implementation of a ThemeProvider for a prototype board.
// See references/theme-system.md for the conceptual model.
//
// What this does:
//   1. Holds theme state in a Context.
//   2. Writes CSS variables and data attributes to <html> on every change.
//   3. Persists to localStorage (recovers on next reload).
//   4. Exposes useTheme() for components that need to dispatch implementations.
//
// What this is NOT:
//   - It's not a CSS framework. CSS lives in styles/global.css and reads from
//     the variables / data attributes this writes.
//   - It's not a state library. It's React Context — fine because theme
//     changes are rare and fan out wide.
//
// Customize the token shapes below to match your project. The mechanism
// stays the same.

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// 1. Token dictionaries (in real code, this lives in theme/tokens.ts)
// ---------------------------------------------------------------------------

const stamps = {
  signal: { base: "#ff9500", deep: "#d97800", ink: "#6b3d00" },
  marigold: { base: "#f08800", deep: "#c26d00", ink: "#5c3500" },
  amber: { base: "#e07a1f", deep: "#b25e13", ink: "#522b08" },
} as const;

const surfaces = {
  pure: { bg: "#ffffff", surface: "#ffffff", recess: "#f7f7f8" },
  paper: { bg: "#faf8f3", surface: "#fdfcf8", recess: "#f4f1ea" },
} as const;

export type ThemeState = {
  surface: keyof typeof surfaces;
  stamp: keyof typeof stamps;
  lang: "en" | "cn";
  // Add more axes as you start A/B-ing them.
};

export const defaults: ThemeState = {
  surface: "paper",
  stamp: "signal",
  lang: "en",
};

// Re-export so ThemePanel and consumers can iterate options.
export const tokens = { stamps, surfaces } as const;

// ---------------------------------------------------------------------------
// 2. Context
// ---------------------------------------------------------------------------

type Ctx = {
  theme: ThemeState;
  set: <K extends keyof ThemeState>(key: K, value: ThemeState[K]) => void;
  reset: () => void;
};

const ThemeCtx = createContext<Ctx | null>(null);

export function useTheme(): Ctx {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme called outside ThemeProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// 3. Provider
// ---------------------------------------------------------------------------

const STORAGE_KEY = "prototype-board-theme";

function readInitial(): ThemeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeState>(readInitial);

  useEffect(() => {
    const root = document.documentElement;

    // Write CSS variables for the stamp axis (CSS reads var(--stamp))
    const stamp = stamps[theme.stamp];
    root.style.setProperty("--stamp", stamp.base);
    root.style.setProperty("--stamp-deep", stamp.deep);
    root.style.setProperty("--stamp-ink", stamp.ink);

    // Write CSS variables for the surface axis
    const surface = surfaces[theme.surface];
    root.style.setProperty("--bg", surface.bg);
    root.style.setProperty("--surface", surface.surface);
    root.style.setProperty("--recess", surface.recess);

    // Write data attributes for selector-based variants (CSS reads
    // [data-lang="cn"] .x { font-family: ... })
    root.dataset.lang = theme.lang;
    root.dataset.surface = theme.surface;
    root.dataset.stamp = theme.stamp;

    // Persist
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    } catch {
      // Storage full or disabled — silent failure is fine for a prototype.
    }
  }, [theme]);

  const value = useMemo<Ctx>(
    () => ({
      theme,
      set: (key, value) => setTheme((t) => ({ ...t, [key]: value })),
      reset: () => setTheme(defaults),
    }),
    [theme],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
