"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster, toast } from "sonner";
import { User, LogOut, ArrowLeft, Trash } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSelector from "@/components/language-selector";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * NOTE: This file contains UI implementation only. 
 * The API integration is planned for future implementation.
 * Currently using mock data and localStorage for demonstration purposes.
 * In a production environment, these functions would connect to a secure backend API.
 */

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState("en");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
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
    }
    
    /**
     * FUTURE IMPLEMENTATION: API Authentication Check
     * This would validate the user's authentication token with the backend
     * and retrieve the latest user profile data.
     */
    const checkAuth = async () => {
      try {
        // Simulate loading
        setTimeout(() => {
          // Check if we have a token
          const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          
          if (!token) {
            router.push('/login');
            return;
          }
          
          // For demo purposes: Get mock user data from localStorage
          const userStr = localStorage.getItem('user');
          if (userStr) {
            setUser(JSON.parse(userStr));
          } else {
            // Mock user data if none exists
            const mockUser = {
              name: "Jane Doe",
              email: "jane.doe@example.com",
              phone: "+1 (555) 123-4567",
              company: "Acme Corporation",
              title: "Security Specialist"
            };
            setUser(mockUser);
            localStorage.setItem('user', JSON.stringify(mockUser));
          }
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading profile:', error);
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);

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

  // Helper function to get path with language prefix
  const getLocalizedPath = (path: string) => {
    return `/${language}${path.startsWith('/') ? path : `/${path}`}`;
  };
  
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    localStorage.setItem("preferredLanguage", newLang);
  };
  
  /**
   * FUTURE IMPLEMENTATION: Logout API Call
   * This would call the backend to invalidate the user's session/token
   * For now, we just clear local storage and redirect
   */
  const handleLogout = async () => {
    // Clear all authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');
    
    // Show logout toast
    toast.success(t('logoutSuccess') || "Logged out successfully");
    
    // Redirect to login page
    router.push('/login');
  };

  const handleDeleteAccountClick = () => {
    setIsDeleteDialogOpen(true);
  };

  /**
   * FUTURE IMPLEMENTATION: Account Deletion API Call
   * This would securely delete the user's account after password verification
   * For now, we just simulate the process
   */
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear all auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userId');
      
      // Close dialog and show success message
      setIsDeleteDialogOpen(false);
      toast.success(t('accountDeleted') || "Account deleted successfully");
      
      // Redirect to registration page
      router.push('/register');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f2] dark:bg-[#1f1a16]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bea99a]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#f8f5f2] dark:bg-[#1f1a16] transition-colors duration-200">
      <Toaster />
      
      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#2a2420] border-[#e8e1db] dark:border-[#3a322d]">
          <DialogHeader>
            <DialogTitle className="text-[#6d5c4e] dark:text-[#d4c8be]">
              {t('confirmDeleteAccount') || "Delete Account?"}
            </DialogTitle>
            <DialogDescription className="text-[#9c8578] dark:text-[#a39690]">
              {t('deleteAccountWarning') || "This action cannot be undone. Your account and all associated data will be permanently deleted."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#6d5c4e] dark:text-[#d4c8be]">
                {t('confirmPassword') || "Confirm your password"}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-[#e8e1db] dark:border-[#3a322d] bg-[#f8f5f2] dark:bg-[#27211d]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-[#e8e1db] dark:border-[#3a322d] text-[#6d5c4e] dark:text-[#d4c8be]"
            >
              {t('cancel') || "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={!password || isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <span className="animate-spin mr-2">⊚</span>
                  {t('deleting') || "Deleting..."}
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  {t('deleteAccount') || "Delete Account"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Header/Navigation */}
      <header className="sticky top-0 z-10 bg-white dark:bg-[#2a2420] border-b border-[#e8e1db] dark:border-[#3a322d] shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={getLocalizedPath('/home')} className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#d4c8be] dark:bg-[#3a322d] flex items-center justify-center shadow-sm">
                <span className="text-[#6d5c4e] dark:text-[#d4c8be] font-semibold text-sm">𝒦.</span>
              </div>
              <h1 className="ml-2 text-xl font-medium text-[#6d5c4e] dark:text-[#d4c8be] hidden sm:block">Krypt</h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <LanguageSelector currentLanguage={language} onLanguageChange={handleLanguageChange} />
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-6">
        <div className="flex items-center mb-6">
          <Link 
            href={getLocalizedPath('/home')}
            className="mr-4 p-2 rounded-full hover:bg-[#f1ece8] dark:hover:bg-[#27211d] text-[#9c8578] dark:text-[#a39690]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h2 className="text-2xl font-medium text-[#6d5c4e] dark:text-[#d4c8be]">
            {t('profile') || "Profile"}
          </h2>
        </div>
        
        <Card className="bg-white dark:bg-[#2a2420] border-[#e8e1db] dark:border-[#3a322d] shadow-sm max-w-2xl mx-auto">
          <CardHeader className="pb-4 border-b border-[#e8e1db] dark:border-[#3a322d]">
            <div className="flex items-center">
              <div className="w-14 h-14 rounded-full bg-[#f1ece8] dark:bg-[#27211d] flex items-center justify-center">
                <User className="h-7 w-7 text-[#bea99a] dark:text-[#a8968a]" />
              </div>
              <CardTitle className="text-xl text-[#6d5c4e] dark:text-[#d4c8be] ml-4">
                {t('profileInformation') || "Profile Information"}
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-6">
            {/* Name Field */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-[#9c8578] dark:text-[#a39690]">
                {t('name') || "Name"}
              </h3>
              <p className="text-[#6d5c4e] dark:text-[#d4c8be] p-2 bg-[#f1ece8] dark:bg-[#27211d] rounded-md">
                {user?.name || "—"}
              </p>
            </div>
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-[#9c8578] dark:text-[#a39690]">
                {t('email') || "Email"}
              </h3>
              <p className="text-[#6d5c4e] dark:text-[#d4c8be] p-2 bg-[#f1ece8] dark:bg-[#27211d] rounded-md">
                {user?.email || "—"}
              </p>
            </div>
            
            {/* Phone Field */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-[#9c8578] dark:text-[#a39690]">
                {t('phone') || "Phone"}
              </h3>
              <p className="text-[#6d5c4e] dark:text-[#d4c8be] p-2 bg-[#f1ece8] dark:bg-[#27211d] rounded-md">
                {user?.phone || "—"}
              </p>
            </div>
            
            {/* Company Field */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-[#9c8578] dark:text-[#a39690]">
                {t('company') || "Company"}
              </h3>
              <p className="text-[#6d5c4e] dark:text-[#d4c8be] p-2 bg-[#f1ece8] dark:bg-[#27211d] rounded-md">
                {user?.company || "—"}
              </p>
            </div>
            
            {/* Title Field */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-medium text-[#9c8578] dark:text-[#a39690]">
                {t('title') || "Title"}
              </h3>
              <p className="text-[#6d5c4e] dark:text-[#d4c8be] p-2 bg-[#f1ece8] dark:bg-[#27211d] rounded-md">
                {user?.title || "—"}
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="pt-4 border-t border-[#e8e1db] dark:border-[#3a322d] flex flex-col space-y-3">
            <Button 
              variant="default" 
              className="w-full bg-[#bea99a] hover:bg-[#a8968a] text-white"
              onClick={() => router.push(getLocalizedPath('/profile/edit'))}
            >
              <User className="h-4 w-4 mr-2" />
              {t('updateProfile') || "Update Profile"}
            </Button>
            
            <div className="flex space-x-3 w-full">
              <Button 
                variant="outline" 
                className="flex-1 border-[#e8e1db] dark:border-[#3a322d] text-[#6d5c4e] dark:text-[#d4c8be] hover:bg-[#f1ece8] dark:hover:bg-[#27211d]"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t('logout') || "Logout"}
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={handleDeleteAccountClick}
              >
                <Trash className="h-4 w-4 mr-2" />
                {t('deleteAccount') || "Delete Account"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Footer */}
      <footer className="bg-[#f1ece8] dark:bg-[#27211d] border-t border-[#e8e1db] dark:border-[#3a322d] py-4 px-6 text-center mt-auto">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <div className="text-sm text-[#9c8578] dark:text-[#a39690] mb-2 sm:mb-0">
            © 2025 Krypt. {t('allRightsReserved')}
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href={getLocalizedPath('/privacy')}
              className="text-sm text-[#9c8578] dark:text-[#a39690] hover:text-[#7d6a5d] dark:hover:text-[#d4c8be]"
            >
              {t('privacyPolicy')}
            </Link>
            <Link 
              href={getLocalizedPath('/terms')}
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