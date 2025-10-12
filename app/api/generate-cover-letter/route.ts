import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const resume = formData.get('resume') as File;
        const jobTitle = formData.get('jobTitle') as string;
        const companyName = formData.get('companyName') as string;
        const jobDescription = formData.get('jobDescription') as string || '';

        // In production, extract text from PDF resume
        // For now, using a simplified approach
        const resumeText = 'Resume content here'; // Extract using pdf-parse or similar

        const prompt = `Create a professional, compelling cold email/cover letter for the following:

Position: ${jobTitle}
Company: ${companyName}
${jobDescription ? `Job Description: ${jobDescription}` : ''}

Resume Summary: ${resumeText}

Guidelines:
- Write in HTML format with proper styling
- Be concise (200-300 words)
- Highlight relevant skills and experience
- Show genuine interest in the company
- Include a strong call-to-action
- Professional but personable tone
- Use proper email etiquette

Format the output as a complete HTML email body with inline CSS styling.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert career coach and cold email specialist. Create compelling, professional cover letters that get responses.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const coverLetter = completion.choices[0].message.content;

        return NextResponse.json({ coverLetter });
    } catch (error) {
        console.error('Error generating cover letter:', error);
        return NextResponse.json(
            { error: 'Failed to generate cover letter' },
            { status: 500 }
        );
    }
}