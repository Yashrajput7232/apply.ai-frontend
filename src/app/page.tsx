
'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Briefcase, Target, Mail, FileText } from 'lucide-react';
import LoginWithGoogle from "@/components/ui/google-login";

export default function LandingPage() {

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden"> {/* Prevent horizontal scroll */}
      {/* Hero Section - Added animated-gradient-bg class, removed flex-grow */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-16 relative overflow-hidden animated-gradient-bg">
        {/* Content Container with z-index to stay above background */}
        <div className="relative z-10">
            {/* Animated Briefcase Icon */}
            <Briefcase className="h-16 w-16 text-primary mb-4 animate-in fade-in zoom-in duration-500 mx-auto" />
            {/* Animated Heading */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
              Welcome to Apply.ai
            </h1>
            {/* Animated Paragraph */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
              Your AI-powered assistant for navigating the job market. Tailor your resume, find relevant job openings, and craft outreach emails effortlessly.
            </p>
            {/* Animated Button Container */}
            <div className="relative group inline-block animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
              {/* Go to Dashboard Button - Visible by default, hidden on hover */}
              <Link href="/dashboard" className="block group-hover:hidden">
                  <Button size="lg" className="transition-transform duration-200 ease-in-out hover:scale-105">
                      Go to Dashboard
                  </Button>
              </Link>
              {/* Login With Google Button - Hidden by default, visible on hover */}
              <div className="hidden group-hover:block">
                 {/* Ensure text color remains foreground on hover within the group */}
                 <LoginWithGoogle size="lg" className="text-foreground transition-transform duration-200 ease-in-out hover:scale-105" />
              </div>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Animated Feature Card 1 */}
            <Card className="text-center shadow-md hover:shadow-lg transition-shadow animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
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
            {/* Animated Feature Card 2 */}
            <Card className="text-center shadow-md hover:shadow-lg transition-shadow animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
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
            {/* Animated Feature Card 3 */}
             <Card className="text-center shadow-md hover:shadow-lg transition-shadow animate-in fade-in slide-in-from-bottom-10 duration-700 delay-400">
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

      {/* Call to Action Section */}
      <section className="py-12 bg-secondary/50">
        <div className="container mx-auto text-center px-4 animate-in fade-in duration-700 delay-500">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            Ready to boost your job search?
          </h2>
           {/* Animated Button Container */}
            <div className="relative group inline-block">
              {/* Access Dashboard Button - Visible by default, hidden on hover */}
              <Link href="/dashboard" className="block group-hover:hidden">
                  <Button variant="default" size="lg" className="transition-transform duration-200 ease-in-out hover:scale-105">
                      Access Your Dashboard
                  </Button>
              </Link>
              {/* Login With Google Button - Hidden by default, visible on hover */}
              <div className="hidden group-hover:block">
                  {/* Ensure group-hover doesn't conflict with parent group, explicitly set text color */}
                  <LoginWithGoogle size="lg" className="text-foreground transition-transform duration-200 ease-in-out hover:scale-105" />
              </div>
            </div>
        </div>
      </section>
    </div>
  );
}
