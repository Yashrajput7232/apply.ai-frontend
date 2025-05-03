
import Link from 'next/link';
import { Briefcase, LayoutDashboard } from 'lucide-react'; // Added icons
import { Button } from '@/components/ui/button';

export default function Header() {
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
          {/* Example: Add other links here if needed */}
          {/* <Link href="/features"><Button variant="ghost">Features</Button></Link> */}

          {/* Link to Dashboard */}
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
               <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>

          {/* Placeholder for Login/User Menu */}
          {/* <Button variant="default" size="sm">Login</Button> */}
        </nav>
      </div>
    </header>
  );
}
