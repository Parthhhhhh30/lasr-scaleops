import { useCallback, useSyncExternalStore } from "react";
export const SPLIT_INSPECTOR_QUERY = "(min-width: 1280px)";
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (!window.matchMedia) return () => {};
      const media = window.matchMedia(query);
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    [query],
  );
  const snapshot = useCallback(
    () => typeof window !== "undefined" && !!window.matchMedia?.(query).matches,
    [query],
  );
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
