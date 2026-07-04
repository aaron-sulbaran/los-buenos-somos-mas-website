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
import { DEFAULT_LANG, t, type DictKey, type Lang } from "./dictionary";

const STORAGE_KEY = "lbsm.lang";
const LANG_EVENT = "lbsm:lang-change";

type LanguageContextValue = {
  lang: Lang;
  /** True once the visitor has ever picked a language (this visit or a past one). */
  hasChosen: boolean;
  /** False during server render and hydration; gates the first-visit prompt. */
  ready: boolean;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLang(value: string | null): value is Lang {
  return value === "en" || value === "es";
}

/**
 * localStorage is an external store: useSyncExternalStore reads it in a
 * hydration-safe way (server snapshot first, real value on the client)
 * and re-reads on our change event or a storage event from another tab.
 */
function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(LANG_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LANG_EVENT, callback);
  };
}

function readStoredLang(): Lang | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLang(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const storedLang = useSyncExternalStore(
    subscribe,
    readStoredLang,
    () => null,
  );
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const lang = storedLang ?? DEFAULT_LANG;
  const hasChosen = storedLang !== null;

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing may block storage; the choice still applies below.
    }
    document.cookie = `${STORAGE_KEY}=${next};path=/;max-age=31536000;samesite=lax`;
    window.dispatchEvent(new Event(LANG_EVENT));
  }, []);

  const value = useMemo(
    () => ({ lang, hasChosen, ready, setLang }),
    [lang, hasChosen, ready, setLang],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return ctx;
}

/** Translate an interface-chrome dictionary key in the active language. */
export function useT(): (key: DictKey) => string {
  const { lang } = useLanguage();
  return useCallback((key: DictKey) => t(key, lang), [lang]);
}
