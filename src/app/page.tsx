"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSelector from "@/components/language-selector";
import { useRouter } from "next/navigation";
import { ChevronRight, Lock, Shield, Key, Fingerprint, Github } from "lucide-react";

export default function HomePage() {
  const [language, setLanguage] = useState("en");
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  // Handle scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
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
  }, []);

  // Translation helper function
  const t = (key: string) => {
    try {
      const translations = require(`../../public/locales/${language}/common.json`);
      return translations[key] || key;
    } catch (error) {
      return key;
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    localStorage.setItem("preferredLanguage", newLang);
  };
  
  const features = [
    {
      icon: <Lock className="w-6 h-6" />,
      title: t('secureAuth'),
      description: t('secureAuthDesc')
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('twoFactor'),
      description: t('twoFactorDesc')
    },
    {
      icon: <Key className="w-6 h-6" />,
      title: t('passwordless'),
      description: t('passwordlessDesc')
    },
    {
      icon: <Fingerprint className="w-6 h-6" />,
      title: t('biometricAuth'),
      description: t('biometricAuthDesc')
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f5f2] dark:bg-[#1f1a16] text-[#6d5c4e] dark:text-[#d4c8be]">
      {/* Navigation */}
      <header className={`sticky top-0 z-50 w-full transition-colors duration-300 ${scrolled ? 'bg-[#f8f5f2]/95 dark:bg-[#1f1a16]/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-[#d4c8be] dark:bg-[#3a322d] flex items-center justify-center shadow-md">
              <span className="text-[#6d5c4e] dark:text-[#d4c8be] font-semibold text-xl">𝒦.</span>
            </div>
            <span className="font-medium text-xl">Krypt</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-[#6d5c4e] dark:text-[#d4c8be] hover:text-[#bea99a] dark:hover:text-[#bea99a] transition-colors">
              {t('features')}
            </Link>
            <Link href="#how-it-works" className="text-[#6d5c4e] dark:text-[#d4c8be] hover:text-[#bea99a] dark:hover:text-[#bea99a] transition-colors">
              {t('howItWorks')}
            </Link>
            <Link href="#testimonials" className="text-[#6d5c4e] dark:text-[#d4c8be] hover:text-[#bea99a] dark:hover:text-[#bea99a] transition-colors">
              {t('testimonials')}
            </Link>
            <Link href="#pricing" className="text-[#6d5c4e] dark:text-[#d4c8be] hover:text-[#bea99a] dark:hover:text-[#bea99a] transition-colors">
              {t('pricing')}
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <ThemeToggle />
              <LanguageSelector currentLanguage={language} onLanguageChange={handleLanguageChange} />
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" className="text-[#6d5c4e] dark:text-[#d4c8be] hover:text-[#bea99a] hover:bg-[#f1ece8] dark:hover:bg-[#3a322d] dark:hover:text-[#bea99a]">
                  {t('signIn')}
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#bea99a] dark:bg-[#a8968a] hover:bg-[#a8968a] dark:hover:bg-[#97877b] text-white shadow-sm transition-all hover:shadow-md">
                  {t('signUp')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 px-4">
          <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {t('heroTitle')}
              </h1>
              <p className="text-lg md:text-xl text-[#9c8578] dark:text-[#a39690] max-w-lg">
                {t('heroSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row pt-4 space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/register">
                  <Button className="w-full sm:w-auto px-8 py-6 text-base bg-[#bea99a] dark:bg-[#a8968a] hover:bg-[#a8968a] dark:hover:bg-[#97877b] text-white shadow-sm transition-all hover:shadow-md">
                    {t('getStarted')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" className="w-full sm:w-auto px-8 py-6 text-base border-[#e8e1db] dark:border-[#3a322d] text-[#6d5c4e] dark:text-[#d4c8be] hover:bg-[#f1ece8] dark:hover:bg-[#3a322d]">
                    {t('learnMore')}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 bg-[#d4c8be] dark:bg-[#3a322d] rounded-3xl transform rotate-6 opacity-30"></div>
                <div className="absolute inset-0 bg-white dark:bg-[#2a2420] rounded-3xl shadow-xl overflow-hidden">
                  <div className="p-6 border-b border-[#e8e1db] dark:border-[#3a322d]">
                    <div className="w-8 h-8 rounded-full bg-[#d4c8be] dark:bg-[#3a322d] flex items-center justify-center shadow-md">
                      <span className="text-[#6d5c4e] dark:text-[#d4c8be] font-semibold text-sm">𝒦.</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="h-10 w-3/4 bg-[#e8e1db] dark:bg-[#3a322d] rounded-md"></div>
                      <div className="h-10 w-full bg-[#e8e1db] dark:bg-[#3a322d] rounded-md"></div>
                      <div className="h-10 w-3/4 bg-[#e8e1db] dark:bg-[#3a322d] rounded-md"></div>
                      <div className="mt-8 h-12 bg-[#bea99a] dark:bg-[#a8968a] rounded-md"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e8e1db] dark:via-[#3a322d] to-transparent"></div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">{t('featuresTitle')}</h2>
              <p className="mt-4 text-lg text-[#9c8578] dark:text-[#a39690] max-w-xl mx-auto">
                {t('featuresSubtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="p-6 bg-white dark:bg-[#2a2420] rounded-xl shadow-sm border border-[#e8e1db] dark:border-[#3a322d] hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-[#f8f5f2] dark:bg-[#1f1a16] flex items-center justify-center mb-4 text-[#bea99a] dark:text-[#a8968a]">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-[#9c8578] dark:text-[#a39690]">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section id="how-it-works" className="py-20 px-4 bg-[#f1ece8] dark:bg-[#27211d]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">{t('howItWorksTitle')}</h2>
              <p className="mt-4 text-lg text-[#9c8578] dark:text-[#a39690] max-w-xl mx-auto">
                {t('howItWorksSubtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="relative">
                  <div className="bg-white dark:bg-[#2a2420] rounded-xl p-6 pb-12 shadow-sm border border-[#e8e1db] dark:border-[#3a322d]">
                    <div className="w-12 h-12 rounded-full bg-[#bea99a] dark:bg-[#a8968a] flex items-center justify-center text-white font-bold mb-4">
                      {step}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{t(`step${step}Title`)}</h3>
                    <p className="text-[#9c8578] dark:text-[#a39690]">{t(`step${step}Desc`)}</p>
                  </div>
                  
                  {step < 3 && (
                    <div className="hidden md:block absolute top-1/2 right-0 w-8 h-8 transform translate-x-1/2 -translate-y-1/2">
                      <ChevronRight className="w-8 h-8 text-[#bea99a] dark:text-[#a8968a]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <Link href="/register">
                <Button className="px-8 py-6 text-base bg-[#bea99a] dark:bg-[#a8968a] hover:bg-[#a8968a] dark:hover:bg-[#97877b] text-white shadow-sm transition-all hover:shadow-md">
                  {t('createAccount')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section id="testimonials" className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">{t('testimonialsTitle')}</h2>
              <p className="mt-4 text-lg text-[#9c8578] dark:text-[#a39690] max-w-xl mx-auto">
                {t('testimonialsSubtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((testimonial) => (
                <div 
                  key={testimonial}
                  className="p-6 bg-white dark:bg-[#2a2420] rounded-xl shadow-sm border border-[#e8e1db] dark:border-[#3a322d]"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#e8e1db] dark:bg-[#3a322d]"></div>
                    <div>
                      <p className="font-medium">{t(`testimonial${testimonial}Name`)}</p>
                      <p className="text-sm text-[#9c8578] dark:text-[#a39690]">{t(`testimonial${testimonial}Role`)}</p>
                    </div>
                  </div>
                  <p className="text-[#9c8578] dark:text-[#a39690]">"{t(`testimonial${testimonial}Text`)}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Pricing */}
        <section id="pricing" className="py-20 px-4 bg-[#f1ece8] dark:bg-[#27211d]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">{t('pricingTitle')}</h2>
              <p className="mt-4 text-lg text-[#9c8578] dark:text-[#a39690] max-w-xl mx-auto">
                {t('pricingSubtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {['free', 'pro', 'business'].map((plan) => (
                <div 
                  key={plan}
                  className={`p-8 rounded-xl shadow-sm border ${
                    plan === 'pro' 
                      ? 'bg-white dark:bg-[#2a2420] border-[#bea99a] dark:border-[#a8968a] shadow-md relative overflow-hidden' 
                      : 'bg-white dark:bg-[#2a2420] border-[#e8e1db] dark:border-[#3a322d]'
                  }`}
                >
                  {plan === 'pro' && (
                    <div className="absolute top-0 right-0 bg-[#bea99a] dark:bg-[#a8968a] text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                      {t('popular')}
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2 capitalize">{t(`${plan}Plan`)}</h3>
                  <div className="flex items-baseline mb-6">
                    <span className="text-3xl font-bold">${t(`${plan}Price`)}</span>
                    <span className="text-[#9c8578] dark:text-[#a39690] ml-1">/{t('month')}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {[1, 2, 3, 4].map((feature) => (
                      <li key={feature} className="flex items-start">
                        <svg className="w-5 h-5 text-[#bea99a] dark:text-[#a8968a] mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-[#6d5c4e] dark:text-[#d4c8be]">{t(`${plan}Feature${feature}`)}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      plan === 'pro'
                        ? 'bg-[#bea99a] dark:bg-[#a8968a] hover:bg-[#a8968a] dark:hover:bg-[#97877b] text-white'
                        : 'bg-white dark:bg-[#2a2420] border border-[#e8e1db] dark:border-[#3a322d] hover:bg-[#f8f5f2] dark:hover:bg-[#1f1a16] text-[#6d5c4e] dark:text-[#d4c8be]'
                    }`}
                    onClick={() => router.push('/register')}
                  >
                    {t('chooseThisPlan')}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl bg-[#bea99a] dark:bg-[#a8968a] rounded-2xl overflow-hidden shadow-lg">
            <div className="p-12 md:p-16 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('ctaTitle')}</h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">{t('ctaText')}</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  className="bg-white hover:bg-gray-100 text-[#6d5c4e]"
                  onClick={() => router.push('/register')}
                >
                  {t('signUp')}
                </Button>
                <Button 
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                  onClick={() => router.push('/login')}
                >
                  {t('signIn')}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#f1ece8] dark:bg-[#27211d] border-t border-[#e8e1db] dark:border-[#3a322d] py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-semibold text-lg mb-4">{t('product')}</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('features')}</Link></li>
                <li><Link href="#pricing" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('pricing')}</Link></li>
                <li><Link href="#" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('security')}</Link></li>
                <li><Link href="#" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('enterprise')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">{t('company')}</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('about')}</Link></li>
                <li><Link href="#" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('blog')}</Link></li>
                <li><Link href="#" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('careers')}</Link></li>
                <li><Link href="#" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('contact')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">{t('resources')}</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('documentation')}</Link></li>
                <li><Link href="#" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('guides')}</Link></li>
                <li><Link href="#" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('api')}</Link></li>
                <li><Link href="#" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('status')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">{t('legal')}</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('privacyPolicy')}</Link></li>
                <li><Link href="/terms" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('termsOfService')}</Link></li>
                <li><Link href="#" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('cookies')}</Link></li>
                <li><Link href="#" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">{t('license')}</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#e8e1db] dark:border-[#3a322d] flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#d4c8be] dark:bg-[#3a322d] flex items-center justify-center mr-2 shadow-sm">
                <span className="text-[#6d5c4e] dark:text-[#d4c8be] font-semibold text-sm">𝒦.</span>
              </div>
              <span className="font-medium">Krypt</span>
              <span className="mx-2 text-[#9c8578] dark:text-[#a39690]">·</span>
              <span className="text-sm text-[#9c8578] dark:text-[#a39690]">© {currentYear} {t('allRightsReserved')}</span>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">
                <Github size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
