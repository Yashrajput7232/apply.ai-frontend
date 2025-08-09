
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
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setTailoredResumePdf(null);
    if (inputType === 'latex') {
      setExtractedText(null);
    }
  }, [selectedResumeFile, jobDescription, latexCode, inputType]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Allow only PDF files for the new flow
      if (file.type === 'application/pdf') {
        setSelectedResumeFile(file);
        setExtractedText(null); // Reset extracted text on new file selection
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
    setExtractedText(null);
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
    toast({
      title: "File Removed",
      description: "Selection cleared.",
    });
  };

  const handleExtractText = async () => {
    if (!selectedResumeFile) {
        toast({ variant: "destructive", title: "Please select a PDF file first."});
        return;
    }
    setIsLoading(true);
    setError(null);
    setExtractedText(null);
    try {
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
        setExtractedText(extractedData.text);
        setJobDescription(extractedData.text); // Also populate the job description field
        toast({ title: "Text extracted successfully!", description: "Extracted text has been placed in the job description box for you to review." });

    } catch (err: any) {
        console.error("Error in text extraction:", err);
        setError(`Failed to extract text: ${err.message}`);
        toast({ variant: "destructive", title: "Extraction Error", description: err.message });
    } finally {
        setIsLoading(false);
    }
  }


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
      let compileUrl: string;
      let payload: any;


      if (inputType === 'latex') {
         toast({ title: "Compiling LaTeX to PDF..." });
         compileUrl = "https://latex-api-xx5f.onrender.com/compile";
         payload = {
            "code": latexCode
         }
         const compileResponse = await fetch(compileUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });

         if (!compileResponse.ok || compileResponse.headers.get('content-type') !== 'application/pdf') {
            const errorData = await compileResponse.json();
            throw new Error(errorData.detail || 'Failed to compile LaTeX.');
         }
         const pdfBlob = await compileResponse.blob();
         const pdfUrl = URL.createObjectURL(pdfBlob);
         setTailoredResumePdf(pdfUrl);
         toast({ title: "LaTeX compiled successfully!" });
         // For LaTeX, we just display the generated PDF, no tailoring.
         setIsLoading(false);
         return;
      }


      // For file upload, we proceed with tailoring
      if (inputType === 'file' && extractedText) {
        resumeContent = extractedText;
      } else if (inputType === 'file' && selectedResumeFile) {
        // Fallback to extract text again if not already done.
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
      } else {
          throw new Error("No resume content available to tailor.");
      }


      // Step 2: Generate Tailored Resume
      toast({ title: "Tailoring resume..." });
      const tailorPayload = {
        job_description: jobDescription,
        resume: resumeContent,
      };

      const tailorResponse = await fetch("https://resumetailor-0b6a.onrender.com/generate_tailored_resume", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tailorPayload),
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
                 {selectedResumeFile && !extractedText && (
                    <Button onClick={handleExtractText} disabled={isLoading} className="mt-2 w-full">
                         {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                         Extract Text from PDF
                    </Button>
                 )}
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
          <Label htmlFor="job-description">Job Description (or Extracted Text)</Label>
          <Textarea
            id="job-description"
            placeholder={inputType === 'file' ? "Upload a PDF and click 'Extract Text', or paste the job description here." : "Paste the full job description here."}
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
        {isLoading ? 'Processing...' : (inputType === 'latex' ? 'Compile LaTeX to PDF' : 'Tailor Resume with AI')}
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
             <h3 className="text-lg font-semibold">Generated PDF</h3>
              <div className="flex gap-2 flex-shrink-0">
                 <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="mr-1 sm:mr-2 h-4 w-4" /> Download PDF
                 </Button>
              </div>
           </div>
            <div className="w-full h-[500px] border rounded-md">
                 <iframe src={tailoredResumePdf} width="100%" height="100%" title="Generated PDF Preview"></iframe>
            </div>
            <p className="text-xs text-muted-foreground">Note: The resume is generated as a PDF.</p>
        </div>
      )}
    </div>
  );
}
