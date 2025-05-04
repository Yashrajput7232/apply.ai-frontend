
'use client';

import { useState, useEffect, ChangeEvent } from 'react'; // Added ChangeEvent
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Wand2, Download, ClipboardCopy, AlertCircle, FileText, Trash2 } from 'lucide-react'; // Added FileText, Trash2
import { useToast } from "@/hooks/use-toast";
import { atsResumeTailor, type AtsResumeTailorInput, type AtsResumeTailorOutput } from '@/ai/flows/ats-resume-tailor';
import { scrapeJobDescription, type JobDescription } from '@/services/job-scraper';

// Helper function to read file as Data URI
function readFileAsDataURI(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Removed AtsResumeTailorProps interface
// interface AtsResumeTailorProps {
//     selectedResumeFile: File | null;
// }

export default function AtsResumeTailor(/* Removed selectedResumeFile prop: { selectedResumeFile }: AtsResumeTailorProps */) {
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null); // Added state for selected file
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [tailoredResume, setTailoredResume] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

 // Clear tailored resume if the selected file changes or job description is cleared
 useEffect(() => {
    setTailoredResume(null);
 }, [selectedResumeFile, jobDescription]);

 // Handler for file input changes (moved from ResumeUpload)
 const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setSelectedResumeFile(file);
        toast({
          title: "Resume Selected",
          description: `${file.name}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a PDF or DOCX file.",
        });
        setSelectedResumeFile(null);
        event.target.value = ''; // Clear the input
      }
    } else {
      setSelectedResumeFile(null);
      event.target.value = '';
    }
  };

  // Handler for removing the selected file (moved from ResumeUpload)
  const handleRemoveFile = () => {
    setSelectedResumeFile(null);
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
    toast({
      title: "File Removed",
      description: "Selection cleared.",
    });
  };


  const handleScrapeJob = async () => {
    if (!jobUrl) {
      toast({ variant: "destructive", title: "Please enter a Job URL." });
      return;
    }
    setIsScraping(true);
    setError(null);
    try {
      // NOTE: scrapeJobDescription is a mock/placeholder
      // In a real app, this might be a server action or API route
      const result: JobDescription = await scrapeJobDescription(jobUrl);
      setJobDescription(result.description);
       toast({ title: "Job description scraped successfully." });
    } catch (err) {
      console.error("Error scraping job description:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during scraping.";
      setError(`Failed to scrape job description: ${errorMessage}`);
      toast({ variant: "destructive", title: "Scraping Error", description: errorMessage });
    } finally {
      setIsScraping(false);
    }
  };


  const handleTailorResume = async () => {
    if (!selectedResumeFile) {
      toast({ variant: "destructive", title: "Please select a resume file first." });
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
       // Convert the selected file to a data URI
      const resumeDataUri = await readFileAsDataURI(selectedResumeFile);

      // Basic check in case file reading fails silently
      if (!resumeDataUri) {
           throw new Error("Could not read resume file.");
      }
       // Add stronger validation
      if (!resumeDataUri.startsWith('data:') || !resumeDataUri.includes(';base64,')) {
          throw new Error("Invalid data URI format generated from file.");
      }
       // Remove potential metadata/charset before base64 part for the AI
      const base64Data = resumeDataUri.substring(resumeDataUri.indexOf(',') + 1);
      const mimeType = resumeDataUri.substring(resumeDataUri.indexOf(':') + 1, resumeDataUri.indexOf(';'));
      const cleanDataUri = `data:${mimeType};base64,${base64Data}`;


      const input: AtsResumeTailorInput = {
        resumeDataUri: cleanDataUri, // Use the cleaned data URI
        jobDescription: jobDescription,
      };

      console.log("Calling AI Tailor with input:", {jobDescriptionLength: jobDescription.length, resumeUriStart: cleanDataUri.substring(0, 80) + '...'});

      const result: AtsResumeTailorOutput = await atsResumeTailor(input); // Calls the server action/flow

      console.log("AI Tailor Result:", {tailoredResumeLength: result.tailoredResume.length});


      setTailoredResume(result.tailoredResume);
      toast({ title: "Resume tailored successfully!" });

    } catch (err: any) {
      console.error("Error tailoring resume:", err);
      // Check for specific Genkit/API error structure if possible
      const detail = err.errorDetails?.[0]?.fieldViolations?.[0]?.description || err.message || "An unexpected error occurred.";
      const errorMessage = `Failed to tailor resume: ${detail}`;
      setError(errorMessage);
      toast({ variant: "destructive", title: "Tailoring Error", description: detail, duration: 10000 }); // Longer duration for errors
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
    if (tailoredResume && selectedResumeFile) {
      // Simple text download.
      const blob = new Blob([tailoredResume], { type: 'text/plain;charset=utf-8' }); // Ensure UTF-8
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Create filename based on original, e.g., My_Resume_v1_tailored.txt
      const originalName = selectedResumeFile.name.replace(/\.(pdf|docx)$/i, '');
      a.download = `${originalName}_tailored.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
       toast({ title: "Download Started", description:"Tailored resume downloaded as text file." });
    }
  };

  return (
    <div className="space-y-6">
        {/* Resume Selection Input (Moved from ResumeUpload) */}
         <div className="space-y-2">
             <Label htmlFor="resume-upload">Select Your Resume</Label>
             <Input
                id="resume-upload"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="file:text-primary file:font-medium"
                disabled={isLoading || isScraping}
             />
             {selectedResumeFile && (
                <div className="mt-2 p-3 border rounded-md bg-secondary/50 flex justify-between items-center">
                    <div className="flex items-center space-x-2 text-sm overflow-hidden">
                        <FileText className="h-4 w-4 text-secondary-foreground flex-shrink-0" />
                        <span className="font-medium text-secondary-foreground truncate">{selectedResumeFile.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleRemoveFile} disabled={isLoading || isScraping}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Remove file</span>
                    </Button>
                </div>
             )}
             <p className="text-xs text-muted-foreground">
                Upload your resume (PDF or DOCX) to tailor it for a job.
             </p>
         </div>

      {/* Job Description Input */}
      <div className="space-y-2">
         <Label htmlFor="job-url">Job Posting URL (Optional)</Label>
         <div className="flex flex-wrap sm:flex-nowrap gap-2"> {/* Allow wrap on small screens */}
            <Input
                id="job-url"
                placeholder="https://www.linkedin.com/jobs/view/..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                disabled={isLoading || isScraping}
                className="flex-grow min-w-[150px]" // Ensure input takes space
            />
            <Button onClick={handleScrapeJob} disabled={isLoading || isScraping || !jobUrl} className="flex-shrink-0"> {/* Prevent button shrinking */}
                {isScraping ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isScraping ? 'Scraping...' : 'Scrape Job'}
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
            rows={10}
            className="min-h-[150px] resize-y" // Allow vertical resize
            disabled={isLoading || isScraping}
          />
       </div>


      {/* Action Button */}
      <Button
        onClick={handleTailorResume}
        disabled={isLoading || isScraping || !selectedResumeFile || !jobDescription.trim()}
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
           <div className="flex flex-wrap justify-between items-center gap-2"> {/* Allow wrapping */}
             <h3 className="text-lg font-semibold">Tailored Resume Preview</h3>
              <div className="flex gap-2 flex-shrink-0"> {/* Prevent shrinking */}
                 <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                    <ClipboardCopy className="mr-1 sm:mr-2 h-4 w-4" /> Copy
                 </Button>
                 <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="mr-1 sm:mr-2 h-4 w-4" /> Download
                 </Button>
              </div>
           </div>

          <ScrollArea className="h-72 w-full rounded-md border p-4 bg-muted/50">
            {/* Use pre-wrap for line breaks and whitespace, overflow-x-auto for long lines */}
            <pre className="text-sm whitespace-pre-wrap break-words">{tailoredResume}</pre>
          </ScrollArea>
            <p className="text-xs text-muted-foreground">Note: Download provides a text file. Copy/paste this into your original document or a new one.</p>
        </div>
      )}
    </div>
  );
}
