
'use client';

import Link from 'next/link';
import { Briefcase, LayoutDashboard } from 'lucide-react'; // Removed LogIn, LogOut
import { Button } from '@/components/ui/button';
// Removed useSession, signIn, signOut imports
// Removed Avatar and DropdownMenu imports

export default function Header() {
  // Removed session and status hooks

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
          {/* Link to Dashboard */}
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
               <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>

          {/* Removed Auth Buttons / User Menu */}
        </nav>
      </div>
    </header>
  );
}
