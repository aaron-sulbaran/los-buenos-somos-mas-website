"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/**
 * Two design explorations for the home page, gated to development only.
 *
 *  - Star motif: the hero constellation renders as an irregular "scatter"
 *    (default) or a deliberate "arc" of four with a fifth clipped by the frame.
 *  - Display font: the display serif swaps between Fraunces (default) and two
 *    editorial alternates, Newsreader and Spectral.
 *
 * In production `process.env.NODE_ENV` folds to a constant, so the toggle, the
 * switching styles, and the alternate branches are dead-code eliminated. The
 * page then renders the defaults with no exploration surface at all.
 *
 * The selected values live in localStorage and are read through
 * useSyncExternalStore, the same hydration-safe pattern the language context
 * uses, so there is no setState-in-effect and no server/client mismatch.
 */

export type StarMotif = "scatter" | "arc";
export type DisplayFont = "fraunces" | "newsreader" | "spectral";

const IS_DEV = process.env.NODE_ENV === "development";

const STAR_KEY = "lbsm.dev.starMotif";
const FONT_KEY = "lbsm.dev.displayFont";
const STORE_EVENT = "lbsm:dev-exploration";

const STAR_ORDER = ["scatter", "arc"] as const;
const FONT_ORDER = ["fraunces", "newsreader", "spectral"] as const;

const FONT_LABEL: Record<DisplayFont, string> = {
  fraunces: "Fraunces",
  newsreader: "Newsreader",
  spectral: "Spectral",
};

type ExplorationValue = {
  starMotif: StarMotif;
  displayFont: DisplayFont;
  cycleStar: () => void;
  cycleFont: () => void;
};

const ExplorationContext = createContext<ExplorationValue>({
  starMotif: "scatter",
  displayFont: "fraunces",
  cycleStar: () => {},
  cycleFont: () => {},
});

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(STORE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORE_EVENT, callback);
  };
}

function readStored<T extends string>(
  key: string,
  order: readonly T[],
  fallback: T,
): T {
  if (!IS_DEV) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value !== null && (order as readonly string[]).includes(value)
      ? (value as T)
      : fallback;
  } catch {
    return fallback;
  }
}

function cycleStored<T extends string>(key: string, order: readonly T[]): void {
  const current = readStored(key, order, order[0]);
  const next = order[(order.indexOf(current) + 1) % order.length];
  try {
    window.localStorage.setItem(key, next);
  } catch {
    // Private browsing can block storage; the event still fans out below.
  }
  window.dispatchEvent(new Event(STORE_EVENT));
}

function useStored<T extends string>(
  key: string,
  order: readonly T[],
  fallback: T,
): T {
  const getSnapshot = useCallback(
    () => readStored(key, order, fallback),
    [key, order, fallback],
  );
  return useSyncExternalStore(subscribe, getSnapshot, () => fallback);
}

export function HomeExplorationProvider({ children }: { children: ReactNode }) {
  const starMotif = useStored<StarMotif>(STAR_KEY, STAR_ORDER, "scatter");
  const displayFont = useStored<DisplayFont>(FONT_KEY, FONT_ORDER, "fraunces");

  // Sync the chosen display face to the root; the switching CSS reads it.
  // Updating the DOM from state is exactly what an effect is for.
  useEffect(() => {
    if (!IS_DEV) return;
    document.documentElement.dataset.displayFont = displayFont;
  }, [displayFont]);

  const cycleStar = useCallback(() => cycleStored(STAR_KEY, STAR_ORDER), []);
  const cycleFont = useCallback(() => cycleStored(FONT_KEY, FONT_ORDER), []);

  const value = useMemo(
    () => ({ starMotif, displayFont, cycleStar, cycleFont }),
    [starMotif, displayFont, cycleStar, cycleFont],
  );

  return (
    <ExplorationContext.Provider value={value}>
      {children}
      {IS_DEV ? <ExplorationDevTools /> : null}
    </ExplorationContext.Provider>
  );
}

export function useHomeExploration(): ExplorationValue {
  return useContext(ExplorationContext);
}

/** Dev-only: the switching stylesheet plus the floating cycle control. */
function ExplorationDevTools() {
  const { starMotif, displayFont, cycleStar, cycleFont } = useHomeExploration();

  return (
    <>
      <style>{`
        :root[data-display-font="newsreader"] { --font-display: var(--font-newsreader); }
        :root[data-display-font="spectral"] { --font-display: var(--font-spectral); }
      `}</style>
      <div
        className="fixed bottom-3 right-3 z-50 flex flex-col gap-1 rounded-md border border-border bg-card/95 px-2 py-2 text-[10px] uppercase tracking-[0.14em] text-muted shadow-sm backdrop-blur-sm"
        aria-label="Design exploration (development only)"
      >
        <button
          type="button"
          onClick={cycleStar}
          className="flex items-center gap-2 rounded px-1.5 py-1 text-left transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <span className="text-foreground/40">star</span>
          <span className="text-foreground normal-case tracking-normal">
            {starMotif}
          </span>
        </button>
        <button
          type="button"
          onClick={cycleFont}
          className="flex items-center gap-2 rounded px-1.5 py-1 text-left transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <span className="text-foreground/40">font</span>
          <span className="font-display text-foreground normal-case tracking-normal">
            {FONT_LABEL[displayFont]}
          </span>
        </button>
      </div>
    </>
  );
}
