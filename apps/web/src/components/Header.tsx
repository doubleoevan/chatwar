import { Link } from "react-router-dom";
import SettingsMenu from "@/components/SettingsMenu";
import { ChatWarIcon } from "@/components/ChatWarIcon";

export function Header() {
  return (
    <header className="border-b">
      <nav
        className="mx-auto flex h-14 items-center justify-between px-4"
        aria-label="Primary navigation"
      >
        {/* Left: Logo */}
        <Link
          to="/chat"
          className="flex items-center gap-2 font-semibold hover:opacity-90"
          aria-label="Go to chat"
        >
          <ChatWarIcon />
          <span>ChatWar</span>
        </Link>

        {/* Right: Settings */}
        <SettingsMenu />
      </nav>
    </header>
  );
}
