"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSelector from "@/components/language-selector";
import { useRouter } from "next/navigation";
import {
  Shield,
  ShieldCheck,
  Lock,
  KeyRound,
  ChevronRight,
  User,
  Star,
  ArrowRight,
  Check,
  Mail
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function LandingPage() {
  const [language, setLanguage] = useState("en");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const router = useRouter();
  
  // Get the correct translation function
  const t = (key: string): string => {
    return translations[key] || key;
  };
  
  useEffect(() => {
    // Check for stored language preference
    const storedLang = localStorage.getItem("preferredLanguage");
    if (storedLang && ["en", "fr", "es"].includes(storedLang)) {
      setLanguage(storedLang);
    } else {
      const browserLang = navigator.language.split("-")[0];
      if (["en", "fr", "es"].includes(browserLang)) {
        setLanguage(browserLang);
      }
    }
  }, []);

  // Load translations whenever language changes
  useEffect(() => {
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

  return (
    <main className="min-h-screen flex flex-col bg-[#f8f5f2] dark:bg-[#1f1a16] transition-colors duration-200">
      <Toaster />
      
      {/* Header/Navigation */}
      <header className="sticky top-0 z-10 bg-white dark:bg-[#2a2420] border-b border-[#e8e1db] dark:border-[#3a322d] shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#d4c8be] dark:bg-[#3a322d] flex items-center justify-center shadow-sm">
                <span className="text-[#6d5c4e] dark:text-[#d4c8be] font-semibold text-sm">𝒦.</span>
              </div>
              <h1 className="ml-2 text-xl font-medium text-[#6d5c4e] dark:text-[#d4c8be] hidden sm:block">Krypt</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <LanguageSelector currentLanguage={language} onLanguageChange={handleLanguageChange} />
            
            <div className="hidden sm:flex items-center space-x-3 ml-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/login')}
                className="text-[#6d5c4e] dark:text-[#d4c8be] hover:bg-[#f1ece8] dark:hover:bg-[#3a322d]"
              >
                {t('signIn')}
              </Button>
              
              <Button 
                onClick={() => router.push('/register')}
                className="bg-[#bea99a] dark:bg-[#a8968a] hover:bg-[#a8968a] dark:hover:bg-[#97877b] text-white"
              >
                {t('getStarted')}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu - Visible only on small screens */}
      <div className="md:hidden flex justify-center py-3 bg-[#f1ece8] dark:bg-[#27211d] border-b border-[#e8e1db] dark:border-[#3a322d]">
        <Tabs defaultValue="features" className="w-full px-4">
          <TabsList className="bg-white/20 dark:bg-black/20 border border-[#e8e1db] dark:border-[#3a322d] p-1 w-full overflow-x-auto flex whitespace-nowrap">
            <TabsTrigger value="features" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#2a2420] data-[state=active]:text-[#6d5c4e] dark:data-[state=active]:text-[#d4c8be]">
              {t('features')}
            </TabsTrigger>
            <TabsTrigger value="how" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#2a2420] data-[state=active]:text-[#6d5c4e] dark:data-[state=active]:text-[#d4c8be]">
              {t('howItWorks')}
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#2a2420] data-[state=active]:text-[#6d5c4e] dark:data-[state=active]:text-[#d4c8be]">
              {t('testimonials')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <Badge variant="outline" className="bg-[#bea99a]/10 text-[#bea99a] dark:bg-[#a8968a]/10 dark:text-[#a8968a] border-[#bea99a]/20 dark:border-[#a8968a]/20 mb-4">
                {t('secureAuth')}
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold text-[#6d5c4e] dark:text-[#d4c8be] mb-6 leading-tight">
                {t('secureAuthWeb')}
              </h1>
              
              <p className="text-lg text-[#9c8578] dark:text-[#a39690] mb-8 leading-relaxed">
                {t('simpleSecure')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => router.push('/register')}
                  size="lg"
                  className="bg-[#bea99a] dark:bg-[#a8968a] hover:bg-[#a8968a] dark:hover:bg-[#97877b] text-white"
                >
                  {t('getStarted')}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => router.push('/login')}
                  className="border-[#e8e1db] dark:border-[#3a322d] text-[#6d5c4e] dark:text-[#d4c8be]"
                >
                  {t('signIn')}
                </Button>
              </div>
              
              <div className="flex items-center mt-8 text-sm text-[#9c8578] dark:text-[#a39690]">
                <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />
                {t('securityStandard')}
              </div>
            </div>
            
            <div className="md:w-1/2 relative">
              <div className="bg-white dark:bg-[#2a2420] rounded-xl border border-[#e8e1db] dark:border-[#3a322d] shadow-xl p-6 transform rotate-1">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#d4c8be] dark:bg-[#3a322d] flex items-center justify-center">
                      <span className="text-[#6d5c4e] dark:text-[#d4c8be] font-semibold text-lg">𝒦.</span>
                    </div>
                    <h3 className="ml-3 text-[#6d5c4e] dark:text-[#d4c8be] font-medium">Krypt Auth</h3>
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    {t('twoFactorAuthentication')}
                  </Badge>
                </div>
                
                <div className="p-4 bg-[#f8f5f2] dark:bg-[#1f1a16] rounded-lg mb-4">
                  <p className="text-[#6d5c4e] dark:text-[#d4c8be] text-sm mb-2">{t('enterCode')}</p>
                  <div className="grid grid-cols-6 gap-2">
                    {["3", "5", "8", "", "", ""].map((digit, index) => (
                      <div 
                        key={index} 
                        className="h-12 w-full rounded-md bg-white dark:bg-[#2a2420] border border-[#e8e1db] dark:border-[#3a322d] flex items-center justify-center text-[#6d5c4e] dark:text-[#d4c8be] text-xl font-mono"
                      >
                        {digit}
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full bg-[#bea99a] dark:bg-[#a8968a] hover:bg-[#a8968a] dark:hover:bg-[#97877b] text-white">
                  {t('verify')}
                </Button>
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-[#2a2420] rounded-xl border border-[#e8e1db] dark:border-[#3a322d] shadow-xl p-4 transform -rotate-2 w-40">
                <div className="flex items-center justify-center">
                  <Mail className="h-6 w-6 text-[#bea99a] dark:text-[#a8968a] mr-2" />
                  <span className="text-[#6d5c4e] dark:text-[#d4c8be] font-medium">
                    {t('emailVerify')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 bg-white dark:bg-[#2a2420]">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#6d5c4e] dark:text-[#d4c8be] mb-4">
              {t('keyFeatures')}
            </h2>
            <p className="text-[#9c8578] dark:text-[#a39690] max-w-2xl mx-auto">
              {t('secureUserFriendly')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-[#e8e1db] dark:border-[#3a322d] bg-[#f8f5f2] dark:bg-[#1f1a16]">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-[#bea99a]/10 dark:bg-[#a8968a]/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-[#bea99a] dark:text-[#a8968a]" />
                </div>
                <h3 className="text-lg font-medium text-[#6d5c4e] dark:text-[#d4c8be] mb-2">
                  {t('secureAuthentication')}
                </h3>
                <p className="text-sm text-[#9c8578] dark:text-[#a39690]">
                  {t('securityProtocols')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-[#e8e1db] dark:border-[#3a322d] bg-[#f8f5f2] dark:bg-[#1f1a16]">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-[#bea99a]/10 dark:bg-[#a8968a]/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-[#bea99a] dark:text-[#a8968a]" />
                </div>
                <h3 className="text-lg font-medium text-[#6d5c4e] dark:text-[#d4c8be] mb-2">
                  {t('twoFactorAuthentication')}
                </h3>
                <p className="text-sm text-[#9c8578] dark:text-[#a39690]">
                  {t('emailVerification')}
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-[#e8e1db] dark:border-[#3a322d] bg-[#f8f5f2] dark:bg-[#1f1a16]">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-[#bea99a]/10 dark:bg-[#a8968a]/10 flex items-center justify-center mb-4">
                  <KeyRound className="h-6 w-6 text-[#bea99a] dark:text-[#a8968a]" />
                </div>
                <h3 className="text-lg font-medium text-[#6d5c4e] dark:text-[#d4c8be] mb-2">
                  {t('passwordRecovery')}
                </h3>
                <p className="text-sm text-[#9c8578] dark:text-[#a39690]">
                  {t('passwordResetProcess')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-[#f8f5f2] dark:bg-[#1f1a16]">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#6d5c4e] dark:text-[#d4c8be] mb-4">
              {t('howItWorksTitle')}
            </h2>
            <p className="text-[#9c8578] dark:text-[#a39690] max-w-2xl mx-auto">
              {t('authenticationSteps')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white dark:bg-[#2a2420] rounded-xl border border-[#e8e1db] dark:border-[#3a322d] p-6 h-full">
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-[#bea99a] dark:bg-[#a8968a] text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div className="pt-4">
                  <h3 className="text-xl font-medium text-[#6d5c4e] dark:text-[#d4c8be] mb-3">
                    {t('createYourAccount')}
                  </h3>
                  <p className="text-[#9c8578] dark:text-[#a39690]">
                    {t('createAccountDesc')}
                  </p>
                </div>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ArrowRight className="h-6 w-6 text-[#bea99a] dark:text-[#a8968a]" />
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white dark:bg-[#2a2420] rounded-xl border border-[#e8e1db] dark:border-[#3a322d] p-6 h-full">
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-[#bea99a] dark:bg-[#a8968a] text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div className="pt-4">
                  <h3 className="text-xl font-medium text-[#6d5c4e] dark:text-[#d4c8be] mb-3">
                    {t('enableTwoFactor')}
                  </h3>
                  <p className="text-[#9c8578] dark:text-[#a39690]">
                    {t('enableTwoFactorDesc')}
                  </p>
                </div>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ArrowRight className="h-6 w-6 text-[#bea99a] dark:text-[#a8968a]" />
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white dark:bg-[#2a2420] rounded-xl border border-[#e8e1db] dark:border-[#3a322d] p-6 h-full">
                <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-[#bea99a] dark:bg-[#a8968a] text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div className="pt-4">
                  <h3 className="text-xl font-medium text-[#6d5c4e] dark:text-[#d4c8be] mb-3">
                    {t('secureLogin')}
                  </h3>
                  <p className="text-[#9c8578] dark:text-[#a39690]">
                    {t('secureLoginDesc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-white dark:bg-[#2a2420]">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#6d5c4e] dark:text-[#d4c8be] mb-4">
              {t('userSay')}
            </h2>
            <p className="text-[#9c8578] dark:text-[#a39690] max-w-2xl mx-auto">
              {t('userSayDesc')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-[#e8e1db] dark:border-[#3a322d]">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-[#6d5c4e] dark:text-[#d4c8be] mb-6 italic">
                  {t('testimonial1')}
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#bea99a]/20 dark:bg-[#a8968a]/20 flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-[#bea99a] dark:text-[#a8968a]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#6d5c4e] dark:text-[#d4c8be]">
                      Sarah J.
                    </h4>
                    <p className="text-sm text-[#9c8578] dark:text-[#a39690]">
                      {t('webDeveloper')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-[#e8e1db] dark:border-[#3a322d]">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-[#6d5c4e] dark:text-[#d4c8be] mb-6 italic">
                  {t('testimonial2')}
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#bea99a]/20 dark:bg-[#a8968a]/20 flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-[#bea99a] dark:text-[#a8968a]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#6d5c4e] dark:text-[#d4c8be]">
                      Michael T.
                    </h4>
                    <p className="text-sm text-[#9c8578] dark:text-[#a39690]">
                      {t('businessOwner')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-[#e8e1db] dark:border-[#3a322d]">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-[#6d5c4e] dark:text-[#d4c8be] mb-6 italic">
                  {t('testimonial3')}
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#bea99a]/20 dark:bg-[#a8968a]/20 flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-[#bea99a] dark:text-[#a8968a]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#6d5c4e] dark:text-[#d4c8be]">
                      Emma R.
                    </h4>
                    <p className="text-sm text-[#9c8578] dark:text-[#a39690]">
                      {t('student')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-[#f8f5f2] dark:bg-[#1f1a16]">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#6d5c4e] dark:text-[#d4c8be] mb-4">
              {t('faq')}
            </h2>
            <p className="text-[#9c8578] dark:text-[#a39690] max-w-2xl mx-auto">
              {t('faqDesc')}
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-[#e8e1db] dark:border-[#3a322d]">
                <AccordionTrigger className="text-[#6d5c4e] dark:text-[#d4c8be] hover:no-underline">
                  {t('faqQuestion1')}
                </AccordionTrigger>
                <AccordionContent className="text-[#9c8578] dark:text-[#a39690]">
                  {t('faqAnswer1')}
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="border-[#e8e1db] dark:border-[#3a322d]">
                <AccordionTrigger className="text-[#6d5c4e] dark:text-[#d4c8be] hover:no-underline">
                  {t('faqQuestion2')}
                </AccordionTrigger>
                <AccordionContent className="text-[#9c8578] dark:text-[#a39690]">
                  {t('faqAnswer2')}
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="border-[#e8e1db] dark:border-[#3a322d]">
                <AccordionTrigger className="text-[#6d5c4e] dark:text-[#d4c8be] hover:no-underline">
                  {t('faqQuestion3')}
                </AccordionTrigger>
                <AccordionContent className="text-[#9c8578] dark:text-[#a39690]">
                  {t('faqAnswer3')}
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="border-[#e8e1db] dark:border-[#3a322d]">
                <AccordionTrigger className="text-[#6d5c4e] dark:text-[#d4c8be] hover:no-underline">
                  {t('faqQuestion4')}
                </AccordionTrigger>
                <AccordionContent className="text-[#9c8578] dark:text-[#a39690]">
                  {t('faqAnswer4')}
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className="border-[#e8e1db] dark:border-[#3a322d]">
                <AccordionTrigger className="text-[#6d5c4e] dark:text-[#d4c8be] hover:no-underline">
                  {t('faqQuestion5')}
                </AccordionTrigger>
                <AccordionContent className="text-[#9c8578] dark:text-[#a39690]">
                  {t('faqAnswer5')}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-[#bea99a] dark:bg-[#a8968a]">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('readyToSecure')}
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            {t('startWithKrypt')}
          </p>
          <Button 
            size="lg"
            onClick={() => router.push('/register')}
            className="bg-white text-[#bea99a] hover:bg-gray-100"
          >
            {t('createAccount')}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-[#f1ece8] dark:bg-[#27211d] border-t border-[#e8e1db] dark:border-[#3a322d] py-8">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="col-span-1">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-[#d4c8be] dark:bg-[#3a322d] flex items-center justify-center shadow-sm">
                  <span className="text-[#6d5c4e] dark:text-[#d4c8be] font-semibold text-sm">𝒦.</span>
                </div>
                <h3 className="ml-2 text-lg font-medium text-[#6d5c4e] dark:text-[#d4c8be]">Krypt</h3>
              </div>
              <p className="text-sm text-[#9c8578] dark:text-[#a39690] mb-4">
                {t('simpleSecure')}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-[#6d5c4e] dark:text-[#d4c8be] mb-4">{t('quickLinks')}</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-sm text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('features')}</Link></li>
                <li><Link href="#how-it-works" className="text-sm text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('howItWorks')}</Link></li>
                <li><Link href="#testimonials" className="text-sm text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('testimonials')}</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-[#6d5c4e] dark:text-[#d4c8be] mb-4">{t('account')}</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="text-sm text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('signIn')}</Link></li>
                <li><Link href="/register" className="text-sm text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('register')}</Link></li>
                <li><Link href="/forgot-password" className="text-sm text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('forgotPassword')}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[#e8e1db] dark:border-[#3a322d] pt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-[#9c8578] dark:text-[#a39690] mb-4 md:mb-0">
              © {new Date().getFullYear()} Krypt. {t('allRightsReserved')}
            </div>
            
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">
                {t('privacyPolicy')}
              </Link>
              <Link href="/terms" className="text-sm text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">
                {t('termsOfService')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}