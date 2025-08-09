
'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Wand2, Download, ClipboardCopy, AlertCircle, FileText, Trash2, FileType, Code } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Switch } from '@/components/ui/switch';

// This component no longer uses the Genkit flow or the local job scraper service.
// It directly calls the external APIs provided.

export default function AtsResumeTailor() {
  const [inputType, setInputType] = useState<'file' | 'latex'>('file');
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);
  const [latexCode, setLatexCode] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tailoredResumePdf, setTailoredResumePdf] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setTailoredResumePdf(null);
  }, [selectedResumeFile, jobDescription, latexCode, inputType]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Allow only PDF files for the new flow
      if (file.type === 'application/pdf') {
        setSelectedResumeFile(file);
        toast({
          title: "Resume PDF Selected",
          description: `${file.name}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a PDF file.",
        });
        setSelectedResumeFile(null);
        event.target.value = '';
      }
    } else {
      setSelectedResumeFile(null);
      event.target.value = '';
    }
  };

  const handleRemoveFile = () => {
    setSelectedResumeFile(null);
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
    toast({
      title: "File Removed",
      description: "Selection cleared.",
    });
  };

  const handleTailorResume = async () => {
    if (inputType === 'file' && !selectedResumeFile) {
      toast({ variant: "destructive", title: "Please select a resume PDF file." });
      return;
    }
    if (inputType === 'latex' && !latexCode.trim()) {
      toast({ variant: "destructive", title: "Please paste your LaTeX code." });
      return;
    }
    if (!jobDescription.trim()) {
      toast({ variant: "destructive", title: "Please provide a job description." });
      return;
    }

    setIsLoading(true);
    setError(null);
    setTailoredResumePdf(null);

    try {
      let resumeContent: string;

      if (inputType === 'file' && selectedResumeFile) {
        // Step 1: Extract text from PDF
        toast({ title: "Extracting text from PDF..." });
        const formData = new FormData();
        formData.append('file', selectedResumeFile);

        const extractResponse = await fetch("https://latex-pdf-compiler.onrender.com/extract-text", {
            method: 'POST',
            body: formData,
        });

        if (!extractResponse.ok) {
            const errorData = await extractResponse.json();
            throw new Error(errorData.detail || 'Failed to extract text from PDF.');
        }
        const extractedData = await extractResponse.json();
        resumeContent = extractedData.text;
        toast({ title: "Text extracted, now tailoring..." });

      } else {
        resumeContent = latexCode;
      }

      // Step 2: Generate Tailored Resume
      const payload = {
        job_description: jobDescription,
        resume: resumeContent,
      };

      const tailorResponse = await fetch("https://resumetailor-0b6a.onrender.com/generate_tailored_resume", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!tailorResponse.ok || tailorResponse.headers.get('content-type') !== 'application/pdf') {
        const errorData = await tailorResponse.json();
        throw new Error(errorData.detail || 'Failed to generate tailored resume.');
      }

      const pdfBlob = await tailorResponse.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setTailoredResumePdf(pdfUrl);
      toast({ title: "Resume tailored successfully!" });

    } catch (err: any) {
      console.error("Error in tailoring process:", err);
      const errorMessage = `Failed to tailor resume: ${err.message}`;
      setError(errorMessage);
      toast({ variant: "destructive", title: "Tailoring Error", description: err.message, duration: 10000 });
    } finally {
      setIsLoading(false);
    }
  };


  const handleDownload = () => {
    if (tailoredResumePdf) {
      const a = document.createElement('a');
      a.href = tailoredResumePdf;
      a.download = `tailored_resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // No need to revoke, as it might be needed for the iframe src
      toast({ title: "Download Started" });
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center space-x-3">
            <Label htmlFor="input-type-switch">Upload File</Label>
            <Switch
                id="input-type-switch"
                checked={inputType === 'latex'}
                onCheckedChange={(checked) => setInputType(checked ? 'latex' : 'file')}
                aria-label="Toggle between file upload and LaTeX input"
            />
            <Label htmlFor="input-type-switch">Use LaTeX</Label>
        </div>

        {inputType === 'file' ? (
             <div className="space-y-2">
                 <Label htmlFor="resume-upload">Select Your Resume (PDF)</Label>
                 <Input
                    id="resume-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="file:text-primary file:font-medium"
                    disabled={isLoading}
                 />
                 {selectedResumeFile && (
                    <div className="mt-2 p-3 border rounded-md bg-secondary/50 flex justify-between items-center">
                        <div className="flex items-center space-x-2 text-sm overflow-hidden">
                            <FileText className="h-4 w-4 text-secondary-foreground flex-shrink-0" />
                            <span className="font-medium text-secondary-foreground truncate">{selectedResumeFile.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleRemoveFile} disabled={isLoading}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Remove file</span>
                        </Button>
                    </div>
                 )}
                 <p className="text-xs text-muted-foreground">
                    Upload your resume in PDF format.
                 </p>
             </div>
        ) : (
            <div className="space-y-2">
                <Label htmlFor="latex-code">Paste LaTeX Code</Label>
                <Textarea
                    id="latex-code"
                    placeholder="Paste your resume's LaTeX code here..."
                    value={latexCode}
                    onChange={(e) => setLatexCode(e.target.value)}
                    rows={10}
                    className="min-h-[150px] resize-y font-mono"
                    disabled={isLoading}
                />
            </div>
        )}


      {/* Job Description Input stays the same */}
      <div className="space-y-2">
          <Label htmlFor="job-description">Job Description</Label>
          <Textarea
            id="job-description"
            placeholder="Paste the full job description here."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
            className="min-h-[150px] resize-y"
            disabled={isLoading}
          />
       </div>


      {/* Action Button */}
      <Button
        onClick={handleTailorResume}
        disabled={isLoading || (inputType === 'file' && !selectedResumeFile) || (inputType === 'latex' && !latexCode.trim()) || !jobDescription.trim()}
        className="w-full"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Wand2 className="mr-2 h-4 w-4" />
        )}
        {isLoading ? 'Processing...' : 'Tailor Resume with AI'}
      </Button>

      {/* Error Display */}
       {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}


      {/* Tailored Resume PDF Output */}
      {tailoredResumePdf && (
        <div className="space-y-4 pt-4 border-t">
           <div className="flex flex-wrap justify-between items-center gap-2">
             <h3 className="text-lg font-semibold">Tailored Resume PDF</h3>
              <div className="flex gap-2 flex-shrink-0">
                 <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="mr-1 sm:mr-2 h-4 w-4" /> Download PDF
                 </Button>
              </div>
           </div>
            <div className="w-full h-[500px] border rounded-md">
                 <iframe src={tailoredResumePdf} width="100%" height="100%" title="Tailored Resume Preview"></iframe>
            </div>
            <p className="text-xs text-muted-foreground">Note: The tailored resume is generated as a PDF.</p>
        </div>
      )}
    </div>
  );
}
