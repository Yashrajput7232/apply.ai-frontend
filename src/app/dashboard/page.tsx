

// Removed 'use client' and related hooks (useState, useEffect, useSession, useRouter, signIn)

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import ResumeUpload from "@/components/dashboard/ResumeUpload";
import JobListings from "@/components/dashboard/JobListings";
import AtsResumeTailor from "@/components/dashboard/AtsResumeTailor";
// Removed Loader2 import

export default function Dashboard() {
  // Removed session and status related code
  // Removed resumeFile state as it's managed within AtsResumeTailor now if needed, or passed differently.
  // Consider if resume upload state needs to be handled differently without client hooks here.
  // For now, assuming ResumeUpload and AtsResumeTailor manage their state internally or props are passed directly.


  // Render the dashboard content directly
  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column / Top on Mobile */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card for Upload and Tailor are combined for simplicity, or manage state differently */}
           <Card>
              <CardHeader>
                 <CardTitle>Tailor Your Resume</CardTitle>
                 <CardDescription>Select your resume and provide a job description to optimize with AI.</CardDescription>
              </CardHeader>
              <CardContent>
                  {/* Pass necessary props or let AtsResumeTailor handle selection internally */}
                  {/* If ResumeUpload is needed separately, it must become a client component */}
                  {/* <ResumeUpload selectedFile={...} setSelectedFile={...} /> */}
                  <AtsResumeTailor />
              </CardContent>
           </Card>

          {/* Removed separate ResumeUpload card - integrated into AtsResumeTailor or needs client wrapper */}
          {/* Removed separate AtsResumeTailor card - Now combined or needs restructure */}
        </div>

        {/* Right Column / Bottom on Mobile */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Job Listings</CardTitle>
              <CardDescription>Browse job opportunities scraped from various platforms.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* JobListings might need to become a client component if it uses hooks */}
              <JobListings />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
