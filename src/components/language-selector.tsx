"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

export default function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="rounded-full text-[#6d5c4e] dark:text-[#d4c8be] hover:bg-[#e8e1db] dark:hover:bg-[#3a322d]"
        >
          <Globe size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onLanguageChange("en")}>
          English {currentLanguage === "en" && "✓"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onLanguageChange("fr")}>
          Français {currentLanguage === "fr" && "✓"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onLanguageChange("es")}>
          Español {currentLanguage === "es" && "✓"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}