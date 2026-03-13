"use client";

import { useEffect, useEffectEvent, useRef } from "react";

interface UsePollingOptions {
  enabled?: boolean;
  intervalMs?: number;
  runOnMount?: boolean;
}

const DEFAULT_INTERVAL_MS = 30000;

export function usePolling(
  callback: () => void | Promise<void>,
  { enabled = true, intervalMs = DEFAULT_INTERVAL_MS, runOnMount = true }: UsePollingOptions = {}
) {
  const onPoll = useEffectEvent(callback);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const tick = async () => {
      if (cancelled || inFlightRef.current || document.visibilityState === "hidden") return;

      inFlightRef.current = true;
      try {
        await onPoll();
      } finally {
        inFlightRef.current = false;
      }
    };

    const refreshVisiblePage = () => {
      if (document.visibilityState === "visible") {
        void tick();
      }
    };

    if (runOnMount) {
      void tick();
    }

    const intervalId = window.setInterval(() => {
      void tick();
    }, intervalMs);

    window.addEventListener("focus", refreshVisiblePage);
    document.addEventListener("visibilitychange", refreshVisiblePage);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshVisiblePage);
      document.removeEventListener("visibilitychange", refreshVisiblePage);
    };
  }, [enabled, intervalMs, runOnMount]);
}
