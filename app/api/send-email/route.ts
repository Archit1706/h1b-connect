// app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import nodemailer from 'nodemailer';
import clientPromise from '@/lib/db';

export async function POST(request: Request) {
    try {
        // Verify user is authenticated
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
            to,
            subject,
            htmlBody,
            resumePath,
            companyName,
            jobTitle,
            caseNumber,
            lcaData
        } = await request.json();

        // Check if already applied to this case number
        if (caseNumber) {
            const client = await clientPromise;
            const db = client.db('lca_platform');
            const applications = db.collection('applications');

            const existingApplication = await applications.findOne({
                userId: payload.userId as string,
                caseNumber: caseNumber
            });

            if (existingApplication) {
                return NextResponse.json(
                    {
                        error: 'You have already applied to this position',
                        alreadyApplied: true
                    },
                    { status: 400 }
                );
            }
        }

        // Extract domain from recipient email
        const employerDomain = to.split('@')[1] || '';

        // Send email
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false,
            auth: {
                user: payload.email as string,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        try {
            await transporter.sendMail({
                from: payload.email as string,
                to,
                subject,
                html: htmlBody,
            });

            // Track application after successful send
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/applications/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `token=${token}`
                },
                body: JSON.stringify({
                    companyName,
                    jobTitle,
                    employerDomain,
                    recipientEmail: to,
                    caseNumber,
                    emailSubject: subject,
                    emailBody: htmlBody,
                    status: 'sent',
                    lcaData
                })
            });

            return NextResponse.json({
                message: 'Email sent and tracked successfully'
            });
        } catch (emailError: any) {
            // Track failed application
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/applications/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `token=${token}`
                },
                body: JSON.stringify({
                    companyName,
                    jobTitle,
                    employerDomain,
                    recipientEmail: to,
                    caseNumber,
                    emailSubject: subject,
                    emailBody: htmlBody,
                    status: 'failed',
                    lcaData
                })
            });

            throw emailError;
        }
    } catch (error: any) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            {
                error: error.message || 'Failed to send email',
                details: error.toString()
            },
            { status: 500 }
        );
    }
}