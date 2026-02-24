import {
  cn,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@chatwar/ui";
import { Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "@/providers/theme";

export default function SettingsMenu() {
  const { theme, setTheme } = useTheme();

  const onChangeTheme = (theme: string) => {
    if (theme !== "light" && theme !== "dark") {
      return;
    }
    setTheme(theme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings" className="cursor-pointer">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 space-y-1">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => onChangeTheme("light")}
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === "light" && "bg-accent text-accent-foreground font-medium",
          )}
        >
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Light
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onChangeTheme("dark")}
          className={cn(
            "flex items-center gap-2 cursor-pointer",
            theme === "dark" && "bg-accent text-accent-foreground font-medium",
          )}
        >
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Dark
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
