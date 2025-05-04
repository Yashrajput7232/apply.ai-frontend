
'use client';

import Link from 'next/link';
import { Briefcase } from 'lucide-react'; // Removed LayoutDashboard, LogIn, LogOut
import LoginWithGoogle from "@/components/ui/google-login"; // Import LoginWithGoogle

export default function Header() {

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Use justify-between to push items to opposite ends */}
      <div className="container flex h-14 items-center justify-between">
        {/* Branding */}
        <Link href="/" className="flex items-center space-x-2">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block">
            Apply.ai
          </span>
        </Link>

        {/* Navigation/Actions */}
         {/* Add Login Button */}
         <LoginWithGoogle size="sm" />

      </div>
    </header>
  );
}

