
'use client'; // Need client component for hooks and actions

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Briefcase, Target, Mail, FileText, LogIn } from 'lucide-react';
import { useSession, signIn } from 'next-auth/react'; // Import next-auth hooks

export default function LandingPage() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-grow flex flex-col items-center justify-center text-center px-4 py-16 bg-gradient-to-b from-background to-secondary/30">
        <Briefcase className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
          Welcome to Apply.ai
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
          Your AI-powered assistant for navigating the job market. Tailor your resume, find relevant job openings, and craft outreach emails effortlessly.
        </p>
        {!isLoading && !session && (
          <Button size="lg" onClick={() => signIn('google', { callbackUrl: '/dashboard' })}>
            <LogIn className="mr-2 h-5 w-5" /> Sign In with Google to Get Started
          </Button>
        )}
        {!isLoading && session && (
          <Link href="/dashboard">
            <Button size="lg">
              Go to Dashboard
            </Button>
          </Link>
        )}
         {isLoading && (
            <Button size="lg" disabled>
                Loading...
            </Button>
         )}
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>ATS Resume Tailoring</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Optimize your resume for specific job descriptions using AI to beat Applicant Tracking Systems.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                   <FileText className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>Job Aggregation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Browse relevant job listings scraped from various platforms, all in one place. (Coming Soon!)
                </CardDescription>
              </CardContent>
            </Card>
             <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
               <CardHeader>
                 <div className="flex justify-center mb-4">
                    <Mail className="h-10 w-10 text-primary" />
                 </div>
                 <CardTitle>AI-Powered Outreach</CardTitle>
               </CardHeader>
               <CardContent>
                 <CardDescription>
                   Generate personalized outreach emails or referral requests with the help of AI. (Coming Soon!)
                 </CardDescription>
               </CardContent>
             </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <section className="py-12 bg-secondary/50">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            Ready to boost your job search?
          </h2>
          {!isLoading && !session && (
            <Button variant="default" size="lg" onClick={() => signIn('google', { callbackUrl: '/dashboard' })}>
               <LogIn className="mr-2 h-5 w-5" /> Sign In to Access Dashboard
            </Button>
          )}
          {!isLoading && session && (
             <Link href="/dashboard">
                <Button variant="default" size="lg">
                    Access Your Dashboard
                </Button>
             </Link>
          )}
           {isLoading && (
            <Button variant="default" size="lg" disabled>
                Loading...
            </Button>
           )}
        </div>
      </section>
    </div>
  );
}
