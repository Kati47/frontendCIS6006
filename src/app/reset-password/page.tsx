"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSelector from "@/components/language-selector";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";

// API endpoint
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Simple translations object for client-side access
const translations = {
  en: {
    resetPassword: "Reset Password",
    resetInstructions: "Please enter a new password for your account",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    reset: "Reset Password",
    resetting: "Resetting...",
    backToLogin: "Back to login",
    resetSuccess: "Password Reset Successful",
    resetSuccessDesc: "Your password has been reset. You can now login with your new password.",
    invalidLink: "Invalid or expired reset link",
    invalidLinkDesc: "The password reset link is invalid or has expired. Please request a new one.",
    verifyingLink: "Verifying reset link...",
    passwordsNotMatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 8 characters long",
    requestNewLink: "Request a new reset link",
    passwordStrength: "Password must include uppercase, lowercase, number, and special character",
    redirecting: "Redirecting to login page..."
  },
  fr: {
    // French translations
  },
  es: {
    // Spanish translations
  }
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [language, setLanguage] = useState("en");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Get the correct translation function
  const t = (key) => {
    return translations[language]?.[key] || key;
  };
  
  // Add this function right here
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    localStorage.setItem("preferredLanguage", newLang);
  };
  // Add this function to your component, right after the t(key) function:


  
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
    
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");
    
    if (!emailParam || !tokenParam) {
      setError(t('invalidLink'));
      setIsVerifying(false);
      return;
    }
    
    setEmail(emailParam);
    setToken(tokenParam);
    
    // Verify the token
    verifyToken(emailParam, tokenParam);
  }, [searchParams]);
  
  const verifyToken = async (email, token) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-reset-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || t('invalidLink'));
      }
      
      setTokenValid(true);
    } catch (error) {
      console.error('Token verification error:', error);
      setError(error.message || t('invalidLink'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError(t('passwordsNotMatch'));
      return;
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
      setError(t('passwordTooShort'));
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          token, 
          newPassword 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || t('errorMessage'));
      }
      
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || t('errorMessage'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f5f2] dark:bg-[#1f1a16] transition-colors duration-200 p-4">
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
          <h1 className="text-2xl font-medium text-[#6d5c4e] dark:text-[#d4c8be]">
            {success ? t('resetSuccess') : t('resetPassword')}
          </h1>
        </div>
        
        <Card className="border border-[#e8e1db] dark:border-[#3a322d] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white dark:bg-[#2a2420] rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl text-center text-[#6d5c4e] dark:text-[#d4c8be]">
              {success ? t('resetSuccess') : isVerifying ? t('verifyingLink') : error && !tokenValid ? t('invalidLink') : t('resetPassword')}
            </CardTitle>
            <CardDescription className="text-center text-[#a39690] dark:text-[#a39690]">
              {success ? t('resetSuccessDesc') : isVerifying ? "" : error && !tokenValid ? t('invalidLinkDesc') : t('resetInstructions')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">{error}</AlertDescription>
              </Alert>
            )}
            
            {isVerifying ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="h-10 w-10 animate-spin text-[#bea99a] dark:text-[#a8968a] mb-4" />
                <p className="text-[#6d5c4e] dark:text-[#d4c8be]">{t('verifyingLink')}</p>
              </div>
            ) : success ? (
              <div className="flex flex-col items-center py-6">
                <div className="w-16 h-16 mb-4 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500 dark:text-green-400" />
                </div>
                <p className="text-[#6d5c4e] dark:text-[#d4c8be] text-center mb-6">
                  {t('redirecting')}
                </p>
              </div>
            ) : tokenValid ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-[#6d5c4e] dark:text-[#d4c8be]">{t('newPassword')}</Label>
                  <div className="relative">
                    <Input 
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a] shadow-inner bg-white dark:bg-[#27211d] text-[#6d5c4e] dark:text-[#d4c8be] pr-10"
                    />
                    <button 
                      type="button" 
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9c8578] hover:text-[#7d6a5d] dark:text-[#a39690] dark:hover:text-[#d4c8be]"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#6d5c4e] dark:text-[#d4c8be]">{t('confirmPassword')}</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a] shadow-inner bg-white dark:bg-[#27211d] text-[#6d5c4e] dark:text-[#d4c8be] pr-10"
                    />
                    <button 
                      type="button" 
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9c8578] hover:text-[#7d6a5d] dark:text-[#a39690] dark:hover:text-[#d4c8be]"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#bea99a] dark:bg-[#a8968a] hover:bg-[#a8968a] dark:hover:bg-[#97877b] text-white shadow-sm transition-all hover:shadow-md mt-2" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('resetting') : t('reset')}
                </Button>
              </form>
            ) : (
              <div className="flex flex-col items-center py-6">
                <Button 
                  asChild
                  variant="outline"
                  className="border-[#e8e1db] dark:border-[#3a322d] text-[#6d5c4e] dark:text-[#d4c8be] hover:bg-[#f1ece8] dark:hover:bg-[#3a322d] transition-colors mb-2"
                >
                  <Link href="/forgot-password">{t('requestNewLink')}</Link>
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center border-t border-[#e8e1db] dark:border-[#3a322d] p-4">
            <Link 
              href="/login" 
              className="text-sm text-[#6d5c4e] dark:text-[#d4c8be] hover:text-[#5d4d41] dark:hover:text-white font-medium transition-colors flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('backToLogin')}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}