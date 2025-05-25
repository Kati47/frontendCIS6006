"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSelector from "@/components/language-selector";
import { RefreshCw, ShieldCheck, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SetupMFAPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [language, setLanguage] = useState("en");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [setupComplete, setSetupComplete] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // TOTP setup states
  const [qrCode, setQrCode] = useState("");
  const [verificationStep, setVerificationStep] = useState(0); // 0: setup, 1: verify, 2: enable

  const router = useRouter();
  const currentYear = new Date().getFullYear();

  // Helper function to get path with language prefix
  const getLocalizedPath = (path: string) => {
    return `/${language}${path.startsWith('/') ? path : `/${path}`}`;
  };

  // Initialize browser-only values safely
  useEffect(() => {
    // This will only run in the browser
    const storedToken = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('userId');

    setToken(storedToken);
    setUserId(storedUserId);

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
  }, []);

  // Fetch QR code when userId is available
  useEffect(() => {
    if (userId) {
      fetchQRCode();
    }
  }, [userId]);

  // Fetch QR code for setup
  const fetchQRCode = async () => {
    setIsLoading(true);

    try {
      if (!userId) {
        toast.error(t('userIdNotFound'));
        router.push(getLocalizedPath('/login'));
        return;
      }

      const response = await fetch(`${API_URL}/auth/mfa/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }) // Pass userId in the body
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('failedToFetchQRCode'));
      }

      const data = await response.json();
      setQrCode(data.qrCode);

    } catch (error: any) {
      console.error('Error fetching QR code:', error);
      toast.error(error.message || t('mfaSetupError'));
    } finally {
      setIsLoading(false);
    }
  };

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
    if (typeof window !== 'undefined') {
      localStorage.setItem("preferredLanguage", newLang);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/[^0-9]/g, '');

    // Limit to 6 digits
    if (value.length <= 6) {
      if (verificationStep === 0) {
        setVerificationCode(value);
      } else {
        setConfirmCode(value);
      }
    }
  };

  // Verify the TOTP code
  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      if (!userId) {
        toast.error(t('userIdNotFound'));
        router.push(getLocalizedPath('/login'));
        return;
      }

      const response = await fetch(`${API_URL}/auth/mfa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          token: verificationCode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('verificationFailed'));
      }

      const data = await response.json();

      if (data.valid) {
        // Move to confirmation step
        setVerificationStep(1);
        setVerificationCode("");
        toast.success(t('verificationSuccessful'));
      } else {
        throw new Error(t('invalidVerificationCode'));
      }

    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || t('verificationError'));
    } finally {
      setIsVerifying(false);
    }
  };

  // Enable TOTP after verification
  const handleEnableTOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEnabling(true);

    try {
      if (!userId) {
        toast.error(t('userIdNotFound'));
        router.push(getLocalizedPath('/login'));
        return;
      }

      const response = await fetch(`${API_URL}/auth/mfa/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          token: confirmCode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('enableMfaFailed'));
      }

      const data = await response.json();

      // Success - show backup codes and mark setup as complete
      setBackupCodes(data.backupCodes || []);
      setShowBackupCodes(true);
      setSetupComplete(true);

      // Update user object in localStorage to reflect MFA status
      if (typeof window !== 'undefined') {
        const userString = localStorage.getItem('user');
        if (userString) {
          try {
            const user = JSON.parse(userString);
            user.mfaEnabled = true;
            localStorage.setItem('user', JSON.stringify(user));
          } catch (e) {
            console.error("Failed to update user MFA status in localStorage");
          }
        }
      }

      toast.success(t('mfaEnabled'));

    } catch (error: any) {
      console.error('Enable MFA error:', error);
      toast.error(error.message || t('enableMfaError'));
    } finally {
      setIsEnabling(false);
    }
  };

  const handleGetNewCode = () => {
    fetchQRCode();
  };

  // Update this function to navigate without language in path
  const handleSkip = () => {
    // Store the language but navigate to standard route
    localStorage.setItem("preferredLanguage", language);
    router.push('/home');
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
            <h1 className="text-2xl font-medium text-[#6d5c4e] dark:text-[#d4c8be]">{t('setupMFA')}</h1>
          </div>

          <Card className="border border-[#e8e1db] dark:border-[#3a322d] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white dark:bg-[#2a2420] rounded-xl">
            {isLoading ? (
              <CardContent className="py-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bea99a]"></div>
              </CardContent>
            ) : !setupComplete ? (
              <>
                <CardHeader>
                  <CardTitle className="text-xl text-center text-[#6d5c4e] dark:text-[#d4c8be]">
                    {verificationStep === 0 ? t('setupAuthenticator') : t('verifyAuthenticator')}
                  </CardTitle>
                  <CardDescription className="text-center text-[#a39690] dark:text-[#a39690]">
                    {verificationStep === 0 ? t('setupAuthenticatorDesc') : t('enterNewCodeFromApp')}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {verificationStep === 0 ? (
                    <>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-48 h-48 bg-white dark:bg-[#f8f5f2] border-2 border-[#e8e1db] dark:border-[#3a322d] rounded-md overflow-hidden p-2">
                          {qrCode ? (
                            <img
                              src={qrCode}
                              alt="QR Code for MFA"
                              className="w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <p className="text-sm text-[#9c8578] dark:text-[#a39690]">
                                {t('qrCodeUnavailable')}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-center text-[#9c8578] dark:text-[#a39690]">
                            {t('scanQRCode')}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleGetNewCode}
                            className="ml-2 h-8 text-xs text-[#bea99a] dark:text-[#a8968a] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be] hover:bg-[#f1ece8] dark:hover:bg-[#3a322d]"
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                            {t('newCode')}
                          </Button>
                        </div>
                      </div>

                      <Separator className="bg-[#e8e1db] dark:bg-[#3a322d]" />

                      <div className="space-y-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-[#6d5c4e] dark:text-[#d4c8be]">
                            {t('enterAuthCode')}
                          </p>
                          <p className="text-xs text-[#9c8578] dark:text-[#a39690] mt-1">
                            {t('enterAuthCodeDesc')}
                          </p>
                        </div>

                        <form onSubmit={handleVerifyCode} className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label htmlFor="verification-code" className="text-[#6d5c4e] dark:text-[#d4c8be]">
                                {t('verificationCode')}
                              </Label>
                            </div>

                            <Input
                              id="verification-code"
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={6}
                              placeholder="123456"
                              value={verificationCode}
                              onChange={handleInputChange}
                              className="text-center tracking-widest text-lg border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a] shadow-inner bg-white dark:bg-[#27211d] text-[#6d5c4e] dark:text-[#d4c8be]"
                            />

                            <p className="text-xs text-center text-[#9c8578] dark:text-[#a39690]">
                              {t('codeExpires')} <span className="font-medium">30</span> {t('seconds')}
                            </p>
                          </div>

                          <Button
                            type="submit"
                            className="w-full bg-[#bea99a] dark:bg-[#a8968a] hover:bg-[#a8968a] dark:hover:bg-[#97877b] text-white shadow-sm transition-all hover:shadow-md"
                            disabled={verificationCode.length !== 6 || isVerifying}
                          >
                            {isVerifying ? t('verifying') : t('verify')}
                          </Button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex flex-col items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-3">
                          <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-[#6d5c4e] dark:text-[#d4c8be]">
                          {t('codeVerified')}
                        </p>
                      </div>

                      <form onSubmit={handleEnableTOTP} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="confirm-code" className="text-[#6d5c4e] dark:text-[#d4c8be]">
                            {t('confirmWithNewCode')}
                          </Label>

                          <Input
                            id="confirm-code"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="123456"
                            value={confirmCode}
                            onChange={handleInputChange}
                            className="text-center tracking-widest text-lg border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a] shadow-inner bg-white dark:bg-[#27211d] text-[#6d5c4e] dark:text-[#d4c8be]"
                          />

                          <p className="text-xs text-center text-[#9c8578] dark:text-[#a39690]">
                            {t('enterNewCodeToEnable')}
                          </p>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-[#bea99a] dark:bg-[#a8968a] hover:bg-[#a8968a] dark:hover:bg-[#97877b] text-white shadow-sm transition-all hover:shadow-md"
                          disabled={confirmCode.length !== 6 || isEnabling}
                        >
                          {isEnabling ? t('enabling') : t('enableMFA')}
                        </Button>
                      </form>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-center border-t border-[#e8e1db] dark:border-[#3a322d] p-4">
                  <div className="flex justify-between w-full">
                    <Button
                      variant="ghost"
                      onClick={handleSkip}
                      className="text-[#9c8578] dark:text-[#a39690] hover:text-[#7d6a5d] dark:hover:text-[#d4c8be] hover:bg-[#f1ece8] dark:hover:bg-[#3a322d]"
                    >
                      {t('setupLater')}
                    </Button>
                  </div>
                </CardFooter>
              </>
            ) : (
              <>
                <CardHeader>
                  <CardTitle className="text-xl text-center text-[#6d5c4e] dark:text-[#d4c8be]">
                    {t('mfaSetupComplete')}
                  </CardTitle>
                  <CardDescription className="text-center text-[#a39690] dark:text-[#a39690]">
                    {t('mfaSetupCompleteDesc')}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col items-center pt-4 pb-6">
                  <div className="w-20 h-20 rounded-full bg-[#f1ece8] dark:bg-[#27211d] flex items-center justify-center mb-6">
                    <ShieldCheck className="w-10 h-10 text-[#bea99a] dark:text-[#a8968a]" />
                  </div>

                  {showBackupCodes && backupCodes.length > 0 && (
                    <div className="w-full mb-6">
                      <h3 className="font-medium text-[#6d5c4e] dark:text-[#d4c8be] mb-2 text-center">
                        {t('backupCodes')}
                      </h3>
                      <p className="text-xs text-center mb-4 text-[#9c8578] dark:text-[#a39690]">
                        {t('backupCodesDesc')}
                      </p>
                      <div className="grid grid-cols-2 gap-2 p-4 bg-[#f8f5f2] dark:bg-[#1f1a16] border border-[#e8e1db] dark:border-[#3a322d] rounded-md">
                        {backupCodes.map((code, index) => (
                          <div key={index} className="font-mono text-sm text-[#6d5c4e] dark:text-[#d4c8be]">
                            {code}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center mt-3">

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            try {
                              // Create a temporary textarea element
                              const textarea = document.createElement('textarea');
                              // Set its value to the backup codes
                              textarea.value = backupCodes.join('\n');
                              // Style it to be out of the way
                              textarea.style.position = 'fixed';
                              textarea.style.opacity = '0';
                              textarea.style.top = '0';
                              textarea.style.left = '0';
                              // Add it to the document
                              document.body.appendChild(textarea);
                              // Select the text
                              textarea.focus();
                              textarea.select();

                              // Execute the copy command
                              const successful = document.execCommand('copy');

                              // Remove the temporary element
                              document.body.removeChild(textarea);

                              // Show appropriate message
                              // Show success toast with checkmark
                              if (successful) {
                                toast.success(`✅ ${t('backupCodesCopied')}`);
                              } else {
                                toast.error(t('copyFailed'));
                              }
                            } catch (err) {
                              console.error('Failed to copy backup codes:', err);
                              toast.error(t('copyFailed'));
                            }
                          }}
                          className="text-xs border-[#e8e1db] dark:border-[#3a322d] text-[#6d5c4e] dark:text-[#d4c8be]"
                        >
                          <Copy className="w-3.5 h-3.5 mr-1.5" />
                          {t('copyBackupCodes')}
                        </Button>

                      </div>
                    </div>
                  )}

                  <Button
                    className="bg-[#bea99a] dark:bg-[#a8968a] hover:bg-[#a8968a] dark:hover:bg-[#97877b] text-white"
                    onClick={() => {
                      // Store the language but navigate to standard route
                      localStorage.setItem("preferredLanguage", language);
                      router.push('/home');
                    }}
                  >
                    {t('goToDashboard')}
                  </Button>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#f1ece8] dark:bg-[#27211d] border-t border-[#e8e1db] dark:border-[#3a322d] py-4 px-6 text-center mt-auto">
        <div className="max-w-screen-lg mx-auto flex flex-col sm:flex-row items-center justify-between">
          <div className="text-sm text-[#9c8578] dark:text-[#a39690] mb-2 sm:mb-0">
            © {currentYear} Krypt. {t('allRightsReserved')}
          </div>
        </div>
      </footer>
    </main>
  );
}