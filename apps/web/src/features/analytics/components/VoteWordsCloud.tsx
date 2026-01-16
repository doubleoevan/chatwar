import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@chatwar/ui";
import ReactWordcloud from "react-wordcloud";
import { eng as ENGLISH_STOP_WORDS, removeStopwords } from "stopword";
import { Filter } from "bad-words";
import { useAnalytics } from "@/providers/analytics";
import type { ProviderModelVoteResponse } from "@chatwar/shared";
import { useTheme } from "@/providers/theme";
import { useLoadingRefresh } from "@/features/analytics/hooks/useLoadingRefresh";

type Word = { text: string; value: number };
type Options = Record<string, unknown>;

// convert the message into words
function toWords(message: string): string[] {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function toWordCountItems(votes: ProviderModelVoteResponse[], maxWords?: number): Word[] {
  // convert the vote messages into a word counts map
  // filtering out stop words and bad words
  const wordCounts = new Map<string, number>();
  const profanityFilter = new Filter();
  for (const vote of votes) {
    const words = toWords(vote.message);
    const cleanWords = removeStopwords(words, ENGLISH_STOP_WORDS).filter(
      (word) => !profanityFilter.isProfane(word),
    );

    // map the words to their counts
    for (const word of cleanWords) {
      const count = wordCounts.get(word) ?? 0;
      wordCounts.set(word, count + 1);
    }
  }

  // convert the word count map into the format expected by the tag cloud
  const wordCountItems = Array.from(wordCounts.entries())
    .map(([text, value]) => ({ text, value }))
    .sort((first, second) => second.value - first.value);
  return maxWords ? wordCountItems.slice(0, maxWords) : wordCountItems;
}

export function VoteWordsCloud({ className, options }: { className?: string; options?: Options }) {
  // convert the vote messages into words
  const { theme } = useTheme();
  const { votes, isAnalyticsLoading } = useAnalytics();
  const refreshCount = useLoadingRefresh(isAnalyticsLoading); // for rerendering on refresh

  // use a ref and state to measure the parent container and set the word cloud size
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState<[number, number] | null>(null);

  // measure the parent container on resize
  useEffect(() => {
    if (!containerElement) {
      return;
    }

    // set the size initially and also after the layout settles
    const measure = () => {
      const boundaries = containerElement.getBoundingClientRect();
      const width = Math.floor(boundaries.width);
      const height = Math.floor(boundaries.height);
      if (width > 0) {
        setSize([width, Math.max(height, 1)]);
      }
    };
    measure();
    const frameId = requestAnimationFrame(measure);

    // update the size on resize
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(containerElement);
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [containerElement]);

  // use the size to determine the number of words to show
  const maxWords = size && size[0] < 500 ? 40 : size && size[0] < 700 ? 50 : 60;
  const wordCounts = useMemo(() => toWordCountItems(votes, maxWords), [votes, maxWords]);

  // set the light and dark mode colors
  const isDark = theme === "dark";
  const colors = isDark
    ? ["#e5e7eb", "#d1d5db", "#9ca3af", "#6b7280"]
    : ["#475569", "#334155", "#1e293b", "#0f172a"];

  return (
    <div ref={setContainerElement} className={cn("items-center justify-center", className)}>
      {wordCounts.length === 0 ? (
        <span className="text-foreground">
          {isAnalyticsLoading ? "Loading..." : "No votes yet"}
        </span>
      ) : (
        size && (
          <ReactWordcloud
            key={refreshCount}
            words={wordCounts}
            minSize={size}
            size={size}
            callbacks={{
              getWordTooltip: (word: Word) => `${word.text} ${word.value}x`,
              onWordMouseOver: (_, event) => {
                (event?.target as HTMLElement).style.cursor = "pointer";
              },
              onWordMouseOut: (_, event) => {
                (event?.target as HTMLElement).style.cursor = "default";
              },
            }}
            options={{
              deterministic: true,
              rotations: 1,
              rotationAngles: [0, 0],
              fontSizes: [14, 64],
              padding: 2,
              fontFamily: "Inter, system-ui, sans-serif",
              colors: colors,
              ...options,
            }}
          />
        )
      )}
    </div>
  );
}
