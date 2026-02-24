import { ExternalLink } from "@/components/ExternalLink";

const REPO_URL = "https://github.com/doubleoevan/chatwar";

export function Footer() {
  return (
    <footer>
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-muted-foreground">
        <p>ChatWar is a selfish project for the author’s own personal growth.</p>
        <p>Your API keys stay on your device.</p>
        <p>
          <span>The code can be found </span>
          <ExternalLink className="font-semibold text-primary dark:text-primary/70" href={REPO_URL}>
            here
          </ExternalLink>
          .
        </p>
      </div>
    </footer>
  );
}
