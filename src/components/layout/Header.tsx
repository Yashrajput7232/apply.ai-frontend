
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Briefcase, User, LogOut } from 'lucide-react';
import LoginWithGoogle from "@/components/ui/google-login";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for auth token cookie client-side after hydration
    const token = Cookies.get('auth_token');
    if (token) {
      setIsLoggedIn(true);
      // Optionally decode token here to get user info if needed
    } else {
      setIsLoggedIn(false);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  const handleLogout = () => {
    Cookies.remove('auth_token', { path: '/' }); // Clear the cookie
    setIsLoggedIn(false); // Update state
    router.push('/'); // Redirect to landing page
    router.refresh(); // Refresh page to ensure server state is cleared
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Branding (Logo + Name) */}
        <Link href="/" className="flex items-center space-x-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">
            Apply.ai
          </span>
        </Link>

        {/* Navigation/Actions (Login or Profile) */}
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {/* Placeholder image/fallback - Replace with user.picture if available */}
                  <AvatarImage src="" alt="User profile" />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">My Account</p>
                  {/* Placeholder - Replace with user.email if available */}
                  <p className="text-xs leading-none text-muted-foreground">
                    Logged In
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Optional Profile Link */}
              {/* <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem> */}
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <LoginWithGoogle size="sm" />
        )}
      </div>
    </header>
  );
}
