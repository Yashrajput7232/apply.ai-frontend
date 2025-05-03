'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Use Textarea for job description
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Wand2, Download, ClipboardCopy, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { atsResumeTailor, type AtsResumeTailorInput, type AtsResumeTailorOutput } from '@/ai/flows/ats-resume-tailor'; // Assuming AI flow is in this path
import { scrapeJobDescription, type JobDescription } from '@/services/job-scraper'; // Import scraper


// Helper function to read file as Data URI
function readFileAsDataURI(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Mock function to get uploaded resumes (replace with actual fetch)
async function getUploadedResumes(): Promise<{ id: string, name: string }[]> {
  // In a real app, fetch this list from Firebase Storage/Firestore
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate fetch
  return [
    { id: 'resume_1', name: 'My_Resume_v1.pdf' },
    { id: 'resume_2', name: 'Software_Engineer_Resume.docx' },
  ];
}

export default function AtsResumeTailor() {
  const [uploadedResumes, setUploadedResumes] = useState<{ id: string, name: string }[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [tailoredResume, setTailoredResume] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

 useEffect(() => {
    // Fetch uploaded resumes on component mount
    const fetchResumes = async () => {
      // In a real app, you might need authentication context here
      const resumes = await getUploadedResumes();
      setUploadedResumes(resumes);
      // Optionally pre-select the first resume
      // if (resumes.length > 0) {
      //   setSelectedResumeId(resumes[0].id);
      // }
    };
    fetchResumes();
  }, []);


  const handleScrapeJob = async () => {
    if (!jobUrl) {
      toast({ variant: "destructive", title: "Please enter a Job URL." });
      return;
    }
    setIsScraping(true);
    setError(null);
    try {
      const result: JobDescription = await scrapeJobDescription(jobUrl); // Use the imported function
      setJobDescription(result.description);
       toast({ title: "Job description scraped successfully." });
    } catch (err) {
      console.error("Error scraping job description:", err);
      setError("Failed to scrape job description. Please check the URL or try again later.");
      toast({ variant: "destructive", title: "Scraping Error", description: "Could not fetch job description." });
    } finally {
      setIsScraping(false);
    }
  };


  const handleTailorResume = async () => {
    if (!selectedResumeId) {
      toast({ variant: "destructive", title: "Please select a resume." });
      return;
    }
    if (!jobDescription.trim()) {
      toast({ variant: "destructive", title: "Please provide a job description or scrape one." });
      return;
    }

    setIsLoading(true);
    setError(null);
    setTailoredResume(null); // Clear previous result

    try {
      // TODO: This part needs refinement. We need the *actual file content* as a data URI,
      // not just the ID. In a real app:
      // 1. Fetch the file URL from Firebase Storage using the selectedResumeId.
      // 2. Download the file blob.
      // 3. Convert the blob to a data URI using readFileAsDataURI or similar.

      // *** Placeholder: Using a fake data URI ***
      // Find the selected resume name to get a fake MIME type
      const selectedResume = uploadedResumes.find(r => r.id === selectedResumeId);
      const fakeMimeType = selectedResume?.name.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const fakeBase64 = 'FAKE_BASE64_ENCODED_CONTENT'; // Replace with actual content conversion
      const resumeDataUri = `data:${fakeMimeType};base64,${fakeBase64}`;
       // *** End Placeholder ***

      if (!resumeDataUri) {
        throw new Error("Could not retrieve resume data."); // Handle error if resume fetch fails
      }

      const input: AtsResumeTailorInput = {
        resumeDataUri: resumeDataUri, // Use the actual or placeholder data URI
        jobDescription: jobDescription,
      };

      console.log("Calling AI Tailor with input:", {jobDescriptionLength: jobDescription.length, resumeUriStart: resumeDataUri.substring(0, 50)});

      const result: AtsResumeTailorOutput = await atsResumeTailor(input);

      console.log("AI Tailor Result:", {tailoredResumeLength: result.tailoredResume.length});


      setTailoredResume(result.tailoredResume);
      toast({ title: "Resume tailored successfully!" });

    } catch (err: any) {
      console.error("Error tailoring resume:", err);
      const errorMessage = err.message || "An unexpected error occurred.";
      setError(`Failed to tailor resume: ${errorMessage}`);
      toast({ variant: "destructive", title: "Tailoring Error", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (tailoredResume) {
      navigator.clipboard.writeText(tailoredResume)
        .then(() => {
          toast({ title: "Copied to clipboard!" });
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy text to clipboard." });
        });
    }
  };

  const handleDownload = () => {
    if (tailoredResume) {
      // Simple text download. For PDF/DOCX, a backend conversion would be needed.
      const blob = new Blob([tailoredResume], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tailored_resume_${selectedResumeId}.txt`; // Suggest a filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
       toast({ title: "Download Started", description:"Tailored resume downloaded as text file." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Resume Selection */}
      <div className="space-y-2">
        <Label htmlFor="resume-select">Select Resume to Tailor</Label>
         <Select
            value={selectedResumeId ?? ""}
            onValueChange={(value) => setSelectedResumeId(value)}
            disabled={isLoading || isScraping}
        >
            <SelectTrigger id="resume-select" className="w-full">
            <SelectValue placeholder="Choose your uploaded resume" />
            </SelectTrigger>
            <SelectContent>
            {uploadedResumes.length > 0 ? (
                uploadedResumes.map((resume) => (
                <SelectItem key={resume.id} value={resume.id}>
                    {resume.name}
                </SelectItem>
                ))
            ) : (
                <SelectItem value="no-resumes" disabled>No resumes uploaded yet</SelectItem>
            )}
            </SelectContent>
        </Select>
      </div>

      {/* Job Description Input */}
      <div className="space-y-2">
         <Label htmlFor="job-url">Job Posting URL (Optional)</Label>
         <div className="flex gap-2">
            <Input
                id="job-url"
                placeholder="https://www.linkedin.com/jobs/view/..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                disabled={isLoading || isScraping}
            />
            <Button onClick={handleScrapeJob} disabled={isLoading || isScraping || !jobUrl}>
                {isScraping ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Scrape Job
            </Button>
         </div>
      </div>
       <div className="space-y-2">
          <Label htmlFor="job-description">Job Description</Label>
          <Textarea
            id="job-description"
            placeholder="Paste the full job description here, or scrape it using the URL above."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10} // Make it reasonably tall
            className="min-h-[150px]"
            disabled={isLoading || isScraping}
          />
       </div>


      {/* Action Button */}
      <Button
        onClick={handleTailorResume}
        disabled={isLoading || isScraping || !selectedResumeId || !jobDescription.trim()}
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="mr-2 h-4 w-4" />
        )}
        {isLoading ? 'Tailoring...' : 'Tailor Resume with AI'}
      </Button>

      {/* Error Display */}
       {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}


      {/* Tailored Resume Output */}
      {tailoredResume && (
        <div className="space-y-4 pt-4 border-t">
           <div className="flex justify-between items-center">
             <h3 className="text-lg font-semibold">Tailored Resume Preview</h3>
              <div className="flex gap-2">
                 <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                    <ClipboardCopy className="mr-2 h-4 w-4" /> Copy
                 </Button>
                 <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" /> Download
                 </Button>
              </div>
           </div>

          <ScrollArea className="h-72 w-full rounded-md border p-4 bg-muted/50">
            <pre className="text-sm whitespace-pre-wrap">{tailoredResume}</pre>
          </ScrollArea>
            <p className="text-xs text-muted-foreground">Note: Download provides a text file. For formatted documents, further processing might be needed.</p>
        </div>
      )}
    </div>
  );
}
