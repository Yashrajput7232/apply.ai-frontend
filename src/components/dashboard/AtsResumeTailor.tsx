'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Wand2, Download, ClipboardCopy, AlertCircle, FileText, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Switch } from '@/components/ui/switch';

export default function AtsResumeTailor() {
  const [inputType, setInputType] = useState<'file' | 'latex'>('file');
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);
  const [latexCode, setLatexCode] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [tailoredResumePdf, setTailoredResumePdf] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setTailoredResumePdf(null);
    if (inputType === 'latex') {
      setExtractedText(null);
    }
  }, [selectedResumeFile, jobDescription, latexCode, inputType]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'application/pdf') {
        setSelectedResumeFile(file);
        toast({ title: "Extracting text...", description: file.name });
        try {
          // Send file to your backend / pdf-extraction API
          const formData = new FormData();
          formData.append('file', file);
          const extractRes = await fetch("https://latex-api-xx5f.onrender.com/extract-text", {
            method: 'POST',
            body: formData,
          });
          if (!extractRes.ok) throw new Error("Failed to extract text");
          const data = await extractRes.json();
          setExtractedText(data.text); // Set extracted text
          toast({ title: "Text extracted successfully!" });
        } catch (err: any) {
          toast({ variant: "destructive", title: "Extraction Error", description: err.message });
          setSelectedResumeFile(null);
        }
      } else {
        toast({ variant: "destructive", title: "Invalid File", description: "Upload a PDF file" });
      }
    }
  };

  const handleTailorResume = async () => {
    if (inputType === 'file' && !extractedText) {
      toast({ variant: "destructive", title: "No resume text", description: "Upload a PDF to extract text first" });
      return;
    }
    if (!jobDescription.trim()) {
      toast({ variant: "destructive", title: "Missing JD", description: "Paste the job description" });
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        job_description: jobDescription,
        resume: inputType === 'file' ? extractedText : latexCode
      };
      const res = await fetch("https://apply-ai-6gm8.onrender.com/generate_tailored_resume", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to generate resume");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setTailoredResumePdf(url);
      toast({ title: "Resume tailored successfully!" });
    } catch (err: any) {
      setError(err.message);
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Label>Upload File</Label>
        <Switch
          checked={inputType === 'latex'}
          onCheckedChange={(checked) => setInputType(checked ? 'latex' : 'file')}
        />
        <Label>Use LaTeX</Label>
      </div>

      {inputType === 'file' ? (
        <div>
          <Label>Select Resume (PDF)</Label>
          <Input type="file" accept=".pdf" onChange={handleFileChange} disabled={isLoading} />
        </div>
      ) : (
        <Textarea value={latexCode} onChange={(e) => setLatexCode(e.target.value)} rows={8} />
      )}

      {inputType === 'file' && extractedText && (
        <div>
          <Label>Extracted Resume Text</Label>
          <ScrollArea className="h-40 border p-2">
            <p className="whitespace-pre-wrap text-sm">{extractedText}</p>
          </ScrollArea>
        </div>
      )}

      <div>
        <Label>Job Description</Label>
        <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={8} />
      </div>

      <Button onClick={handleTailorResume} disabled={isLoading}>
        {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />} Tailor Resume
      </Button>

      {tailoredResumePdf && (
        <div>
          <iframe src={tailoredResumePdf} width="100%" height="500px" />
          <Button onClick={() => window.open(tailoredResumePdf)}>Download PDF</Button>
        </div>
      )}
    </div>
  );
}
