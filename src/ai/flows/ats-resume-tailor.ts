
'use server';

/**
 * @fileOverview A flow to tailor a resume to a specific job description, optimizing it for ATS systems.
 *
 * - atsResumeTailor - A function that tailors a resume to a job description.
 * - AtsResumeTailorInput - The input type for the atsResumeTailor function.
 * - AtsResumeTailorOutput - The return type for the atsResumeTailor function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
// Note: The job scraping logic is handled client-side before calling this flow.
// This flow focuses *only* on the AI tailoring part.

const AtsResumeTailorInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The user's resume, provided as a data URI. Must include a MIME type (e.g., 'application/pdf' or 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') and use Base64 encoding. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  jobDescription: z.string().describe('The full text of the target job description.'),
});
export type AtsResumeTailorInput = z.infer<typeof AtsResumeTailorInputSchema>;

const AtsResumeTailorOutputSchema = z.object({
  // Outputting as plain text. Converting to PDF/DOCX requires separate libraries/services.
  tailoredResume: z.string().describe('The tailored resume content as plain text, optimized for the job description and ATS compatibility.'),
});
export type AtsResumeTailorOutput = z.infer<typeof AtsResumeTailorOutputSchema>;

/**
 * Tailors a given resume (as a data URI) to a specific job description using AI.
 * Optimized for Applicant Tracking Systems (ATS).
 * @param input Contains the resume data URI and the job description text.
 * @returns A promise resolving to the tailored resume content as plain text.
 */
export async function atsResumeTailor(input: AtsResumeTailorInput): Promise<AtsResumeTailorOutput> {
  console.log("Received input for atsResumeTailorFlow:", { resumeUriStart: input.resumeDataUri.substring(0, 50) + '...', jobDescriptionLength: input.jobDescription.length });
  // Basic validation check (more robust checks can be added)
  if (!input.resumeDataUri.startsWith('data:') || !input.resumeDataUri.includes(';base64,')) {
    throw new Error("Invalid resumeDataUri format. Expected 'data:<mimetype>;base64,<encoded_data>'.");
  }
   if (!input.jobDescription.trim()) {
    throw new Error("Job description cannot be empty.");
  }
  return atsResumeTailorFlow(input);
}

const atsResumeTailorPrompt = ai.definePrompt({
  name: 'atsResumeTailorPrompt',
  input: {
    schema: z.object({
      resumeDataUri: z.string().describe("The user's resume as a data URI."),
      jobDescription: z.string().describe('The target job description text.'),
    }),
  },
  output: {
    // Expecting plain text output from the LLM for simplicity.
    // Formatting might be lost, but content is prioritized.
    schema: z.object({
      tailoredResume: z.string().describe('The optimized resume content as plain text.'),
    }),
  },
  prompt: `You are an expert career coach and resume writer specializing in optimizing resumes for Applicant Tracking Systems (ATS) while maintaining a professional and human-readable format.

Analyze the provided resume and the target job description. Your task is to rewrite the resume to significantly increase its relevance to the job description, focusing on the following:

1.  **Keyword Integration:** Identify key skills, responsibilities, and qualifications mentioned in the job description. Naturally integrate these keywords and phrases throughout the resume, particularly in the summary/profile, experience descriptions, and skills sections. Avoid keyword stuffing; ensure the language flows well.
2.  **Highlighting Relevance:** Emphasize experiences, achievements, and skills from the original resume that directly align with the requirements of the target job. Quantify achievements whenever possible.
3.  **ATS Compatibility:** Structure the output clearly using standard resume sections (e.g., Contact Information, Summary/Profile, Experience, Education, Skills). Use clear and concise language. Avoid complex formatting like tables, columns, or graphics, as the output must be plain text. Use standard bullet points (like '*' or '-') for lists.
4.  **Professional Tone:** Maintain a professional and confident tone throughout the rewritten resume. Ensure correct grammar and spelling.

**Input:**

*   **User's Resume:**
    {{media url=resumeDataUri}}

*   **Target Job Description:**
    \`\`\`
    {{jobDescription}}
    \`\`\`

**Output:**

Provide the rewritten, tailored resume content as **plain text only**. Do not include any introductory phrases like "Here is the tailored resume:". Start directly with the contact information section. Ensure the entire output is valid plain text suitable for copying and pasting.
`,
});

const atsResumeTailorFlow = ai.defineFlow<
  typeof AtsResumeTailorInputSchema,
  typeof AtsResumeTailorOutputSchema
>(
  {
    name: 'atsResumeTailorFlow',
    inputSchema: AtsResumeTailorInputSchema,
    outputSchema: AtsResumeTailorOutputSchema,
  },
  async input => {
    try {
        console.log("Generating tailored resume...");
        const {output} = await atsResumeTailorPrompt(input);
        console.log("Tailored resume generated successfully.");

        if (!output?.tailoredResume) {
             console.error("AI did not return tailored resume content.");
            throw new Error("AI generation failed: No tailored resume content received.");
        }
        // Basic check for empty or placeholder output
        if (output.tailoredResume.trim().length < 100) { // Arbitrary threshold
             console.warn("Generated resume seems very short:", output.tailoredResume);
             // Decide whether to throw an error or return the short content
             // throw new Error("AI generation failed: Output content is too short.");
        }

        return { tailoredResume: output.tailoredResume.trim() }; // Trim whitespace
    } catch (error: any) {
        console.error("Error in atsResumeTailorFlow:", error);
        // Rethrow or handle the error appropriately
        throw new Error(`AI tailoring process failed: ${error.message || error}`);
    }
  }
);

