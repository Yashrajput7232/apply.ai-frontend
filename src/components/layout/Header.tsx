
'use client';

import Link from 'next/link';
import { Briefcase, LayoutDashboard, LogIn, LogOut } from 'lucide-react'; // Added icons
import { Button } from '@/components/ui/button';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between"> {/* Use justify-between */}
        {/* Branding */}
        <Link href="/" className="flex items-center space-x-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">
            Apply.ai
          </span>
        </Link>

        {/* Navigation/Actions */}
        <nav className="flex items-center space-x-4">
          {/* Link to Dashboard (always visible, access controlled on page) */}
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
               <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>

          {/* Auth Buttons / User Menu */}
          {isLoading ? (
            <Button variant="outline" size="sm" disabled>Loading...</Button>
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                   <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image ?? undefined} alt={session.user?.name ?? "User"} />
                      <AvatarFallback>{session.user?.name?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
                    </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Add other menu items like settings, profile if needed */}
                {/* <DropdownMenuItem>Profile</DropdownMenuItem> */}
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" onClick={() => signIn('google', { callbackUrl: '/dashboard' })}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
