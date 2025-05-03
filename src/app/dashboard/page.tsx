
'use client'; // Add 'use client' because we are using hooks

import { useState, useEffect } from 'react'; // Import useState and useEffect
import { useSession, signIn } from 'next-auth/react'; // Import next-auth hooks
import { useRouter } from 'next/navigation'; // Import for redirection
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import ResumeUpload from "@/components/dashboard/ResumeUpload";
import JobListings from "@/components/dashboard/JobListings";
import AtsResumeTailor from "@/components/dashboard/AtsResumeTailor";
import { Loader2 } from 'lucide-react'; // For loading state

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    // If status is not loading and there's no session, redirect or prompt sign-in
    if (status === 'unauthenticated') {
      // Option 1: Redirect to landing page
       router.push('/');
      // Option 2: Directly trigger sign-in modal
      // signIn('google');
    }
  }, [status, router]);

  // Show loading state while session status is being determined
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-theme(spacing.14))]"> {/* Adjust height based on header */}
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Only render the dashboard content if authenticated
  if (status === 'authenticated') {
    return (
      <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6 text-foreground">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column / Top on Mobile */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Resume</CardTitle>
                <CardDescription>Select your latest resume (PDF or DOCX) to tailor.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Pass state and setter to ResumeUpload */}
                <ResumeUpload selectedFile={resumeFile} setSelectedFile={setResumeFile} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tailor Your Resume</CardTitle>
                <CardDescription>Optimize your selected resume for a specific job using AI.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Pass the selected file to AtsResumeTailor */}
                <AtsResumeTailor selectedResumeFile={resumeFile} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column / Bottom on Mobile */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Job Listings</CardTitle>
                <CardDescription>Browse job opportunities scraped from various platforms.</CardDescription>
              </CardHeader>
              <CardContent>
                <JobListings />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Optional: Render a fallback or null if unauthenticated (though useEffect redirects)
  return null; // Or a message like <p>Redirecting...</p>
}
