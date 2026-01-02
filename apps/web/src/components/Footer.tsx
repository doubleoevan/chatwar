import { ExternalLink } from "@/components/ExternalLink";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-screen-xl px-4 py-6 text-center text-sm text-muted-foreground">
        <p>ChatWar is a selfish project for the author’s personal growth.</p>
        <p>Your API key stays on your device.</p>
        <p>
          The code can be found{" "}
          <ExternalLink href="https://github.com/doubleoevan/chatwar">here</ExternalLink>.
        </p>
      </div>
    </footer>
  );
}
