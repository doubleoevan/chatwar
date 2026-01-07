import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export function useAutoScroll({
  bottomThreshold = 80,
  scrollBehavior = "auto",
}: {
  bottomThreshold?: number;
  scrollBehavior?: ScrollBehavior;
} = {}) {
  // ref to attach to the scroll area and its scrolling viewport ref inside
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // store enable scrolling flag with a ref
  const enableScrollingRef = useRef(true);

  // check if viewport is near the bottom
  const isNearBottom = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return true;
    }
    const bottomDistance = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    return bottomDistance <= bottomThreshold;
  }, [bottomThreshold]);

  // scroll to the bottom
  const scrollToBottom = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: scrollBehavior,
    });
  }, [scrollBehavior]);

  // set the viewport ref when the scroll element mounts
  useLayoutEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) {
      return;
    }
    viewportRef.current = scrollElement.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLDivElement | null;

    // set initial scrolling state
    enableScrollingRef.current = isNearBottom();
  }, [isNearBottom]);

  // enable scrolling if viewport is near the bottom
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    // update enable scrolling flag on scroll
    const onScroll = () => {
      enableScrollingRef.current = isNearBottom();
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", onScroll);
  }, [isNearBottom]);

  // auto-scroll down as content expands below viewport
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    let animationFrame = 0;
    const resizeObserver = new ResizeObserver(() => {
      // skip if scroll is not enabled
      if (!enableScrollingRef.current) {
        return;
      }

      // cancel previous scroll and start a new scroll
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        scrollToBottom();
      });
    });

    // track the viewport content
    const content = viewport.firstElementChild as HTMLElement | null;
    if (content) {
      resizeObserver.observe(content);
    }

    // cancel scrolling and resize tracking
    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [scrollToBottom]);

  // export the scroll area ref and scroll function
  return {
    scrollRef,
    scrollToBottom,
  };
}
