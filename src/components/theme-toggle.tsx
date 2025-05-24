"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Initialize theme from system preference or localStorage
  useEffect(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Use system preference as fallback
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(isDarkMode ? "dark" : "light");
    }

    // Apply theme to document
    document.documentElement.classList.toggle("dark", savedTheme === "dark" || 
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches));
  }, []);

  // Update theme when changed
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={toggleTheme}
      className="rounded-full text-[#6d5c4e] dark:text-[#d4c8be] hover:bg-[#e8e1db] dark:hover:bg-[#3a322d]"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </Button>
  );
}