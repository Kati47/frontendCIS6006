"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSelector from "@/components/language-selector";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  BarChart3, 
  Bell, 
  ChevronDown, 
  Download,
  Filter, 
  Home, 
  Key, 
  LineChart, 
  LogOut, 
  Mail,
  Menu, 
  Search, 
  Settings, 
  Shield, 
  User, 
  Users, 
  X
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Mock data for the dashboard
const recentUsersData = [
  { id: 1, name: "Emma Wilson", email: "emma.w@example.com", status: "active", date: "2025-05-22", method: "email" },
  { id: 2, name: "Marcus Chen", email: "marcus.c@example.com", status: "active", date: "2025-05-22", method: "google" },
  { id: 3, name: "Sophia Rodriguez", email: "sophia.r@example.com", status: "pending", date: "2025-05-21", method: "email" },
  { id: 4, name: "James Johnson", email: "james.j@example.com", status: "inactive", date: "2025-05-21", method: "github" },
  { id: 5, name: "Olivia Kim", email: "olivia.k@example.com", status: "active", date: "2025-05-20", method: "email" }
];

const recentActivitiesData = [
  { id: 1, user: "Emma Wilson", type: "login", status: "success", date: "2025-05-22 14:35", ip: "192.168.1.1", location: "New York, US" },
  { id: 2, name: "Marcus Chen", type: "password_reset", status: "success", date: "2025-05-22 13:21", ip: "172.16.254.1", location: "San Francisco, US" },
  { id: 3, name: "System", type: "backup", status: "success", date: "2025-05-22 12:00", ip: "Internal", location: "Server" },
  { id: 4, name: "Sophia Rodriguez", type: "2fa_setup", status: "failed", date: "2025-05-21 23:15", ip: "10.0.0.1", location: "Miami, US" },
  { id: 5, name: "James Johnson", type: "login", status: "failed", date: "2025-05-21 19:44", ip: "192.168.1.25", location: "Chicago, US" }
];

