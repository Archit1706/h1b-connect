// app/api/test-email/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import nodemailer from 'nodemailer';

// Helper function to add delay between emails
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
    try {
        // Verify user is authenticated
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - Please login first' },
                { status: 401 }
            );
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid token - Please login again' },
                { status: 401 }
            );
        }

        // Parse request body with error handling
        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            console.error('Failed to parse request body:', parseError);
            return NextResponse.json(
                { error: 'Invalid request body - please check your input' },
                { status: 400 }
            );
        }

        const {
            recipients,
            subject,
            htmlBody,
            attachmentBase64,
            attachmentName
        } = body;

        // Validate inputs
        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json(
                { error: 'No recipients provided' },
                { status: 400 }
            );
        }

        if (!subject || !subject.trim()) {
            return NextResponse.json(
                { error: 'Subject is required' },
                { status: 400 }
            );
        }

        if (!htmlBody || !htmlBody.trim()) {
            return NextResponse.json(
                { error: 'Email body is required' },
                { status: 400 }
            );
        }

        // Validate email configuration
        if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT) {
            console.error('Email configuration missing');
            return NextResponse.json(
                { error: 'Email service not configured - please contact administrator' },
                { status: 500 }
            );
        }

        // Create transporter with error handling
        let transporter;
        try {
            transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT || '587'),
                secure: false,
                auth: {
                    user: payload.email as string,
                    pass: process.env.EMAIL_PASSWORD,
                },
                // Add timeout and connection settings
                connectionTimeout: 10000, // 10 seconds
                greetingTimeout: 10000,
                socketTimeout: 10000,
            });

            // Verify connection
            await transporter.verify();
        } catch (transportError: any) {
            console.error('Failed to create email transporter:', transportError);
            return NextResponse.json(
                {
                    error: 'Failed to connect to email server',
                    details: transportError.message
                },
                { status: 500 }
            );
        }

        const results = {
            total: recipients.length,
            sent: 0,
            failed: 0,
            errors: [] as any[]
        };

        console.log(`📧 Starting test email batch to ${recipients.length} recipient(s)`);
        console.log(`📝 Subject: ${subject}`);
        console.log(`📄 Body length: ${htmlBody.length} characters`);
        console.log(`📎 Attachment: ${attachmentName || 'None'}`);

        // Send emails with delay between each
        for (let i = 0; i < recipients.length; i++) {
            const recipient = recipients[i];

            try {
                const mailOptions: any = {
                    from: payload.email as string,
                    to: recipient,
                    subject: subject,
                    html: htmlBody,
                };

                // Add attachment if provided
                if (attachmentBase64 && attachmentName) {
                    mailOptions.attachments = [
                        {
                            filename: attachmentName,
                            content: attachmentBase64,
                            encoding: 'base64'
                        }
                    ];
                }

                // Send with timeout
                await Promise.race([
                    transporter.sendMail(mailOptions),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Email send timeout')), 30000)
                    )
                ]);

                results.sent++;
                console.log(`✅ Sent ${results.sent}/${recipients.length}: ${recipient}`);

                // Add delay between emails (except for last one)
                if (i < recipients.length - 1) {
                    await delay(2000); // 2 second delay
                }

            } catch (error: any) {
                results.failed++;
                const errorMessage = error.message || 'Unknown error';
                results.errors.push({
                    recipient: recipient,
                    error: errorMessage
                });

                console.error(`❌ Failed to send to ${recipient}:`, errorMessage);
            }
        }

        console.log(`✅ Test email batch completed. Sent: ${results.sent}, Failed: ${results.failed}`);

        return NextResponse.json({
            message: 'Test email sending completed',
            results
        });

    } catch (error: any) {
        console.error('Unexpected error in test email endpoint:', error);

        // Ensure we always return valid JSON
        return NextResponse.json(
            {
                error: 'An unexpected error occurred',
                details: error.message || 'Unknown error',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}