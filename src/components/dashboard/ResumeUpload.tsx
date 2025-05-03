
'use client';

import { type ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; // Keep button for removing
import { Label } from "@/components/ui/label";
import { FileText, Trash2 } from 'lucide-react'; // Remove Upload icon
import { useToast } from "@/hooks/use-toast";

interface ResumeUploadProps {
  selectedFile: File | null;
  setSelectedFile: Dispatch<SetStateAction<File | null>>;
}

export default function ResumeUpload({ selectedFile, setSelectedFile }: ResumeUploadProps) {
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Basic validation for PDF/DOCX
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setSelectedFile(file);
         toast({
           title: "File Selected",
           description: `${file.name} is ready to be tailored.`,
         });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a PDF or DOCX file.",
        });
        setSelectedFile(null); // Clear selection on invalid type
        event.target.value = ''; // Clear the input
      }
    } else {
       // Handle case where selection is cancelled
       setSelectedFile(null);
       event.target.value = '';
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    // Clear the file input visually
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
     toast({
       title: "File Removed",
       description: "Selection cleared.",
     });
     // No backend deletion needed here as we haven't uploaded yet
  };


  return (
    <div className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="resume-upload">Select Resume File</Label>
        <Input
          id="resume-upload"
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="file:text-primary file:font-medium"
          // Disable if needed during other operations, e.g., tailoring
        />
      </div>

      {selectedFile && (
        <div className="mt-4 p-3 border rounded-md bg-secondary/50 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-sm overflow-hidden"> {/* Added overflow-hidden */}
             <FileText className="h-4 w-4 text-secondary-foreground flex-shrink-0" /> {/* Added flex-shrink-0 */}
             <span className="font-medium text-secondary-foreground truncate">{selectedFile.name}</span> {/* Removed max-w */}
          </div>
          <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
             <Trash2 className="h-4 w-4 text-destructive" />
             <span className="sr-only">Remove file</span>
          </Button>
        </div>
      )}

      {/* Removed the Upload button as selection is sufficient for tailoring */}
      {/* Add back if explicit upload to storage is needed later */}
       <p className="text-xs text-muted-foreground">
         Select your resume file. It will be used for tailoring below.
       </p>
    </div>
  );
}
