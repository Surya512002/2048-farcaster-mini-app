"use client"

import { useTheme } from "./ThemeProvider"
import { Moon, Sun } from "lucide-react"

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
      aria-label="Toggle theme"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      ) : (
        <Sun className="w-5 h-5 text-amber-500" />
      )}
    </button>
  )
}

export default ThemeToggleButton
