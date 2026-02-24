import { Link } from "react-router-dom";
import SettingsMenu from "@/components/SettingsMenu";
import { ChatWarIcon } from "@/components/ChatWarIcon";

export function Header() {
  return (
    <header>
      <nav
        className="mx-auto flex h-14 items-center justify-between px-4 pr-2"
        aria-label="Primary navigation"
      >
        {/* logo */}
        <Link
          to="/chat"
          className="
            flex items-center gap-2
            font-semibold text-primary
            hover:opacity-90
          "
          aria-label="Go to chat"
        >
          <ChatWarIcon />
          <span>ChatWar</span>
        </Link>

        {/* tagline */}
        <span className="text-sm text-muted-foreground">
          A fight club for LLMs. <span className="inline-block text-base">🤫</span>
        </span>

        {/* settings menu */}
        <SettingsMenu />
      </nav>
    </header>
  );
}
