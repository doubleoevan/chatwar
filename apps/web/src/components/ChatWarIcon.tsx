import { cn } from "@chatwar/ui";
import darkIconUrl from "@/assets/icons/chatwar-dark.svg";
import lightIconUrl from "@/assets/icons/chatwar-light.svg";
import { useTheme } from "@/providers/theme";

type ChatWarIconProps = {
  className?: string;
  size?: number;
};

export function ChatWarIcon({ className, size = 20 }: ChatWarIconProps) {
  const { theme } = useTheme();
  const iconUrl = theme === "dark" ? darkIconUrl : lightIconUrl;
  return (
    <img
      src={iconUrl}
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}
