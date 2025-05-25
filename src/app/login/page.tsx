"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSelector from "@/components/language-selector";
import { useRouter } from "next/navigation";
import { Shield, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Toaster } from "sonner";

// API URL should be defined
const API_URL = process.env.NEXT_PUBLIC_API_URL ;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [verifyingMfa, setVerifyingMfa] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);
  
  const router = useRouter();
  
  // Get the translation function 
  const t = (key: string): string => {
    return translations[key] || key;
  };
  
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
  }, []);

  // Load translations whenever language changes
  useEffect(() => {
    // Load translations from the JSON file
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/locales/${language}/common.json`);
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error("Failed to load translations:", error);
      }
    };
    
    loadTranslations();
  }, [language]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    localStorage.setItem("preferredLanguage", newLang);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Helper function to get path with language prefix
  const getLocalizedPath = (path: string) => {
    return `/${language}${path.startsWith('/') ? path : `/${path}`}`;
  };

  // Simplified MFA prompt function using a modal
  const showMfaPrompt = () => {
    setShowMfaModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Important for cookies
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || t('invalidCredentials'));
      }
      
      // Check if MFA is required
      if (data.mfaRequired) {
        // Check if user object exists and has an id
        if (!data.user || !data.user.id) {
          // Try to use userId field if user object is missing
          const userId = data.userId || data._id;
          if (!userId) {
            throw new Error(t('invalidUserData'));
          }
          
          // Store userId in localStorage for MFA verification
          localStorage.setItem('userId', userId);
        } else {
          // Store userId from user object
          localStorage.setItem('userId', data.user.id);
        }
        
        setMfaRequired(true);
        setIsLoading(false);
        return;
      }
      
      // Make sure we have a valid user object
      if (!data.user) {
        throw new Error(t('invalidUserData'));
      }
      
      // Extract user ID safely
      const userId = data.user.id || data.user._id;
      if (!userId) {
        throw new Error(t('invalidUserData'));
      }
      
      // Store token and user data in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userId', userId);
      
      // Check if user has MFA enabled and show prompt if not
      if (!data.user.mfaEnabled) {
        setIsLoading(false);
        showMfaPrompt(); // Show the modal instead of toast
      } else {
        // Navigate to home with language prefix
        router.push(getLocalizedPath('/home'));
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : t('serverError'));
      setIsLoading(false);
    }
  };
  
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyingMfa(true);
    setError("");
    
    try {
      // Get userId from localStorage only
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        throw new Error(t('sessionExpired'));
      }
      
      // Verify the MFA code
      const response = await fetch(`${API_URL}/auth/mfa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId,
          token: mfaCode
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || t('invalidCredentials'));
      }
      
      // Complete login with verified MFA
      const completeResponse = await fetch(`${API_URL}/auth/mfa/verify-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId,
          token: mfaCode, 
          email,
        }),
        credentials: 'include'
      });
      
      const completeData = await completeResponse.json();
      
      if (!completeResponse.ok) {
        throw new Error(completeData.message || t('serverError'));
      }
      
      // Make sure we have a valid user object
      if (!completeData.user) {
        throw new Error(t('invalidUserData'));
      }
      
      // Extract user ID safely
      const completedUserId = completeData.user.id || completeData.user._id;
      if (!completedUserId) {
        throw new Error(t('invalidUserData'));
      }
      
      // Store token and user data in localStorage only
      localStorage.setItem('authToken', completeData.token);
      localStorage.setItem('user', JSON.stringify(completeData.user));
      localStorage.setItem('userId', completedUserId);
      
      // Navigate to home with language prefix
      router.push(getLocalizedPath('/home'));
    } catch (error: unknown) {
      console.error('MFA verification error:', error);
      setError(error instanceof Error ? error.message : t('serverError'));
      setVerifyingMfa(false);
    }
  };

  const resetMfa = () => {
    setMfaRequired(false);
    setMfaCode("");
    setVerifyingMfa(false);
  };

  const handleEnableMFA = async () => {
    try {
      // Get authentication token and user ID from localStorage only
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        // If no token or userId, we need to log in first
        setError(t('loginFirst'));
        return;
      }
      
      setIsLoading(true);
      
      // Start by requesting the QR code from the setup endpoint
      const response = await fetch(`${API_URL}/auth/mfa/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId }) // Include the userId in the request body
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || t('mfaSetupFailed'));
      }
      
      // Store the QR code in localStorage to use it in the MFA setup page
      localStorage.setItem('mfaQrCode', data.qrCode);
      localStorage.setItem('mfaSecret', data.secret); // Also store the secret for verification
      
      // Navigate to the MFA setup page
      router.push(getLocalizedPath('/mfa'));
      
    } catch (error: unknown) {
      console.error('MFA setup error:', error);
      setError(error instanceof Error ? error.message : t('serverError'));
      setIsLoading(false);
    } finally {
      // Make sure to reset loading state even if navigation occurs
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#f8f5f2] dark:bg-[#1f1a16] transition-colors duration-200">
      <Toaster />
      
      {/* Main content area */}
      <div className="flex-grow flex items-center justify-center px-4 py-8">
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
            <h1 className="text-2xl font-medium text-[#6d5c4e] dark:text-[#d4c8be]">{t('authenticate')}</h1>
          </div>
          
          <Card className="border border-[#e8e1db] dark:border-[#3a322d] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white dark:bg-[#2a2420] rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl text-center text-[#6d5c4e] dark:text-[#d4c8be]">
                {mfaRequired ? t('verifyMfa') : t('welcome')}
              </CardTitle>
              <CardDescription className="text-center text-[#a39690] dark:text-[#a39690]">
                {mfaRequired ? t('enterCode') : t('enterDetails')}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2">{error}</AlertDescription>
                </Alert>
              )}
              
              {mfaRequired ? (
                <form onSubmit={handleMfaSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mfaCode" className="text-[#6d5c4e] dark:text-[#d4c8be]">{t('code')}</Label>
                    <Input 
                      id="mfaCode"
                      type="text" 
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      required
                      className="border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a] shadow-inner bg-white dark:bg-[#27211d] text-[#6d5c4e] dark:text-[#d4c8be] text-center text-xl tracking-widest"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={resetMfa}
                      className="flex-1 border-[#e8e1db] dark:border-[#3a322d] text-[#6d5c4e] dark:text-[#d4c8be] hover:bg-[#f1ece8] dark:hover:bg-[#3a322d]"
                    >
                      {t('back')}
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-[#bea99a] dark:bg-[#a8968a] hover:bg-[#a8968a] dark:hover:bg-[#97877b] text-white shadow-sm transition-all" 
                      disabled={verifyingMfa || mfaCode.length !== 6}
                    >
                      {verifyingMfa ? t('verifying') : t('verify')}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#6d5c4e] dark:text-[#d4c8be]">{t('email')}</Label>
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a] shadow-inner bg-white dark:bg-[#27211d] text-[#6d5c4e] dark:text-[#d4c8be]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-[#6d5c4e] dark:text-[#d4c8be]">{t('password')}</Label>
                      <Link href={getLocalizedPath('/forgot-password')} className="text-xs text-[#9c8578] dark:text-[#a39690] hover:text-[#7d6a5d] dark:hover:text-[#d4c8be] transition-colors">
                        {t('forgotPassword')}
                      </Link>
                    </div>
                    <div className="relative">
                      <Input 
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a] shadow-inner bg-white dark:bg-[#27211d] text-[#6d5c4e] dark:text-[#d4c8be] pr-10"
                      />
                      <button 
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be] focus:outline-none"
                        aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#bea99a] dark:bg-[#a8968a] hover:bg-[#a8968a] dark:hover:bg-[#97877b] text-white shadow-sm transition-all hover:shadow-md" 
                    disabled={isLoading}
                  >
                    {isLoading ? t('signingIn') : t('signIn')}
                  </Button>
                  
                 
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleEnableMFA}
                    className="w-full border-[#e8e1db] dark:border-[#3a322d] text-[#6d5c4e] dark:text-[#d4c8be] hover:bg-[#f1ece8] dark:hover:bg-[#3a322d] transition-colors"
                    disabled={isLoading}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    {t('enableMFA')}
                  </Button>
                </form>
              )}
            </CardContent>
            
            {!mfaRequired && (
              <CardFooter className="flex justify-center border-t border-[#e8e1db] dark:border-[#3a322d] p-4">
                <p className="text-sm text-[#9c8578] dark:text-[#a39690]">
                  {t('noAccount')}{" "}
                  <Link href={getLocalizedPath('/register')} className="text-[#7d6a5d] dark:text-[#d4c8be] hover:text-[#5d4d41] dark:hover:text-white font-medium transition-colors">
                    {t('signUp')}
                  </Link>
                </p>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full bg-[#f1ece8] dark:bg-[#27211d] border-t border-[#e8e1db] dark:border-[#3a322d] py-4 px-6 text-center mt-auto">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <div className="text-sm text-[#9c8578] dark:text-[#a39690] mb-2 sm:mb-0">
            © 2025 Krypt. {t('allRightsReserved')}
          </div>
          
       
        </div>
      </footer>
      
      {/* MFA Setup Modal */}
      {showMfaModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowMfaModal(false)}
        >
          <div className="fixed inset-0 bg-black/20 dark:bg-black/40" aria-hidden="true"></div>
          <div 
            className="relative bg-white dark:bg-[#2a2420] border border-[#e8e1db] dark:border-[#3a322d] shadow-lg rounded-lg p-4 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-[#e8e1db] dark:border-[#3a322d] mb-3">
              <div className="font-medium text-[#6d5c4e] dark:text-[#d4c8be] flex items-center">
                <Shield className="h-4 w-4 inline-block mr-2" />
                {t('setupMFA')}
              </div>
              <button 
                onClick={() => setShowMfaModal(false)} 
                className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]"
              >
                ✕
              </button>
            </div>
            <div className="mb-4 text-[#6d5c4e] dark:text-[#d4c8be]">
              {t('mfaPrompt')}
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowMfaModal(false);
                  router.push(getLocalizedPath('/home'));
                }}
                className="border-[#e8e1db] dark:border-[#3a322d] text-[#6d5c4e] dark:text-[#d4c8be] hover:bg-[#f1ece8] dark:hover:bg-[#3a322d]"
              >
                {t('setupLater')}
              </Button>
              <Button 
                size="sm" 
                onClick={() => {
                  setShowMfaModal(false);
                  handleEnableMFA();
                }}
                className="bg-[#bea99a] dark:bg-[#a8968a] hover:bg-[#a8968a] dark:hover:bg-[#97877b] text-white"
              >
                {t('enable')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}