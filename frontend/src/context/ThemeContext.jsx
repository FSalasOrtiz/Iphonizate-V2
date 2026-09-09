import React, { createContext, useContext, useEffect, useState } from "react";
import { THEMES, DEFAULT_THEME_ID } from "../lib/constants";
import { hexToRgbTriplet } from "../lib/color";

const ThemeContext = createContext(null);
const THEME_KEY = "iphonizate-theme";

function readStoredTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    return THEMES.some((t) => t.id === stored) ? stored : DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

// Traduce las claves del objeto "colors" de cada tema a nombres de
// variables CSS reales.
const VAR_MAP = {
  bg: "--bg",
  bgElev: "--bg-elev",
  surface: "--surface",
  surface2: "--surface-2",
  border: "--border",
  borderSoft: "--border-soft",
  text: "--text",
  textDim: "--text-dim",
  textFaint: "--text-faint",
  primary: "--primary",
  primaryFg: "--primary-fg",
  primaryHover: "--primary-hover",
  pink: "--pink",
  pinkDark: "--pink-dark",
  pinkSecondary: "--pink-secondary",
};

export function ThemeProvider({ children }) {
  const [themeId, setThemeIdState] = useState(readStoredTheme);
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  // Aplica TODA la paleta como variables CSS en <html>, así se ve en
  // cualquier parte de la app (incluida la pantalla de login) sin
  // necesidad de envolver cada componente.
  useEffect(() => {
    const el = document.documentElement;
    Object.entries(VAR_MAP).forEach(([key, cssVar]) => {
      el.style.setProperty(cssVar, theme.colors[key]);
    });
    el.style.setProperty("--pink-soft", `rgba(${hexToRgbTriplet(theme.colors.pink)}, 0.10)`);
    el.style.setProperty("--primary-soft", `rgba(${hexToRgbTriplet(theme.colors.primary)}, 0.06)`);
    // El CSS usa [data-theme="oscuro"] para los pocos ajustes que las
    // variables no cubren (sombras, opacidades de las tintas de color).
    el.dataset.theme = theme.id;
  }, [theme]);

  const setThemeId = (id) => {
    if (!THEMES.some((t) => t.id === id)) return;
    setThemeIdState(id);
    window.localStorage.setItem(THEME_KEY, id);
  };

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, themes: THEMES, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme() debe usarse dentro de <ThemeProvider>");
  return ctx;
}
