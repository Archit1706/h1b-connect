// app/api/send-bulk-email/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const {
            recipients, // Array of {email, companyName, jobTitle, caseNumber}
            subject,
            htmlBody,
            resumeBase64, // Base64 encoded resume
            resumeName
        } = await request.json();

        if (!recipients || recipients.length === 0) {
            return NextResponse.json(
                { error: 'No recipients provided' },
                { status: 400 }
            );
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false,
            auth: {
                user: payload.email as string,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const results = {
            total: recipients.length,
            sent: 0,
            failed: 0,
            errors: [] as any[]
        };

        // Send emails in batches to avoid overwhelming the server
        const BATCH_SIZE = 10;
        const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds

        for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
            const batch = recipients.slice(i, i + BATCH_SIZE);

            await Promise.all(
                batch.map(async (recipient: any) => {
                    try {
                        // Personalize the subject and body with company name
                        const personalizedSubject = subject.replace(
                            /\{company\}/gi,
                            recipient.companyName
                        ).replace(
                            /\{jobTitle\}/gi,
                            recipient.jobTitle
                        );

                        const personalizedBody = htmlBody.replace(
                            /\{company\}/gi,
                            recipient.companyName
                        ).replace(
                            /\{jobTitle\}/gi,
                            recipient.jobTitle
                        );

                        const mailOptions: any = {
                            from: payload.email as string,
                            to: recipient.email,
                            subject: personalizedSubject,
                            html: personalizedBody,
                        };

                        // Add resume attachment if provided
                        if (resumeBase64 && resumeName) {
                            mailOptions.attachments = [
                                {
                                    filename: resumeName,
                                    content: resumeBase64,
                                    encoding: 'base64'
                                }
                            ];
                        }

                        await transporter.sendMail(mailOptions);
                        results.sent++;

                        // Track application
                        try {
                            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/applications/track`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Cookie': `token=${token}`
                                },
                                body: JSON.stringify({
                                    companyName: recipient.companyName,
                                    jobTitle: recipient.jobTitle,
                                    employerDomain: recipient.email.split('@')[1] || '',
                                    recipientEmail: recipient.email,
                                    caseNumber: recipient.caseNumber,
                                    emailSubject: personalizedSubject,
                                    emailBody: personalizedBody,
                                    status: 'sent',
                                    lcaData: recipient
                                })
                            });
                        } catch (trackError) {
                            console.error('Failed to track application:', trackError);
                        }

                    } catch (error: any) {
                        results.failed++;
                        results.errors.push({
                            recipient: recipient.email,
                            company: recipient.companyName,
                            error: error.message
                        });
                    }
                })
            );

            // Delay between batches
            if (i + BATCH_SIZE < recipients.length) {
                await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
            }
        }

        return NextResponse.json({
            message: 'Bulk email sending completed',
            results
        });

    } catch (error: any) {
        console.error('Error sending bulk emails:', error);
        return NextResponse.json(
            { error: 'Failed to send bulk emails', details: error.message },
            { status: 500 }
        );
    }
}