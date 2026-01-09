// normalize markdown to prevent rendering breakage from malformed output
export function normalizeMarkdown(input: string): string {
  // close all open fences
  const fenceCount = (input.match(/```/g) ?? []).length;
  if (fenceCount % 2 === 1) {
    return `${input}\n\`\`\``;
  }
  return input;
}
