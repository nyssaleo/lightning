import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import WebLNStatus from '@/components/WebLNStatus';
import { Link } from 'wouter';
import { SupportedCurrency } from '@/lib/currencyConverter';
import { Bitcoin, Sun, Moon, Home, BarChart4, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Header: React.FC = () => {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { currency, setCurrency } = useCurrency();
  
  const currencyOptions: SupportedCurrency[] = ['USD', 'EUR', 'JPY', 'GBP', 'CAD', 'AUD'];
  
  return (
    <header className="py-4 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Bitcoin className="h-8 w-8 text-bitcoin-orange" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Lightning<span className="text-bitcoin-orange">App</span>
              </span>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Currency Selector */}
          <div>
            <Select 
              value={currency} 
              onValueChange={(value) => setCurrency(value as SupportedCurrency)}
            >
              <SelectTrigger className="h-9 w-[70px]">
                <SelectValue placeholder="USD" />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((curr) => (
                  <SelectItem key={curr} value={curr}>
                    {curr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Theme Toggle */}
          <Button 
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          
          {/* Navigation */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className="h-9 w-9"
              >
                <BarChart4 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/">
                  <div className="flex items-center cursor-pointer">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard">
                  <div className="flex items-center cursor-pointer">
                    <BarChart4 className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center cursor-pointer"
                onClick={() => window.open('https://webln.dev', '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>WebLN Docs</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* WebLN Status */}
          <div className="ml-1">
            <WebLNStatus iconOnly={true} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;