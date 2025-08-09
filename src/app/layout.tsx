import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Changed font to Inter for professionalism
import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer'; // Import Footer
import { Toaster } from "@/components/ui/toaster";


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
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased flex flex-col', // Added flex flex-col
          inter.variable
        )}
      >
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
      </body>
    </html>
  );
}
