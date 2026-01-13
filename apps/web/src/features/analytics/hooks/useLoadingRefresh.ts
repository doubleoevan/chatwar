import { useEffect, useRef, useState } from "react";

/**
 * returns a refresh count that increments when the isLoading flag changes to true
 * so that charts can have a key to refresh on reload
 */
export function useLoadingRefresh(isLoading: boolean) {
  const [refreshCount, setRefreshCount] = useState(0);
  const loadingRef = useRef(isLoading);

  // update the refresh count whenever the isLoading flag changes to true
  useEffect(() => {
    if (loadingRef.current && !isLoading) {
      queueMicrotask(() => setRefreshCount((k) => k + 1));
    }
    loadingRef.current = isLoading;
  }, [isLoading]);

  return refreshCount;
}
