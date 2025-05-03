
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed font to Inter for professionalism
import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import SessionProviderWrapper from '@/components/auth/SessionProviderWrapper'; // Import the wrapper

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Use --font-sans for ShadCN compatibility
});

export const metadata: Metadata = {
  title: 'Apply.ai - AI-Powered Job Application Assistant',
  description: 'Tailor your resume and find jobs with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> {/* Added suppressHydrationWarning */}
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        {/* Wrap everything inside SessionProviderWrapper */}
        <SessionProviderWrapper>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            {/* Optional Footer can be added here */}
          </div>
          <Toaster /> {/* Add Toaster component here */}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
