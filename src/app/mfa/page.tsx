"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSelector from "@/components/language-selector";
import { ArrowLeft, Copy, RefreshCw, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function SetupMFAPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [language, setLanguage] = useState("en");
  const [verificationCode, setVerificationCode] = useState("");
  const [setupComplete, setSetupComplete] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([
    "84392-19384", "29384-39281", "38291-20394", "10293-49302",
    "39281-39402", "49302-19382", "29348-30291", "93018-29384"
  ]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  
  // TOTP setup states with static demo values
  const [secretKey, setSecretKey] = useState("JBSWY3DPEHPK3PXP");
  const [qrCode, setQrCode] = useState("data:image/png;base64,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");
  
  const router = useRouter();
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
    
    // Set loading to false after a short delay to simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
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

  const handleCopySecretKey = () => {
    navigator.clipboard.writeText(secretKey);
    toast({
      title: "Copied!",
      description: "Secret key copied to clipboard"
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/[^0-9]/g, '');
    
    // Limit to 6 digits
    if (value.length <= 6) {
      setVerificationCode(value);
    }
  };
  
  const handleVerifyCode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsVerifying(true);
    
    // Simulate verification delay
    setTimeout(() => {
      setSetupComplete(true);
      setShowBackupCodes(true);
      
      // Success toast
      toast({
        title: "MFA Enabled",
        description: "Multi-Factor Authentication has been successfully enabled for your account.",
      });
      setIsVerifying(false);
    }, 1000);
  };
  
  const handleGetNewCode = () => {
    // Just for demo purposes
    toast({
      title: "Demo Mode",
      description: "In a real application, this would generate a new QR code."
    });
  };
  
  const handleSkip = () => {
    router.push('/dashboard');
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
                    {t('setupAuthenticator')}
                  </CardTitle>
                  <CardDescription className="text-center text-[#a39690] dark:text-[#a39690]">
                    {t('setupAuthenticatorDesc')}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <Tabs defaultValue="qr" className="w-full">
                    <TabsList className="grid grid-cols-2 bg-[#f1ece8] dark:bg-[#27211d] border border-[#e8e1db] dark:border-[#3a322d] p-1 rounded-lg">
                      <TabsTrigger 
                        value="qr"
                        className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#3a322d] data-[state=active]:shadow-sm"
                      >
                        {t('qrCode')}
                      </TabsTrigger>

                    </TabsList>
                    
                    <TabsContent value="qr" className="mt-4">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-48 h-48 bg-white dark:bg-[#f8f5f2] border-2 border-[#e8e1db] dark:border-[#3a322d] rounded-md overflow-hidden p-2">
                          <img 
                            src={qrCode}
                            alt="QR Code for MFA" 
                            className="w-full h-full"
                          />
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
                            {t('newCode') || "New Code"}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="manual" className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm text-[#9c8578] dark:text-[#a39690]">
                            {t('secretKey')}
                          </Label>
                          <div className="flex items-center justify-between mt-1">
                            <div className="p-3 flex-1 bg-[#f8f5f2] dark:bg-[#1f1a16] border border-[#e8e1db] dark:border-[#3a322d] rounded-md text-[#6d5c4e] dark:text-[#d4c8be] font-mono text-sm tracking-wider">
                              {secretKey.replace(/(.{4})/g, "$1 ").trim()}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={handleCopySecretKey}
                              className="ml-2 h-10 text-xs text-[#bea99a] dark:text-[#a8968a] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be] hover:bg-[#f1ece8] dark:hover:bg-[#3a322d]"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="text-sm text-[#9c8578] dark:text-[#a39690]">
                          <ol className="list-decimal pl-5 space-y-2">
                            <li>{t('step1AuthApp')}</li>
                            <li>{t('step2EnterKey')}</li>
                            <li>{t('step3UseCode')}</li>
                          </ol>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
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
                    <Link 
                      href="https://support.google.com/accounts/answer/1066447"
                      target="_blank"
                      className="text-sm text-[#bea99a] dark:text-[#a8968a] hover:text-[#7d6a5d] dark:hover:text-[#d4c8be]"
                    >
                      {t('needHelp')}
                    </Link>
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
                  
                  {showBackupCodes && (
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
                            navigator.clipboard.writeText(backupCodes.join('\n'));
                            toast({
                              title: "Copied!",
                              description: "Backup codes copied to clipboard"
                            });
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
                    onClick={() => router.push('/dashboard')}
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
      <footer className="w-full bg-[#f1ece8] dark:bg-[#27211d] border-t border-[#e8e1db] dark:border-[#3a322d] py-4 px-6 text-center">
        <div className="max-w-screen-lg mx-auto flex flex-col sm:flex-row items-center justify-between">
          <div className="text-sm text-[#9c8578] dark:text-[#a39690] mb-2 sm:mb-0">
            © {currentYear} Krypt. {t('allRightsReserved')}
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