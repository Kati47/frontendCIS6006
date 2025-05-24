"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSelector from "@/components/language-selector";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Timer } from "lucide-react";

export default function TwoFactorAuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [language, setLanguage] = useState("en");
  const [verificationCode, setVerificationCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const currentYear = new Date().getFullYear();
  
  // Get translations
  useEffect(() => {
    // Check for stored language preference
    const storedLang = localStorage.getItem("preferredLanguage");
    if (storedLang && ["en", "fr", "es"].includes(storedLang)) {
      setLanguage(storedLang);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split("-")[0];
      if (["en", "fr", "es"].includes(browserLang)) {
        setLanguage(browserLang);
      }
    }
    
    // Focus on the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Translation helper function
  const t = (key: string) => {
    try {
      const translations = require(`../../../public/locales/${language}/common.json`);
      return translations[key] || key;
    } catch (error) {
      return key;
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    localStorage.setItem("preferredLanguage", newLang);
  };

  // Handle the countdown timer for resending code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendCode = () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    
    // Simulate resending code
    setTimeout(() => {
      setIsResending(false);
      setCountdown(60); // Set countdown to 60 seconds
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate verification delay
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to dashboard after successful verification
      router.push('/dashboard');
    }, 1500);
  };
  
  // Format the countdown time
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(1, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center bg-[#f8f5f2] dark:bg-[#1f1a16] transition-colors duration-200 p-4">
        <div className="w-full max-w-md">
          <div className="absolute top-4 right-4 flex space-x-2">
            <ThemeToggle />
            <LanguageSelector currentLanguage={language} onLanguageChange={handleLanguageChange} />
          </div>

          {/* Logo/Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-[#d4c8be] dark:bg-[#3a322d] flex items-center justify-center mb-3 shadow-md">
              <span className="text-[#6d5c4e] dark:text-[#d4c8be] font-semibold text-xl">𝒦.</span>
            </div>
            <h1 className="text-2xl font-medium text-[#6d5c4e] dark:text-[#d4c8be]">{t('twoFactorAuth')}</h1>
          </div>
          
          <Card className="border border-[#e8e1db] dark:border-[#3a322d] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white dark:bg-[#2a2420] rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl text-center text-[#6d5c4e] dark:text-[#d4c8be]">
                {t('enterCode')}
              </CardTitle>
              <CardDescription className="text-center text-[#a39690] dark:text-[#a39690]">
                {t('codeInstructions')}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#e8e1db] dark:bg-[#3a322d] flex items-center justify-center">
                  <Mail className="w-8 h-8 text-[#bea99a] dark:text-[#d4c8be]" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  {/* Six digit OTP input */}
                  <div className="flex justify-center">
                    <Input 
                      ref={inputRef}
                      type="text" 
                      placeholder="••••••"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a] shadow-inner bg-white dark:bg-[#27211d] text-[#6d5c4e] dark:text-[#d4c8be] text-center text-xl tracking-[0.5em] max-w-[180px] font-mono"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-[#bea99a] dark:bg-[#a8968a] hover:bg-[#a8968a] dark:hover:bg-[#97877b] text-white shadow-sm transition-all hover:shadow-md"
                    disabled={isLoading || verificationCode.length !== 6}
                  >
                    {isLoading ? t('verifying') : t('verify')}
                  </Button>
                  
                  <div className="flex justify-center">
                    <Button 
                      type="button"
                      variant="ghost" 
                      className={`text-sm font-medium flex items-center gap-2 ${
                        countdown > 0 
                          ? 'text-[#a39690] dark:text-[#a39690] cursor-not-allowed'
                          : 'text-[#9c8578] dark:text-[#a39690] hover:text-[#7d6a5d] dark:hover:text-[#d4c8be] hover:bg-[#f1ece8] dark:hover:bg-[#3a322d]'
                      }`}
                      onClick={handleResendCode}
                      disabled={isResending || countdown > 0}
                    >
                      {isResending ? (
                        t('sendingCode')
                      ) : countdown > 0 ? (
                        <>
                          <Timer size={16} />
                          {t('resendCodeIn')} {formatCountdown()}
                        </>
                      ) : (
                        t('resendCode')
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
            
            <CardFooter className="flex justify-center border-t border-[#e8e1db] dark:border-[#3a322d] p-4">
              <Link 
                href="/login"
                className="flex items-center gap-1 text-sm text-[#9c8578] dark:text-[#a39690] hover:text-[#7d6a5d] dark:hover:text-[#d4c8be]"
              >
                <ArrowLeft size={16} />
                {t('backToLogin')}
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full bg-[#f1ece8] dark:bg-[#27211d] border-t border-[#e8e1db] dark:border-[#3a322d] py-4 px-6 text-center">
        <div className="max-w-screen-lg mx-auto flex flex-col sm:flex-row items-center justify-between">
          <div className="text-sm text-[#9c8578] dark:text-[#a39690] mb-2 sm:mb-0">
            © {currentYear} Authenticate. {t('allRightsReserved')}
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/privacy" 
              className="text-sm text-[#9c8578] dark:text-[#a39690] hover:text-[#7d6a5d] dark:hover:text-[#d4c8be]"
            >
              {t('privacyPolicy')}
            </Link>
            <Link 
              href="/terms" 
              className="text-sm text-[#9c8578] dark:text-[#a39690] hover:text-[#7d6a5d] dark:hover:text-[#d4c8be]"
            >
              {t('termsOfService')}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}