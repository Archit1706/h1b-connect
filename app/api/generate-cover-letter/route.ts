// app/api/generate-cover-letter/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs"; // ensures File/Buffer APIs work server-side

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function readResumeText(file: File | null): Promise<string> {
    if (!file) return "Resume content here";
    // Simple heuristic: read as text for .txt/.md, otherwise fallback placeholder.
    const name = (file as any)?.name?.toLowerCase?.() ?? "";
    const isPlainText = name.endsWith(".txt") || name.endsWith(".md");
    try {
        if (isPlainText) return await file.text();
        // For PDFs/Docs you’d use pdf-parse or similar here.
        return "Resume content here";
    } catch {
        return "Resume content here";
    }
}

export async function POST(request: Request) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "Missing OPENAI_API_KEY" },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const resume = formData.get("resume") as File | null;
        const jobTitle = (formData.get("jobTitle") as string) || "";
        const companyName = (formData.get("companyName") as string) || "";
        const jobDescription = (formData.get("jobDescription") as string) || "";

        const resumeText = await readResumeText(resume);

        const prompt = `Create a professional, compelling cold email/cover letter for the following:

Position: ${jobTitle}
Company: ${companyName}
${jobDescription ? `Job Description: ${jobDescription}` : ""}

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
            model: "gpt-4.1", // or "gpt-4o" if you prefer
            messages: [
                {
                    role: "system",
                    content:
                        "You are an expert career coach and cold email specialist. Create compelling, professional cover letters that get responses.",
                },
                { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const coverLetter = completion.choices[0]?.message?.content ?? "";

        return NextResponse.json({ coverLetter });
    } catch (err: any) {
        // Log structured details to help diagnose quickly
        console.error("Error generating cover letter:", {
            message: err?.message,
            code: err?.code,
            type: err?.type,
            status: err?.status,
            requestID: err?.requestID,
        });
        return NextResponse.json(
            { error: `Failed to generate cover letter: ${err?.message ?? "Unknown error"}` },
            { status: 500 }
        );
    }
}
