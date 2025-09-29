import { type Theme, useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils/cn";
import { MonitorIcon, MoonStarIcon, SunIcon } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

const THEME_OPTIONS: { icon: React.JSX.Element; value: Theme }[] = [
  {
    icon: <MonitorIcon />,
    value: "system",
  },
  {
    icon: <SunIcon />,
    value: "light",
  },
  {
    icon: <MoonStarIcon />,
    value: "dark",
  },
];

function ThemeOption({
  icon,
  isActive,
  onClick,
  value,
}: {
  icon: React.JSX.Element;
  value: Theme;
  isActive?: boolean;
  onClick: (value: Theme) => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "relative flex size-8 cursor-default items-center justify-center rounded-full transition-all [&_svg]:size-4",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
      role="radio"
      aria-checked={isActive}
      aria-label={`Switch to ${value} theme`}
      onClick={() => {
        onClick(value);
      }}
    >
      {icon}

      {isActive && (
        <motion.div
          layoutId="theme-option"
          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
          className="absolute inset-0 rounded-full border border-border"
        />
      )}
    </button>
  );
}

function ThemeSwitcher() {
  const { setTheme, theme } = useTheme();

  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="flex h-8 w-24" />;
  }

  return (
    <motion.div
      key={String(isMounted)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="inline-flex items-center overflow-hidden rounded-full bg-card ring-1 shadow-sm ring-border ring-inset"
      role="radiogroup"
    >
      {THEME_OPTIONS.map((option) => (
        <ThemeOption
          key={option.value}
          icon={option.icon}
          value={option.value}
          isActive={theme === option.value}
          onClick={setTheme}
        />
      ))}
    </motion.div>
  );
}

export { ThemeSwitcher };
