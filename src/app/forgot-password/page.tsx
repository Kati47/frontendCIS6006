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
import { AlertCircle, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// API endpoint
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Simple translations object for client-side access
const translations = {
  en: {
    forgotPassword: "Forgot Password",
    resetInstructions: "Enter your email address and we'll send you instructions to reset your password",
    email: "Email",
    sendResetLink: "Send Reset Link",
    sending: "Sending...",
    backToLogin: "Back to login",
    emailSent: "Reset link sent",
    emailSentDesc: "Check your inbox for instructions on how to reset your password",
    errorMessage: "There was an error sending the reset link",
    emailRequired: "Email address is required",
    validEmail: "Please enter a valid email address",
    serverError: "Server error. Please try again later.",
    checkSpam: "If you don't see the email in your inbox, please check your spam folder.",
    emailNotFound: "No account found with this email address."
  },
  fr: {
    forgotPassword: "Mot de passe oublié",
    resetInstructions: "Entrez votre adresse e-mail et nous vous enverrons des instructions pour réinitialiser votre mot de passe",
    email: "E-mail",
    sendResetLink: "Envoyer le lien de réinitialisation",
    sending: "Envoi en cours...",
    backToLogin: "Retour à la connexion",
    emailSent: "Lien de réinitialisation envoyé",
    emailSentDesc: "Consultez votre boîte de réception pour obtenir des instructions sur la réinitialisation de votre mot de passe",
    errorMessage: "Une erreur s'est produite lors de l'envoi du lien de réinitialisation",
    emailRequired: "L'adresse e-mail est requise",
    validEmail: "Veuillez entrer une adresse e-mail valide",
    serverError: "Erreur du serveur. Veuillez réessayer plus tard.",
    checkSpam: "Si vous ne voyez pas l'e-mail dans votre boîte de réception, veuillez vérifier votre dossier spam.",
    emailNotFound: "Aucun compte trouvé avec cette adresse e-mail."
  },
  es: {
    forgotPassword: "Olvidé mi contraseña",
    resetInstructions: "Ingrese su dirección de correo electrónico y le enviaremos instrucciones para restablecer su contraseña",
    email: "Correo electrónico",
    sendResetLink: "Enviar enlace de restablecimiento",
    sending: "Enviando...",
    backToLogin: "Volver al inicio de sesión",
    emailSent: "Enlace de restablecimiento enviado",
    emailSentDesc: "Revise su bandeja de entrada para obtener instrucciones sobre cómo restablecer su contraseña",
    errorMessage: "Se produjo un error al enviar el enlace de restablecimiento",
    emailRequired: "Se requiere la dirección de correo electrónico",
    validEmail: "Por favor ingrese una dirección de correo electrónico válida",
    serverError: "Error del servidor. Por favor, inténtelo más tarde.",
    checkSpam: "Si no ve el correo electrónico en su bandeja de entrada, verifique su carpeta de spam.",
    emailNotFound: "No se encontró ninguna cuenta con esta dirección de correo electrónico."
  }
};

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  
  // Get the correct translation function
  const t = (key) => {
    return translations[language]?.[key] || key;
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

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem("preferredLanguage", newLang);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Simple validation
    if (!email.trim()) {
      setError(t('emailRequired'));
      return;
    }
    
    if (!validateEmail(email)) {
      setError(t('validEmail'));
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call the API to request password reset
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      // We don't want to expose whether an email exists or not for security
      // So we show a success message even if the email doesn't exist
      // The actual API should still return a 200 status for this reason
      if (response.ok) {
        setSuccess(true);
        
        // In development mode, log the reset URL if it's provided
        if (process.env.NODE_ENV === 'development' && data.dev_url) {
          console.log('Development reset URL:', data.dev_url);
        }
      } else {
        // Only show errors for actual API failures
        if (data.message && data.message.includes('Incorrect Email')) {
          // We intentionally don't expose which emails exist
          setSuccess(true);
        } else {
          throw new Error(data.message || t('errorMessage'));
        }
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || t('serverError'));
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-2xl font-medium text-[#6d5c4e] dark:text-[#d4c8be]">{t('forgotPassword')}</h1>
        </div>
        
        <Card className="border border-[#e8e1db] dark:border-[#3a322d] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white dark:bg-[#2a2420] rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl text-center text-[#6d5c4e] dark:text-[#d4c8be]">
              {success ? t('emailSent') : t('forgotPassword')}
            </CardTitle>
            <CardDescription className="text-center text-[#a39690] dark:text-[#a39690]">
              {success ? t('emailSentDesc') : t('resetInstructions')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">{error}</AlertDescription>
              </Alert>
            )}
            
            {success ? (
              <div className="flex flex-col items-center py-6">
                <div className="w-16 h-16 mb-4 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500 dark:text-green-400" />
                </div>
                <p className="text-[#6d5c4e] dark:text-[#d4c8be] text-center mb-2">
                  {email}
                </p>
                <p className="text-[#9c8578] dark:text-[#a39690] text-center text-sm mb-6">
                  {t('checkSpam')}
                </p>
                <Button 
                  onClick={() => router.push('/login')}
                  className="bg-[#bea99a] dark:bg-[#a8968a] hover:bg-[#a8968a] dark:hover:bg-[#97877b] text-white shadow-sm transition-all hover:shadow-md"
                >
                  {t('backToLogin')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#6d5c4e] dark:text-[#d4c8be]">
                    {t('email')}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9c8578] dark:text-[#a39690]" />
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a] shadow-inner bg-white dark:bg-[#27211d] text-[#6d5c4e] dark:text-[#d4c8be]"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#bea99a] dark:bg-[#a8968a] hover:bg-[#a8968a] dark:hover:bg-[#97877b] text-white shadow-sm transition-all hover:shadow-md" 
                  disabled={isLoading}
                >
                  {isLoading ? t('sending') : t('sendResetLink')}
                </Button>
              </form>
            )}
          </CardContent>
          
          {!success && (
            <CardFooter className="flex justify-center border-t border-[#e8e1db] dark:border-[#3a322d] p-4">
              <Link 
                href="/login" 
                className="text-sm text-[#6d5c4e] dark:text-[#d4c8be] hover:text-[#5d4d41] dark:hover:text-white font-medium transition-colors flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('backToLogin')}
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </main>
  );
}