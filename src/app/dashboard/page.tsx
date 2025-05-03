
'use client'; // Add 'use client' because we are using useState

import { useState } from 'react'; // Import useState
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import ResumeUpload from "@/components/dashboard/ResumeUpload";
import JobListings from "@/components/dashboard/JobListings";
import AtsResumeTailor from "@/components/dashboard/AtsResumeTailor";

export default function Dashboard() {
  // State for the currently selected/uploaded resume file
  const [resumeFile, setResumeFile] = useState<File | null>(null);

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
