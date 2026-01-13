declare module "stopword" {
  export const eng: string[];

  export function removeStopwords(words: string[], stopwords?: string[]): string[];
}
