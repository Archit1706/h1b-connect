import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import Papa from 'papaparse';

export const runtime = 'nodejs';

let cachedFilterValues: any = null;
let isLoading = false;

export async function GET(request: Request) {
    // Return immediately if already cached
    if (cachedFilterValues) {
        return NextResponse.json(cachedFilterValues);
    }

    // Prevent concurrent loading
    if (isLoading) {
        // Wait a bit and check again
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (cachedFilterValues) {
            return NextResponse.json(cachedFilterValues);
        }
    }

    isLoading = true;

    try {
        console.log('🔍 Loading filter values (optimized)...');

        const filePath = path.join(process.cwd(), 'data', 'lca_data.csv');

        if (!fs.existsSync(filePath)) {
            return NextResponse.json(
                { error: 'CSV file not found' },
                { status: 404 }
            );
        }

        // For very large files, we can sample instead of processing all rows
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n');

        // Sample strategy: take every Nth row for very large files
        const totalLines = lines.length;
        const shouldSample = totalLines > 100000;
        const sampleRate = shouldSample ? 3 : 1; // Take every 3rd row if sampling

        let sampled = '';
        if (shouldSample) {
            sampled = lines[0] + '\n'; // Header
            for (let i = 1; i < totalLines; i += sampleRate) {
                sampled += lines[i] + '\n';
            }
            console.log(`📊 Sampling: ${Math.floor(totalLines / sampleRate)} of ${totalLines} rows`);
        } else {
            sampled = fileContent;
        }

        const parseResult = Papa.parse(sampled, {
            header: true,
            skipEmptyLines: true,
            delimitersToGuess: [',', '\t', '|', ';']
        });

        const jsonData = parseResult.data;

        const filterableColumns = [
            'CASE_STATUS',
            'VISA_CLASS',
            'JOB_TITLE',
            'SOC_TITLE',
            'JOB_DOMAIN',
            'EMPLOYER_STATE',
            'EMPLOYER_CITY',
            'PW_WAGE_LEVEL',
            'FULL_TIME_POSITION',
            'H_1B_DEPENDENT'
        ];

        const filterValues: any = {};

        // Use Set for faster unique value collection
        filterableColumns.forEach(column => {
            const uniqueValues = new Set<string>();

            jsonData.forEach((row: any) => {
                const value = row[column] || row[column.toLowerCase()] || row[column.toUpperCase()];
                if (value !== undefined && value !== null && value !== '') {
                    uniqueValues.add(String(value).trim());
                }
            });

            // Sort and limit to top N values for very large lists
            const sortedValues = Array.from(uniqueValues).sort();

            // For fields with too many unique values, take top 500
            filterValues[column] = sortedValues.length > 500
                ? sortedValues.slice(0, 500)
                : sortedValues;

            console.log(`✅ ${column}: ${filterValues[column].length} unique values`);
        });

        cachedFilterValues = filterValues;
        return NextResponse.json(filterValues);

    } catch (error: any) {
        console.error('❌ Error loading filter values:', error);
        return NextResponse.json(
            {
                error: 'Failed to load filter values',
                details: error.message
            },
            { status: 500 }
        );
    } finally {
        isLoading = false;
    }
}