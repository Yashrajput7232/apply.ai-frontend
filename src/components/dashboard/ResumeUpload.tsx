'use client';

import { useState, type ChangeEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function ResumeUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Basic validation for PDF/DOCX - more robust checks might be needed
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setSelectedFile(file);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a PDF or DOCX file.",
        });
        event.target.value = ''; // Clear the input
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
       toast({
         variant: "destructive",
         title: "No File Selected",
         description: "Please select a resume file to upload.",
       });
      return;
    }

    setIsUploading(true);
    // TODO: Implement actual upload logic to Firebase Storage or backend
    console.log('Uploading file:', selectedFile.name);

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsUploading(false);
    toast({
      title: "Upload Successful",
      description: `${selectedFile.name} has been uploaded.`,
    });
    // Keep file selected for display, don't clear setSelectedFile(null);
    // Or clear and fetch uploaded resume list from backend if needed.
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    // Also clear the file input visually if possible or needed
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
     toast({
       title: "File Removed",
       description: "The selected file has been removed.",
     });
     // TODO: Add logic to delete from backend if already uploaded
  };


  return (
    <div className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="resume-upload">Select Resume</Label>
        <Input
          id="resume-upload"
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="file:text-primary file:font-medium"
          disabled={isUploading}
        />
      </div>

      {selectedFile && (
        <div className="mt-4 p-3 border rounded-md bg-secondary/50 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-sm">
             <FileText className="h-4 w-4 text-secondary-foreground" />
             <span className="font-medium text-secondary-foreground truncate max-w-[200px]">{selectedFile.name}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRemoveFile} disabled={isUploading}>
             <Trash2 className="h-4 w-4 text-destructive" />
             <span className="sr-only">Remove file</span>
          </Button>
        </div>
      )}

      <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full sm:w-auto">
        <Upload className="mr-2 h-4 w-4" />
        {isUploading ? 'Uploading...' : 'Upload Resume'}
      </Button>
    </div>
  );
}
