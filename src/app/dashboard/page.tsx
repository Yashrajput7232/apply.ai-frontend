

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import JobListings from "@/components/dashboard/JobListings";
import AtsResumeTailor from "@/components/dashboard/AtsResumeTailor";


export default function Dashboard() {

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
           <Card>
              <CardHeader>
                 <CardTitle>Tailor Your Resume</CardTitle>
                 <CardDescription>Select your resume and provide a job description to optimize with AI.</CardDescription>
              </CardHeader>
              <CardContent>
                  <AtsResumeTailor />
              </CardContent>
           </Card>

        </div>

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
