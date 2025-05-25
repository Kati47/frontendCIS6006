"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import ThemeToggle from "@/components/theme-toggle";
import LanguageSelector from "@/components/language-selector";
import { useRouter } from "next/navigation";
import { Shield, Search, Lock, FileText, Key, Settings, Bell, ShoppingBag, Shirt, Book, User, LogOut, ChevronDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// API URL should be defined
const API_URL = process.env.NEXT_PUBLIC_API_URL ;

// Category colors for styling - removed food and other
const categoryColors: Record<string, string> = {
  "electronics": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "clothing": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "books": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

// Category icons for visual representation - removed food and other
const categoryIcons: Record<string, React.ReactNode> = {
  "electronics": <Key className="h-5 w-5 text-[#bea99a] dark:text-[#a8968a]" />,
  "clothing": <Shirt className="h-5 w-5 text-[#bea99a] dark:text-[#a8968a]" />,
  "books": <Book className="h-5 w-5 text-[#bea99a] dark:text-[#a8968a]" />,
};

export default function HomePage() {
  const [language, setLanguage] = useState("en");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [allItems, setAllItems] = useState<any[]>([]); // Store all fetched items
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [user, setUser] = useState<any>(null);
  const [sortBy, setSortBy] = useState("updatedAt");
  
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
    
    // Check authentication status
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        
        if (!token) {
          router.push('/login');
          return;
        }
        
        // Get user data
        const userStr = localStorage.getItem('user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }
        
        // Fetch items
        fetchItems();
      } catch (error) {
        console.error('Auth check error:', error);
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

  // Update displayed items when category, search or sort criteria changes
  useEffect(() => {
    if (allItems.length > 0) {
      filterAndSortItems();
    }
  }, [activeCategory, searchQuery, sortBy, allItems]);

  // Function to fetch items from API
  const fetchItems = async () => {
    try {
      setIsLoading(true);
      
      // Get auth token from storage
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (!token) {
        toast.error("Authentication required");
        router.push('/login');
        return;
      }
      
      // Fetch all items from API without any query parameters
      const response = await fetch(`${API_URL}/items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      
      const data = await response.json();
      
      // Process the data
      let items = [];
      if (data && Array.isArray(data)) {
        items = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        items = data.data;
      } else {
        console.error('Unexpected API response format:', data);
        items = [];
      }
      
      // Transform API data to match our component's expected format
      const transformedItems = items.map((item: any) => ({
        id: item._id,
        title: item.name,
        description: item.description || "No description available",
        category: item.category === "food" || item.category === "other" ? "books" : item.category || "electronics",
        price: item.price || 0,
        updatedAt: item.updatedAt || item.createdAt,
        createdAt: item.createdAt
      }));
      
      setAllItems(transformedItems);
      // Initial filter and sort will be handled by the useEffect
    } catch (error) {
      console.error('Error fetching items:', error);
      setAllItems([]);
      setFilteredItems([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to filter and sort items based on current criteria
  const filterAndSortItems = () => {
    let result = [...allItems];
    
    // Filter by category if not 'all'
    if (activeCategory !== 'all') {
      result = result.filter(item => item.category === activeCategory);
    }
    
    // Filter by search query if present
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }
    
    // Sort items
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updatedAt':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
    
    setFilteredItems(result);
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    localStorage.setItem("preferredLanguage", newLang);
  };

  // Helper function to get path with language prefix
  const getLocalizedPath = (path: string) => {
    return `/${language}${path.startsWith('/') ? path : `/${path}`}`;
  };
  
  const handleCategoryChange = (value: string) => {
    setActiveCategory(value);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language, { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  const handleLogout = async () => {
    try {
      // Get auth token from storage
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      if (token) {
        // Call logout API endpoint
        const response = await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.error('Logout API failed:', response.status);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all authentication data from client side
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userId');
      
      // Show logout toast
      toast.success(t('logoutSuccess') || "Logged out successfully");
      
      // Redirect to login page
      router.push('/login');
    }
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
            
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9c8578] dark:text-[#a39690]" />
              <Input 
                type="search" 
                placeholder={t('searchItems')}
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a] bg-[#f1ece8] dark:bg-[#27211d] text-[#6d5c4e] dark:text-[#d4c8be]"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
           
            
            <ThemeToggle />
            <LanguageSelector currentLanguage={language} onLanguageChange={handleLanguageChange} />
            
            {/* User Profile Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-2 text-[#6d5c4e] dark:text-[#d4c8be] hover:bg-[#f1ece8] dark:hover:bg-[#3a322d] flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">{user?.name || "Profile"}</span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 border-[#e8e1db] dark:border-[#3a322d] bg-white dark:bg-[#2a2420] shadow-md">
                <div className="px-2 py-1.5 text-sm font-medium text-[#6d5c4e] dark:text-[#d4c8be]">
                  {user?.name || "User"}
                  {user?.email && (
                    <p className="text-xs text-[#9c8578] dark:text-[#a39690] mt-0.5 truncate">
                      {user.email}
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-[#e8e1db] dark:bg-[#3a322d]" />
                <DropdownMenuItem 
                  className="text-[#6d5c4e] dark:text-[#d4c8be] focus:bg-[#f1ece8] dark:focus:bg-[#3a322d] cursor-pointer"
                  onClick={() => router.push(getLocalizedPath('/profile'))}
                >
                  <User className="h-4 w-4 mr-2" />
                  {t('myProfile') || "My Profile"}
                </DropdownMenuItem>
                
                 
                <DropdownMenuSeparator className="bg-[#e8e1db] dark:bg-[#3a322d]" />
                <DropdownMenuItem 
                  className="text-red-600 dark:text-red-400 focus:bg-[#f1ece8] dark:focus:bg-[#3a322d] cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('logout') || "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Mobile Search - Only visible on small screens */}
      <div className="md:hidden px-4 py-3 bg-white dark:bg-[#2a2420] border-b border-[#e8e1db] dark:border-[#3a322d]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#9c8578] dark:text-[#a39690]" />
          <Input 
            type="search" 
            placeholder={t('searchItems')}
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 border-[#e8e1db] dark:border-[#3a322d] focus:border-[#bea99a] focus:ring-[#bea99a] bg-[#f1ece8] dark:bg-[#27211d] text-[#6d5c4e] dark:text-[#d4c8be]"
          />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-medium text-[#6d5c4e] dark:text-[#d4c8be] mb-3 sm:mb-0">{t('itemCatalog')}</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
           
            
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full sm:w-[180px] border-[#e8e1db] dark:border-[#3a322d] bg-white dark:bg-[#2a2420] text-[#6d5c4e] dark:text-[#d4c8be]">
                <SelectValue placeholder={t('sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">{t('mostRecent')}</SelectItem>
                <SelectItem value="createdAt">{t('dateCreated')}</SelectItem>
                <SelectItem value="price-asc">{t('priceLowToHigh')}</SelectItem>
                <SelectItem value="price-desc">{t('priceHighToLow')}</SelectItem>
                <SelectItem value="title">{t('alphabetical')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Category filters - removed food and other */}
        <div className="mb-6">
          <Tabs defaultValue={activeCategory} value={activeCategory} onValueChange={handleCategoryChange}>
            <TabsList className="bg-[#f1ece8] dark:bg-[#27211d] border border-[#e8e1db] dark:border-[#3a322d] p-1 w-full overflow-x-auto flex whitespace-nowrap">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#2a2420] data-[state=active]:text-[#6d5c4e] dark:data-[state=active]:text-[#d4c8be] data-[state=active]:shadow text-[#9c8578] dark:text-[#a39690]"
              >
                {t('all')}
              </TabsTrigger>
              <TabsTrigger 
                value="electronics" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#2a2420] data-[state=active]:text-[#6d5c4e] dark:data-[state=active]:text-[#d4c8be] data-[state=active]:shadow text-[#9c8578] dark:text-[#a39690]"
              >
                <Key className="h-4 w-4 mr-2" />
                {t('electronics')}
              </TabsTrigger>
              <TabsTrigger 
                value="clothing" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#2a2420] data-[state=active]:text-[#6d5c4e] dark:data-[state=active]:text-[#d4c8be] data-[state=active]:shadow text-[#9c8578] dark:text-[#a39690]"
              >
                <Shirt className="h-4 w-4 mr-2" />
                {t('clothing')}
              </TabsTrigger>
              <TabsTrigger 
                value="books" 
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#2a2420] data-[state=active]:text-[#6d5c4e] dark:data-[state=active]:text-[#d4c8be] data-[state=active]:shadow text-[#9c8578] dark:text-[#a39690]"
              >
                <Book className="h-4 w-4 mr-2" />
                {t('books')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Items Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#bea99a]"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#2a2420] rounded-lg border border-[#e8e1db] dark:border-[#3a322d]">
            <ShoppingBag className="h-12 w-12 mx-auto text-[#bea99a] dark:text-[#a8968a] mb-4 opacity-60" />
            <h3 className="text-lg font-medium text-[#6d5c4e] dark:text-[#d4c8be] mb-2">{t('noItemsFound')}</h3>
            <p className="text-[#9c8578] dark:text-[#a39690] max-w-md mx-auto">
              {searchQuery ? t('noSearchResults') : t('noCategoryItems')}
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
                className="mt-4 border-[#e8e1db] dark:border-[#3a322d] text-[#6d5c4e] dark:text-[#d4c8be]"
              >
                {t('clearSearch')}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <Card key={item.id} className="bg-white dark:bg-[#2a2420] border-[#e8e1db] dark:border-[#3a322d] overflow-hidden h-full flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-[#f1ece8] dark:bg-[#27211d] rounded-md">
                        {categoryIcons[item.category] || categoryIcons['electronics']}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-medium text-[#6d5c4e] dark:text-[#d4c8be]">
                          {item.title}
                        </CardTitle>
                        <Badge variant="outline" className={`mt-1 ${categoryColors[item.category] || categoryColors['electronics']}`}>
                          {t(item.category) || item.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-[#6d5c4e] dark:text-[#d4c8be]">
                      {formatPrice(item.price)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="py-2 flex-grow">
                  <p className="text-sm text-[#9c8578] dark:text-[#a39690] line-clamp-3">
                    {item.description}
                  </p>
                </CardContent>
                
                <CardFooter className="pt-2 pb-3 text-xs text-[#9c8578] dark:text-[#a39690] border-t border-[#e8e1db] dark:border-[#3a322d]">
                  {t('lastUpdated')}: {formatDate(item.updatedAt)}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {/* Stats Section - removed food and other */}
        <div className="mt-8 bg-white dark:bg-[#2a2420] rounded-lg border border-[#e8e1db] dark:border-[#3a322d] p-4">
          <h3 className="text-lg font-medium text-[#6d5c4e] dark:text-[#d4c8be] mb-4">{t('inventoryStats')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-[#f1ece8] dark:bg-[#27211d] rounded-lg">
              <Key className="h-5 w-5 mx-auto mb-1 text-[#bea99a] dark:text-[#a8968a]" />
              <p className="text-sm text-[#9c8578] dark:text-[#a39690]">{t('electronics')}</p>
              <p className="text-xl font-medium text-[#6d5c4e] dark:text-[#d4c8be]">
                {allItems.filter(i => i.category === 'electronics').length}
              </p>
            </div>
            
            <div className="text-center p-3 bg-[#f1ece8] dark:bg-[#27211d] rounded-lg">
              <Shirt className="h-5 w-5 mx-auto mb-1 text-[#bea99a] dark:text-[#a8968a]" />
              <p className="text-sm text-[#9c8578] dark:text-[#a39690]">{t('clothing')}</p>
              <p className="text-xl font-medium text-[#6d5c4e] dark:text-[#d4c8be]">
                {allItems.filter(i => i.category === 'clothing').length}
              </p>
            </div>
            
            <div className="text-center p-3 bg-[#f1ece8] dark:bg-[#27211d] rounded-lg">
              <Book className="h-5 w-5 mx-auto mb-1 text-[#bea99a] dark:text-[#a8968a]" />
              <p className="text-sm text-[#9c8578] dark:text-[#a39690]">{t('books')}</p>
              <p className="text-xl font-medium text-[#6d5c4e] dark:text-[#d4c8be]">
                {allItems.filter(i => i.category === 'books').length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-[#f1ece8] dark:bg-[#27211d] border-t border-[#e8e1db] dark:border-[#3a322d] py-4 px-6 text-center mt-8">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <div className="text-sm text-[#9c8578] dark:text-[#a39690] mb-2 sm:mb-0">
            © 2025 Krypt. {t('allRightsReserved')}
          </div>
          
       
        </div>
      </footer>
    </main>
  );
}