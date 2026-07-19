import {
  FunctionComponent,
  isValidElement,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { MoonIcon, SunIcon } from "@govtechmy/myds-react/icon";
import { Button } from "@govtechmy/myds-react/button";
import {
  Select,
  SelectValue,
  SelectItem,
  SelectTrigger,
  SelectContent,
} from "@govtechmy/myds-react/select";
import { Slot } from "@radix-ui/react-slot";

interface Theme {
  label: string;
  value: string;
  icon: ReactNode;
}

interface ThemeSwitch {
  as?: "toggle" | "select";
  themes?: Array<Theme>;
  onChange?: (value: string) => void;
}

const disableTransitionsTemporarily = () => {
  const css = document.createElement("style");
  css.appendChild(
    document.createTextNode(
      `* {
				-webkit-transition: none !important;
				-moz-transition: none !important;
				-o-transition: none !important;
				-ms-transition: none !important;
				transition: none !important;
			}`,
    ),
  );
  document.head.appendChild(css);

  // Force reflow
  (() => window.getComputedStyle(document.body))();

  // Remove after the theme class has safely applied
  setTimeout(() => {
    if (document.head.contains(css)) {
      document.head.removeChild(css);
    }
  }, 50);
};

const ThemeSwitch: FunctionComponent<ThemeSwitch> = ({
  as = "toggle",
  themes = [
    { label: "Light", value: "light", icon: <SunIcon /> },
    { label: "Dark", value: "dark", icon: <MoonIcon /> },
  ],
  onChange,
}) => {
  const [theme, setThemeState] = useState<string>("light");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize theme from document or localStorage on client mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDarkClass = document.documentElement.classList.contains("dark");
    const activeTheme = savedTheme || (isDarkClass ? "dark" : "light");
    setThemeState(activeTheme);

    const index = themes.findIndex((t) => t.value === activeTheme);
    setCurrentIndex(index >= 0 ? index : 0);
  }, []);

  const getTheme = (value: string) =>
    themes.find((theme) => theme.value === value);

  const displayIcon = (value?: string | null) => {
    if (!value) return null;
    const _theme = getTheme(value);
    if (isValidElement(_theme?.icon))
      return (
        <Slot className={"text-txt-black-900 size-4 flex-shrink-0 dark:text-white"}>
          {_theme?.icon}
        </Slot>
      );
    return _theme?.icon;
  };

  /*------------------ as toggle -----------------*/
  const handleChange = (value?: string) => {
    if (themes.length <= 1) return;

    disableTransitionsTemporarily();

    let targetTheme = theme;
    if (as === "toggle") {
      const nextIndex = (currentIndex + 1) % themes.length;
      setCurrentIndex(nextIndex);
      targetTheme = themes[nextIndex]!.value;
    } else if (as === "select") {
      if (!value) return;
      targetTheme = value;
    }

    // Toggle document class
    if (targetTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", targetTheme);
    setThemeState(targetTheme);

    if (onChange) onChange(targetTheme);
  };

  useEffect(() => {
    if (as === "toggle") {
      const index = themes.findIndex((t) => t.value === theme);
      setCurrentIndex(index >= 0 ? index : 0);
    }
  }, [theme]);

  if (as === "toggle")
    return (
      <Button
        variant="default-ghost"
        className="aspect-square flex-shrink-0 rounded-md focus:ring-otl-success-200/40 text-txt-black-900 dark:text-white"
        onClick={() => handleChange()}
        size="small"
        aria-label={themes[currentIndex]?.label}
        iconOnly
      >
        {displayIcon(themes[currentIndex]?.value) ||
          themes[currentIndex]?.label}
      </Button>
    );

  /*------------------ as select -----------------*/

  return (
    <Select
      size="small"
      variant="outline"
      value={theme}
      onValueChange={handleChange}
    >
      <SelectTrigger>
        <SelectValue>
          {(value) => (
            <div className="flex items-center gap-2">
              <div>{displayIcon(value as string)}</div>
              <span>{getTheme(value as string)?.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {themes.map((theme) => (
          <SelectItem
            key={theme.value}
            value={theme.value}
            aria-label={theme.label}
          >
            {theme.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

ThemeSwitch.displayName = "ThemeSwitch";

export { ThemeSwitch };
