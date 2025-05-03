// use server'

/**
 * @fileOverview AI agent that generates personalized outreach emails to HR or referral request messages, given a job link and company details.
 *
 * - generateHROutreachEmail - A function that handles the generation of the outreach email.
 * - GenerateHROutreachEmailInput - The input type for the generateHROutreachEmail function.
 * - GenerateHROutreachEmailOutput - The return type for the generateHROutreachEmail function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateHROutreachEmailInputSchema = z.object({
  jobLink: z.string().describe('The link to the job posting.'),
  companyDetails: z.string().describe('Additional details about the company (optional).'),
});
export type GenerateHROutreachEmailInput = z.infer<typeof GenerateHROutreachEmailInputSchema>;

const GenerateHROutreachEmailOutputSchema = z.object({
  email: z.string().describe('The generated outreach email or referral request message.'),
});
export type GenerateHROutreachEmailOutput = z.infer<typeof GenerateHROutreachEmailOutputSchema>;

export async function generateHROutreachEmail(input: GenerateHROutreachEmailInput): Promise<GenerateHROutreachEmailOutput> {
  return generateHROutreachEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHROutreachEmailPrompt',
  input: {
    schema: z.object({
      jobLink: z.string().describe('The link to the job posting.'),
      companyDetails: z.string().describe('Additional details about the company (optional).'),
    }),
  },
  output: {
    schema: z.object({
      email: z.string().describe('The generated outreach email or referral request message.'),
    }),
  },
  prompt: `You are an AI assistant specialized in generating personalized outreach emails to HR or referral request messages.

  Given the following job link and company details, generate a compelling and professional email to HR or a referral request message.

  Job Link: {{{jobLink}}}
  Company Details: {{{companyDetails}}}

  Email:`, // Removed Handlebars call to scrapeJobDescription since that is not how tool use works in Genkit.
});

const generateHROutreachEmailFlow = ai.defineFlow<
  typeof GenerateHROutreachEmailInputSchema,
  typeof GenerateHROutreachEmailOutputSchema
>({
  name: 'generateHROutreachEmailFlow',
  inputSchema: GenerateHROutreachEmailInputSchema,
  outputSchema: GenerateHROutreachEmailOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
