
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
  const [userEmail, setUserEmail] = useState<string | null>(null); // Added state for email
  const [userPicture, setUserPicture] = useState<string | null>(null); // Added state for picture
  const router = useRouter();

  useEffect(() => {
    // Check for auth token cookie client-side after hydration
    const token = Cookies.get('auth_token');
    if (token) {
      setIsLoggedIn(true);
      // Attempt to parse token or fetch user info if needed
      // For simplicity, let's assume the token contains basic info or we get it elsewhere
      // Example: Decode JWT (requires a library like jwt-decode)
      try {
         // const decoded = jwtDecode(token); // Install and import jwt-decode if using
         // setUserEmail(decoded.email);
         // setUserPicture(decoded.picture);
         // Placeholder if token isn't JWT or doesn't have info
         setUserEmail("Logged In"); // Default message
      } catch (error) {
        console.error("Failed to decode token:", error);
        setUserEmail("Logged In"); // Fallback
      }

    } else {
      setIsLoggedIn(false);
      setUserEmail(null);
      setUserPicture(null);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  const handleLogout = () => {
    Cookies.remove('auth_token', { path: '/' }); // Clear the cookie
    setIsLoggedIn(false); // Update state
    setUserEmail(null);
    setUserPicture(null);
    router.push('/'); // Redirect to landing page
    // No need to refresh, state update will re-render
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between"> {/* Increased height slightly */}
        {/* Branding (Logo + Name + Creator) */}
        <Link href="/" className="flex items-center space-x-2">
           <Briefcase className="h-6 w-6 text-primary flex-shrink-0" />
           <div className="flex flex-col">
             <span className="font-bold sm:inline-block">
               Apply.ai
             </span>
             <span className="text-xs text-muted-foreground -mt-1">
                by Yash Rajput
             </span>
           </div>
        </Link>

        {/* Navigation/Actions (Login or Profile) */}
        {isLoggedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full"> {/* Adjusted size */}
                <Avatar className="h-9 w-9"> {/* Adjusted size */}
                  <AvatarImage src={userPicture || ""} alt="User profile" />
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
                  <p className="text-xs leading-none text-muted-foreground break-all">
                    {userEmail || 'Loading...'} {/* Display email */}
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
