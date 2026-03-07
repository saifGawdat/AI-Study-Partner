import { useState, useEffect } from "react";

export type NavigationStyle = "dock" | "sidebar";

export const usePreferences = () => {
  const [navigationStyle, setNavigationStyle] = useState<NavigationStyle>(
    () => {
      const saved = localStorage.getItem("navigationStyle");
      return (saved as NavigationStyle) || "dock";
    },
  );

  useEffect(() => {
    localStorage.setItem("navigationStyle", navigationStyle);
    // Dispatch a custom event so other components (like layouts) can react immediately
    window.dispatchEvent(new Event("preferenceChange"));
  }, [navigationStyle]);

  return {
    navigationStyle,
    setNavigationStyle,
  };
};
