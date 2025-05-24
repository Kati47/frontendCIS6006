"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSelector from "@/components/language-selector";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Github, AlertCircle } from "lucide-react";

// API endpoint
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Simple translations object (since we're not using a full i18n library)
const translations = {
  en: {
    register: "Register",
    createAccount: "Create an Account",
    registerDetails: "Enter your details to create a new account",
    name: "Full Name",
    email: "Email",
    phone: "Phone (optional)",
    company: "Company (optional)",
    title: "Job Title (optional)",
    password: "Password",
    confirmPassword: "Confirm Password",
    passwordRequirements: "Password must be at least 8 characters long",
    passwordsNotMatch: "Passwords do not match",
    signUp: "Sign up",
    signingUp: "Signing up...",
    haveAccount: "Already have an account?",
    signIn: "Sign in",
    allRightsReserved: "All rights reserved.",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    unexpectedError: "An unexpected error occurred. Please try again.",
    emailExists: "Email already exists. Please use a different email or login.",
    signupSuccess: "Account created successfully! Redirecting to login..."
  },
  fr: {
    register: "S'inscrire",
    createAccount: "Créer un Compte",
    registerDetails: "Entrez vos informations pour créer un nouveau compte",
    name: "Nom Complet",
    email: "E-mail",
    phone: "Téléphone (optionnel)",
    company: "Entreprise (optionnel)",
    title: "Titre de Poste (optionnel)",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    passwordRequirements: "Le mot de passe doit comporter au moins 8 caractères",
    passwordsNotMatch: "Les mots de passe ne correspondent pas",
    signUp: "S'inscrire",
    signingUp: "Inscription en cours...",
    haveAccount: "Vous avez déjà un compte?",
    signIn: "Se connecter",
    allRightsReserved: "Tous droits réservés.",
    privacyPolicy: "Politique de confidentialité",
    termsOfService: "Conditions d'utilisation",
    unexpectedError: "Une erreur inattendue s'est produite. Veuillez réessayer.",
    emailExists: "Cet e-mail existe déjà. Veuillez utiliser un autre e-mail ou vous connecter.",
    signupSuccess: "Compte créé avec succès! Redirection vers la connexion..."
  },
  es: {
    register: "Registrarse",
    createAccount: "Crear una Cuenta",
    registerDetails: "Ingrese sus datos para crear una nueva cuenta",
    name: "Nombre Completo",
    email: "Correo electrónico",
    phone: "Teléfono (opcional)",
    company: "Empresa (opcional)",
    title: "Cargo (opcional)",
    password: "Contraseña",
    confirmPassword: "Confirmar Contraseña",
    passwordRequirements: "La contraseña debe tener al menos 8 caracteres",
    passwordsNotMatch: "Las contraseñas no coinciden",
    signUp: "Registrarse",
    signingUp: "Registrando...",
    haveAccount: "¿Ya tiene una cuenta?",
    signIn: "Iniciar sesión",
    allRightsReserved: "Todos los derechos reservados.",
    privacyPolicy: "Política de Privacidad",
    termsOfService: "Términos de Servicio",
    unexpectedError: "Ocurrió un error inesperado. Por favor, inténtelo de nuevo.",
    emailExists: "El correo electrónico ya existe. Use otro correo o inicie sesión.",
    signupSuccess: "¡Cuenta creada con éxito! Redirigiendo al inicio de sesión..."
  }
};

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    password: false,
    confirmPassword: false,
    name: false
  });
  const [apiError, setApiError] = useState("");
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate name field (must not be empty)
    if (name === "name") {
      setErrors(prev => ({
        ...prev,
        name: value.trim() === ''
      }));
    }
    
    // Validate password length
    if (name === "password") {
      setErrors(prev => ({ 
        ...prev, 
        password: value.length < 8 && value.length > 0,
        confirmPassword: value !== formData.confirmPassword && formData.confirmPassword.length > 0
      }));
    }
    
    // Validate password match
    if (name === "confirmPassword") {
      setErrors(prev => ({ 
        ...prev, 
        confirmPassword: value !== formData.password && value.length > 0
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error state
    setApiError("");
    
    // Validate name field
    if (!formData.name.trim()) {
      setErrors(prev => ({
        ...prev,
        name: true
      }));
      setApiError("Name is required");
      return;
    }
    
    // Final validation
    if (formData.password.length < 8 || formData.password !== formData.confirmPassword) {
      setErrors({
        ...errors,
        password: formData.password.length < 8,
        confirmPassword: formData.password !== formData.confirmPassword
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare registration data (exclude confirmPassword)
      const { confirmPassword, ...registrationData } = formData;
      
      // Make sure name field is explicitly set and properly formatted
      const dataToSend = {
        ...registrationData,
        name: formData.name.trim() // Ensure name is trimmed and explicitly included
      };
      
      console.log("Sending registration data:", dataToSend);
      
      // Send registration request to API
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle validation errors
        if (data.errors) {
          // Find the first error message
          const firstError = data.errors[0];
          throw new Error(firstError.message || "Validation error");
        }
        
        // Handle other errors
        if (data.message && data.message.includes("Email already exists")) {
          throw new Error(t('emailExists'));
        }
        
        throw new Error(data.message || t('unexpectedError'));
      }
      
      // Show success message
      setSuccess(true);
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error) {
      console.error("Registration error:", error);
      setApiError(error.message || t('unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const currentYear = new Date().getFullYear();

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
            <h1 className="text-2xl font-medium text-[#6d5c4e] dark:text-[#d4c8be]">{t('register')}</h1>
          </div>
          
          <Card className="border border-[#e8e1db] dark:border-[#3a322d] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.08)] bg-white dark:bg-[#2a2420] rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl text-center text-[#6d5c4e] dark:text-[#d4c8be]">{t('createAccount')}</CardTitle>
              <CardDescription className="text-center text-[#a39690] dark:text-[#a39690]">
                {t('registerDetails')}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {apiError && (
                <Alert variant="destructive" className="mb-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2">{apiError}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200">
                  <AlertDescription>{t('signupSuccess')}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#6d5c4e] dark:text-[#d4c8be]">
                    {t('name')} <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="name"
                    name="name"
                    type="text" 
                    placeholder="John Doe"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a] shadow-inner bg-white dark:bg-[#27211d] text-[#6d5c4e] dark:text-[#d4c8be] ${errors.name ? 'border-red-300 dark:border-red-800' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">Name is required</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#6d5c4e] dark:text-[#d4c8be]">
                    {t('email')} <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email" 
                    placeholder="name@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a] shadow-inner bg-white dark:bg-[#27211d] text-[#6d5c4e] dark:text-[#d4c8be]"
                  />
                </div>
                
                {/* Optional fields */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#6d5c4e] dark:text-[#d4c8be]">{t('phone')}</Label>
                  <Input 
                    id="phone"
                    name="phone"
                    type="tel" 
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                    className="border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a] shadow-inner bg-white dark:bg-[#27211d] text-[#6d5c4e] dark:text-[#d4c8be]"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-[#6d5c4e] dark:text-[#d4c8be]">{t('company')}</Label>
                    <Input 
                      id="company"
                      name="company"
                      type="text" 
                      placeholder="Acme Inc."
                      value={formData.company}
                      onChange={handleChange}
                      className="border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a] shadow-inner bg-white dark:bg-[#27211d] text-[#6d5c4e] dark:text-[#d4c8be]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-[#6d5c4e] dark:text-[#d4c8be]">{t('title')}</Label>
                    <Input 
                      id="title"
                      name="title"
                      type="text" 
                      placeholder="Software Engineer"
                      value={formData.title}
                      onChange={handleChange}
                      className="border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a] shadow-inner bg-white dark:bg-[#27211d] text-[#6d5c4e] dark:text-[#d4c8be]"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#6d5c4e] dark:text-[#d4c8be]">
                    {t('password')} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input 
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a] shadow-inner bg-white dark:bg-[#27211d] text-[#6d5c4e] dark:text-[#d4c8be] pr-10 ${errors.password ? 'border-red-300 dark:border-red-800' : ''}`}
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
                  {errors.password && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{t('passwordRequirements')}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#6d5c4e] dark:text-[#d4c8be]">
                    {t('confirmPassword')} <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a] shadow-inner bg-white dark:bg-[#27211d] text-[#6d5c4e] dark:text-[#d4c8be] pr-10 ${errors.confirmPassword ? 'border-red-300 dark:border-red-800' : ''}`}
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
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{t('passwordsNotMatch')}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#bea99a] dark:bg-[#a8968a] hover:bg-[#a8968a] dark:hover:bg-[#97877b] text-white shadow-sm transition-all hover:shadow-md mt-6" 
                  disabled={isLoading || errors.password || errors.confirmPassword || errors.name || success}
                >
                  {isLoading ? t('signingUp') : t('signUp')}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex justify-center border-t border-[#e8e1db] dark:border-[#3a322d] p-4">
              <p className="text-sm text-[#9c8578] dark:text-[#a39690]">
                {t('haveAccount')}{" "}
                <Link href="/login" className="text-[#7d6a5d] dark:text-[#d4c8be] hover:text-[#5d4d41] dark:hover:text-white font-medium transition-colors">
                  {t('signIn')}
                </Link>
              </p>
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
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#9c8578] dark:text-[#a39690] hover:text-[#7d6a5d] dark:hover:text-[#d4c8be]"
            >
              <Github size={18} />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}