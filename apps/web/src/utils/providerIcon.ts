import type { ProviderId } from "@chatwar/shared";
import { PROVIDER_CONFIGURATIONS } from "@/config/provider-configurations";

export type IconCacheEntry = { img: HTMLImageElement; status: "loading" | "ready" | "error" };
const iconCache = new Map<string, IconCacheEntry>();

/**
 * Return the provider icon with the theme color as the current color
 */
export function getProviderIcon(
  providerId: ProviderId,
  options?: { color?: string; onLoad?: () => void },
) {
  // return the icon from the cache or load a new image
  const color = options?.color ?? getComputedStyle(document.body).color;
  const cacheKey = `${providerId}:${color}`;
  const icon = iconCache.get(cacheKey);
  if (icon) {
    return icon.img;
  }
  const image = new Image();
  iconCache.set(cacheKey, { img: image, status: "loading" });

  // set the loaded status and invoke the callback
  image.onload = () => {
    const entry = iconCache.get(cacheKey);
    if (entry) {
      entry.status = "ready";
    }
    options?.onLoad?.();
  };

  // set the error status
  image.onerror = () => {
    const entry = iconCache.get(cacheKey);
    if (entry) {
      entry.status = "error";
    }
  };

  // update the svg to the theme color and return the image
  const svg = PROVIDER_CONFIGURATIONS[providerId].iconSvg;
  const themeSvg = svg.replaceAll("currentColor", color);
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(themeSvg)}`;
  return image;
}
