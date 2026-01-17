export function toCssColor(rgb: [number, number, number], alpha?: number): string {
  const [r, g, b] = rgb;
  return typeof alpha === "number" ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
}
