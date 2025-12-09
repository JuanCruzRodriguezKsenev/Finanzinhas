"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "claro" | "oscuro";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("claro");

  useEffect(() => {
    // 1. Buscamos si el usuario ya guardó una preferencia antes
    const savedTheme = localStorage.getItem("finansinho-tema") as Theme;

    if (savedTheme) {
      // Si ya eligió antes, respetamos su elección
      setTheme(savedTheme);
      document.body.className = savedTheme;
    } else {
      // 2. Si es la PRIMERA VEZ, preguntamos al navegador qué prefiere el sistema
      const prefiereOscuro = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const temaSistema = prefiereOscuro ? "oscuro" : "claro";

      setTheme(temaSistema);
      document.body.className = temaSistema;
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "claro" ? "oscuro" : "claro";
    setTheme(newTheme);
    localStorage.setItem("finansinho-tema", newTheme);
    document.body.className = newTheme;
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
