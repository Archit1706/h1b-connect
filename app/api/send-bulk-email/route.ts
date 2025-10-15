// app/api/send-bulk-email/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import nodemailer from 'nodemailer';

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

        // Conservative settings to avoid rate limiting
        const BATCH_SIZE = 5; // Smaller batches
        const DELAY_BETWEEN_EMAILS = 3000; // 3 seconds between each email
        const DELAY_BETWEEN_BATCHES = 10000; // 10 seconds between batches

        console.log(`Starting bulk email send: ${recipients.length} recipients`);
        console.log(`Settings: ${BATCH_SIZE} emails per batch, ${DELAY_BETWEEN_EMAILS}ms between emails, ${DELAY_BETWEEN_BATCHES}ms between batches`);

        for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
            const batch = recipients.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(recipients.length / BATCH_SIZE);

            console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} emails)`);

            // Process emails in batch sequentially (not in parallel) to control rate
            for (let j = 0; j < batch.length; j++) {
                const recipient = batch[j];

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

                    // Send email
                    await transporter.sendMail(mailOptions);
                    results.sent++;

                    console.log(`✅ Sent ${results.sent}/${recipients.length}: ${recipient.companyName} - ${recipient.email}`);

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

                    // Add delay between each email (except for the last one in last batch)
                    if (i + j < recipients.length - 1) {
                        console.log(`⏳ Waiting ${DELAY_BETWEEN_EMAILS}ms before next email...`);
                        await delay(DELAY_BETWEEN_EMAILS);
                    }

                } catch (error: any) {
                    results.failed++;
                    results.errors.push({
                        recipient: recipient.email,
                        company: recipient.companyName,
                        error: error.message
                    });

                    console.error(`❌ Failed ${results.failed}: ${recipient.companyName} - ${error.message}`);

                    // Track failed application
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
                                emailSubject: subject,
                                emailBody: htmlBody,
                                status: 'failed',
                                lcaData: recipient
                            })
                        });
                    } catch (trackError) {
                        console.error('Failed to track failed application:', trackError);
                    }
                }
            }

            // Add longer delay between batches (except after the last batch)
            if (i + BATCH_SIZE < recipients.length) {
                console.log(`⏸️  Batch ${batchNum} complete. Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
                await delay(DELAY_BETWEEN_BATCHES);
            }
        }

        console.log(`✅ Bulk email sending completed! Sent: ${results.sent}, Failed: ${results.failed}`);

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