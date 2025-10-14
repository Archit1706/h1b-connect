// app/api/applications/track/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
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

        const body = await request.json();
        const {
            companyName,
            jobTitle,
            employerDomain,
            recipientEmail,
            caseNumber,
            emailSubject,
            emailBody,
            status,
            lcaData
        } = body;

        const client = await clientPromise;
        const db = client.db('lca_platform');
        const applications = db.collection('applications');

        // Create application tracking record
        const applicationRecord = {
            userId: payload.userId as string,
            userEmail: payload.email as string,
            companyName,
            jobTitle,
            employerDomain,
            recipientEmail,
            caseNumber,
            emailSubject,
            emailBody,
            status,
            sentAt: new Date(),
            lcaData: lcaData || {}
        };

        const result = await applications.insertOne(applicationRecord);

        return NextResponse.json({
            message: 'Application tracked successfully',
            id: result.insertedId
        });
    } catch (error) {
        console.error('Error tracking application:', error);
        return NextResponse.json(
            { error: 'Failed to track application' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
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

        const client = await clientPromise;
        const db = client.db('lca_platform');
        const applications = db.collection('applications');

        // Get all applications for this user
        const userApplications = await applications
            .find({ userId: payload.userId as string })
            .sort({ sentAt: -1 })
            .toArray();

        return NextResponse.json({
            applications: userApplications,
            count: userApplications.length
        });
    } catch (error) {
        console.error('Error fetching applications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch applications' },
            { status: 500 }
        );
    }
}