export default function AdminDashboard() {
  const [language, setLanguage] = useState("en");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
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
    
    // Check screen size for sidebar
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Translation helper function
  const t = (key: string) => {
    try {
      const translations = require(`../../../../public/locales/${language}/admin.json`);
      return translations[key] || key;
    } catch (error) {
      return key;
    }
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    localStorage.setItem("preferredLanguage", newLang);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const statusStyles = {
      active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      inactive: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
      success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    };
    
    return (
      <Badge variant="outline" className={`${statusStyles[status as keyof typeof statusStyles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  
  const AuthMethodIcon = ({ method }: { method: string }) => {
    switch (method) {
      case 'google':
        return (
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
        );
      case 'github':
        return (
          <div className="w-6 h-6 rounded-full bg-[#24292e] flex items-center justify-center shadow-sm">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-[#e8e1db] dark:bg-[#3a322d] flex items-center justify-center shadow-sm">
            <Mail className="w-3.5 h-3.5 text-[#9c8578] dark:text-[#a39690]" />
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f5f2] dark:bg-[#1f1a16] text-[#6d5c4e] dark:text-[#d4c8be]">
      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-[#2a2420] border-r border-[#e8e1db] dark:border-[#3a322d] transition-transform duration-300 ease-in-out lg:relative lg:transform-none
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}
        `}
      >
        {/* Sidebar Header */}
        <div className={`h-16 flex items-center ${isSidebarOpen ? 'px-6 justify-between' : 'justify-center'}`}>
          {isSidebarOpen && (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#d4c8be] dark:bg-[#3a322d] flex items-center justify-center shadow-sm">
                <span className="text-[#6d5c4e] dark:text-[#d4c8be] font-semibold text-sm">𝒦.</span>
              </div>
              <span className="ml-2 font-medium">Krypt Admin</span>
            </div>
          )}
          
          <button 
            onClick={toggleSidebar}
            className="hidden lg:flex p-1 rounded-md hover:bg-[#f1ece8] dark:hover:bg-[#3a322d]"
          >
            <ChevronDown 
              className={`w-5 h-5 transition-transform ${!isSidebarOpen ? 'rotate-90' : ''}`} 
            />
          </button>
          
          <button 
            onClick={toggleMobileSidebar}
            className="lg:hidden p-1 rounded-md hover:bg-[#f1ece8] dark:hover:bg-[#3a322d]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Sidebar Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {[
              { title: 'Dashboard', icon: <Home className="w-5 h-5" />, href: '/admin/dashboard' },
              { title: 'Users', icon: <Users className="w-5 h-5" />, href: '/admin/users' },
              { title: 'Authentication', icon: <Key className="w-5 h-5" />, href: '/admin/auth' },
              { title: 'Security', icon: <Shield className="w-5 h-5" />, href: '/admin/security' },
              { title: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, href: '/admin/analytics' },
              { title: 'Settings', icon: <Settings className="w-5 h-5" />, href: '/admin/settings' }
            ].map((item, index) => (
              <li key={index}>
                <Link 
                  href={item.href} 
                  className={`
                    flex items-center p-2 rounded-md transition-colors
                    ${item.href === '/admin/dashboard' 
                      ? 'bg-[#f1ece8] dark:bg-[#3a322d] text-[#6d5c4e] dark:text-[#d4c8be]' 
                      : 'hover:bg-[#f1ece8] dark:hover:bg-[#3a322d] text-[#9c8578] dark:text-[#a39690] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be]'}
                  `}
                >
                  {item.icon}
                  {isSidebarOpen && <span className="ml-3">{t(item.title.toLowerCase())}</span>}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mt-8 pt-4 border-t border-[#e8e1db] dark:border-[#3a322d]">
            <Link 
              href="/login" 
              className="flex items-center p-2 rounded-md text-[#9c8578] dark:text-[#a39690] hover:bg-[#f1ece8] dark:hover:bg-[#3a322d] hover:text-[#6d5c4e] dark:hover:text-[#d4c8be] transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span className="ml-3">{t('logout')}</span>}
            </Link>
          </div>
        </nav>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-[#2a2420] border-b border-[#e8e1db] dark:border-[#3a322d] flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <button 
              onClick={toggleMobileSidebar}
              className="lg:hidden p-2 mr-2 rounded-md hover:bg-[#f1ece8] dark:hover:bg-[#3a322d]"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <h1 className="text-xl font-medium">{t('dashboard')}</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Input 
                type="search" 
                placeholder={t('search')} 
                className="w-48 lg:w-64 bg-[#f8f5f2] dark:bg-[#1f1a16] border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a]"
              />
              <Search className="absolute top-1/2 right-3 transform -translate-y-1/2 w-4 h-4 text-[#9c8578] dark:text-[#a39690]" />
            </div>
            
            <button className="p-2 relative rounded-md hover:bg-[#f1ece8] dark:hover:bg-[#3a322d]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#bea99a]"></span>
            </button>
            
            <div className="hidden sm:flex items-center space-x-2">
              <ThemeToggle />
              <LanguageSelector currentLanguage={language} onLanguageChange={handleLanguageChange} />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar.png" alt="Admin" />
                    <AvatarFallback className="bg-[#d4c8be] dark:bg-[#3a322d] text-[#6d5c4e] dark:text-[#d4c8be]">
                      A
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-[#2a2420] border-[#e8e1db] dark:border-[#3a322d]">
                <div className="flex items-center p-2 space-x-2">
                  <div>
                    <p className="font-medium text-sm">Admin</p>
                    <p className="text-xs text-[#9c8578] dark:text-[#a39690]">admin@krypt.com</p>
                  </div>
                </div>
                <Separator className="my-1 bg-[#e8e1db] dark:bg-[#3a322d]" />
                <DropdownMenuItem className="hover:bg-[#f1ece8] dark:hover:bg-[#3a322d] cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  <span>{t('profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-[#f1ece8] dark:hover:bg-[#3a322d] cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  <span>{t('account')}</span>
                </DropdownMenuItem>
                <Separator className="my-1 bg-[#e8e1db] dark:bg-[#3a322d]" />
                <DropdownMenuItem className="hover:bg-[#f1ece8] dark:hover:bg-[#3a322d] cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {[
              { title: 'totalUsers', value: '24,861', trend: '+12%', color: 'bg-[#bea99a] dark:bg-[#a8968a]' },
              { title: 'activeUsers', value: '18,204', trend: '+8%', color: 'bg-emerald-500 dark:bg-emerald-600' },
              { title: 'newUsers', value: '1,463', trend: '+24%', color: 'bg-blue-500 dark:bg-blue-600' },
              { title: 'failedAttempts', value: '312', trend: '-7%', color: 'bg-rose-500 dark:bg-rose-600' },
            ].map((card, index) => (
              <Card key={index} className="border-[#e8e1db] dark:border-[#3a322d] shadow-sm bg-white dark:bg-[#2a2420]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#9c8578] dark:text-[#a39690]">
                    {t(card.title)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline">
                    <div className="text-2xl font-bold">{card.value}</div>
                    <div className={`ml-2 text-xs font-medium ${card.trend.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {card.trend}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center space-x-2">
                    <div className={`h-2 w-full rounded-full bg-[#e8e1db] dark:bg-[#3a322d] overflow-hidden`}>
                      <div className={`h-full ${card.color} rounded-full`} style={{ width: Math.floor(Math.random() * 30 + 70) + '%' }}></div>
                    </div>
                    <span className="text-xs text-[#9c8578] dark:text-[#a39690]">
                      {Math.floor(Math.random() * 30 + 70)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="border-[#e8e1db] dark:border-[#3a322d] shadow-sm bg-white dark:bg-[#2a2420]">
              <CardHeader className="pb-0 flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t('userGrowth')}</CardTitle>
                  <CardDescription>{t('userGrowthDesc')}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="border-[#e8e1db] dark:border-[#3a322d] hover:bg-[#f1ece8] dark:hover:bg-[#3a322d]">
                    <LineChart className="w-4 h-4 mr-1" />
                    {t('chartType')}
                  </Button>
                  <Button variant="outline" size="sm" className="border-[#e8e1db] dark:border-[#3a322d] hover:bg-[#f1ece8] dark:hover:bg-[#3a322d]">
                    <Download className="w-4 h-4 mr-1" />
                    {t('export')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Chart mockup */}
                <div className="h-[240px] flex flex-col justify-end">
                  <div className="w-full grid grid-cols-7 gap-2 h-full">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const height = 40 + Math.random() * 60;
                      return (
                        <div key={i} className="relative flex flex-col justify-end">
                          <div 
                            className="w-full bg-[#bea99a] dark:bg-[#a8968a] rounded-sm hover:opacity-80 transition-opacity"
                            style={{ height: `${height}%` }}
                          ></div>
                          <span className="text-xs text-center mt-2 text-[#9c8578] dark:text-[#a39690]">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-[#e8e1db] dark:border-[#3a322d] shadow-sm bg-white dark:bg-[#2a2420]">
              <CardHeader className="pb-0 flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t('authMethods')}</CardTitle>
                  <CardDescription>{t('authMethodsDesc')}</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="border-[#e8e1db] dark:border-[#3a322d] hover:bg-[#f1ece8] dark:hover:bg-[#3a322d]">
                  <Filter className="w-4 h-4 mr-1" />
                  {t('filter')}
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Donut chart mockup */}
                <div className="flex items-center justify-center py-8">
                  <div className="relative h-40 w-40">
                    {/* Chart segments - colored rings */}
                    <div className="absolute inset-0 rounded-full border-[16px] border-[#bea99a] dark:border-[#a8968a] rotate-0"></div>
                    <div className="absolute inset-0 rounded-full border-[16px] border-blue-500 dark:border-blue-600 rotate-[108deg]"></div>
                    <div className="absolute inset-0 rounded-full border-[16px] border-emerald-500 dark:border-emerald-600 rotate-[252deg]"></div>
                    
                    {/* White center */}
                    <div className="absolute inset-[16px] rounded-full bg-white dark:bg-[#2a2420] flex items-center justify-center">
                      <span className="font-medium">24.8k</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-4">
                  {[
                    { name: 'Email', value: '54%', color: 'bg-[#bea99a] dark:bg-[#a8968a]' },
                    { name: 'Google', value: '30%', color: 'bg-blue-500 dark:bg-blue-600' },
                    { name: 'GitHub', value: '16%', color: 'bg-emerald-500 dark:bg-emerald-600' }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`h-2 w-8 ${item.color} rounded-full mb-1`}></div>
                      <div className="text-sm font-medium">{item.value}</div>
                      <div className="text-xs text-[#9c8578] dark:text-[#a39690]">{item.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activities & Users Tabs */}
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="bg-[#f1ece8] dark:bg-[#27211d] border border-[#e8e1db] dark:border-[#3a322d] p-1 rounded-lg">
              <TabsTrigger 
                value="users"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#2a2420] data-[state=active]:shadow-sm"
              >
                {t('recentUsers')}
              </TabsTrigger>
              <TabsTrigger 
                value="activities"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#2a2420] data-[state=active]:shadow-sm"
              >
                {t('recentActivities')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="mt-4">
              <Card className="border-[#e8e1db] dark:border-[#3a322d] shadow-sm bg-white dark:bg-[#2a2420]">
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle>{t('recentUsers')}</CardTitle>
                    <Link href="/admin/users" className="text-sm font-medium text-[#bea99a] dark:text-[#a8968a] hover:underline">
                      {t('viewAll')}
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-[#9c8578] dark:text-[#a39690] border-b border-[#e8e1db] dark:border-[#3a322d]">
                          <th className="text-left py-3 px-4 font-medium">{t('name')}</th>
                          <th className="text-left py-3 px-4 font-medium">{t('email')}</th>
                          <th className="text-left py-3 px-4 font-medium">{t('status')}</th>
                          <th className="text-left py-3 px-4 font-medium">{t('date')}</th>
                          <th className="text-left py-3 px-4 font-medium">{t('method')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentUsersData.map((user) => (
                          <tr key={user.id} className="border-b border-[#e8e1db] dark:border-[#3a322d] hover:bg-[#f8f5f2] dark:hover:bg-[#1f1a16] transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <Avatar className="h-7 w-7 mr-2">
                                  <AvatarFallback className="bg-[#d4c8be] dark:bg-[#3a322d] text-[#6d5c4e] dark:text-[#d4c8be] text-xs">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm">{user.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-[#9c8578] dark:text-[#a39690]">
                              {user.email}
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status={user.status} />
                            </td>
                            <td className="py-3 px-4 text-sm text-[#9c8578] dark:text-[#a39690]">
                              {user.date}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex justify-start">
                                <AuthMethodIcon method={user.method} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activities" className="mt-4">
              <Card className="border-[#e8e1db] dark:border-[#3a322d] shadow-sm bg-white dark:bg-[#2a2420]">
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between">
                    <CardTitle>{t('recentActivities')}</CardTitle>
                    <Link href="/admin/activities" className="text-sm font-medium text-[#bea99a] dark:text-[#a8968a] hover:underline">
                      {t('viewAll')}
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-[#9c8578] dark:text-[#a39690] border-b border-[#e8e1db] dark:border-[#3a322d]">
                          <th className="text-left py-3 px-4 font-medium">{t('event')}</th>
                          <th className="text-left py-3 px-4 font-medium">{t('status')}</th>
                          <th className="text-left py-3 px-4 font-medium">{t('time')}</th>
                          <th className="text-left py-3 px-4 font-medium">{t('ip')}</th>
                          <th className="text-left py-3 px-4 font-medium">{t('location')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentActivitiesData.map((activity) => (
                          <tr key={activity.id} className="border-b border-[#e8e1db] dark:border-[#3a322d] hover:bg-[#f8f5f2] dark:hover:bg-[#1f1a16] transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm">{activity.type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status={activity.status} />
                            </td>
                            <td className="py-3 px-4 text-sm text-[#9c8578] dark:text-[#a39690]">
                              {activity.date}
                            </td>
                            <td className="py-3 px-4 text-sm text-[#9c8578] dark:text-[#a39690]">
                              {activity.ip}
                            </td>
                            <td className="py-3 px-4 text-sm text-[#9c8578] dark:text-[#a39690]">
                              {activity.location}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}