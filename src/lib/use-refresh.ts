"use client";

import { useEffect, useCallback, useRef } from "react";

/**
 * Re-executa `onRefresh` sempre que:
 * - A aba/app volta ao foco (visibilitychange)
 * - O usuário navega de volta para a página (popstate / focus)
 */
export function useAutoRefresh(onRefresh: () => void) {
  const ref = useRef(onRefresh);
  ref.current = onRefresh;

  const handleVisibility = useCallback(() => {
    if (document.visibilityState === "visible") {
      ref.current();
    }
  }, []);

  const handleFocus = useCallback(() => {
    ref.current();
  }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, [handleVisibility, handleFocus]);
}
