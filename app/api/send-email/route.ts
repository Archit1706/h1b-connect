import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import nodemailer from 'nodemailer';

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

        const { to, subject, htmlBody, resumePath } = await request.json();

        // Note: In production, user needs to provide their email credentials
        // This is a simplified version - you'd need proper OAuth2 setup for Gmail
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: false,
            auth: {
                user: payload.email as string,
                pass: process.env.EMAIL_PASSWORD, // User-specific password from settings
            },
        });

        await transporter.sendMail({
            from: payload.email as string,
            to,
            subject,
            html: htmlBody,
            // Note: File attachments need to be handled differently in production
            // You'd need to upload the file to server first
        });

        return NextResponse.json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
}