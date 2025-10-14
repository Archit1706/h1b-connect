// app/api/lca/filter-values/route.ts - CSV VERSION (FAST!)
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import Papa from 'papaparse';

export const runtime = 'nodejs';

let cachedFilterValues: any = null;

export async function GET(request: Request) {
    try {
        console.log('🔍 Loading filter values from CSV...');

        // Return cached filter values if available
        if (cachedFilterValues) {
            console.log('✅ Returning cached filter values');
            return NextResponse.json(cachedFilterValues);
        }

        // Try multiple file paths
        const possiblePaths = [
            path.join(process.cwd(), 'data', 'lca_data.csv'),
            path.join(process.cwd(), 'data', 'subset_lca_data.csv'),
        ];

        let filePath: string | null = null;
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                filePath = p;
                console.log('✅ Found CSV file at:', filePath);
                break;
            }
        }

        if (!filePath) {
            console.error('❌ CSV file not found');
            return NextResponse.json(
                { error: 'CSV file not found. Please convert Excel to CSV.' },
                { status: 404 }
            );
        }

        console.log('📖 Reading CSV file...');
        const fileContent = fs.readFileSync(filePath, 'utf8');

        console.log('📝 Parsing CSV...');
        const parseResult = Papa.parse(fileContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            delimitersToGuess: [',', '\t', '|', ';']
        });

        const jsonData = parseResult.data;

        if (jsonData.length === 0) {
            return NextResponse.json(
                { error: 'CSV file contains no data' },
                { status: 404 }
            );
        }

        // Clean up column names
        const cleanedData = jsonData.map(row => {
            const cleanRow: any = {};
            Object.keys(row).forEach(key => {
                const cleanKey = key.trim().toUpperCase();
                cleanRow[cleanKey] = row[key];
            });
            return cleanRow;
        });

        console.log('📊 Processing', cleanedData.length, 'records for filter values');

        // Extract unique values for each filterable column
        const filterableColumns = [
            'CASE_STATUS',
            'VISA_CLASS',
            'EMPLOYER_NAME',
            'JOB_TITLE',
            'SOC_TITLE',
            'EMPLOYER_STATE',
            'EMPLOYER_CITY',
            'WAGE_UNIT_OF_PAY',
            'PW_WAGE_LEVEL',
            'FULL_TIME_POSITION',
            'H_1B_DEPENDENT',
            'WILLFUL_VIOLATOR',
            'NAICS_CODE',
            'NEW_EMPLOYMENT',
            'CONTINUED_EMPLOYMENT',
            'CHANGE_PREVIOUS_EMPLOYMENT'
        ];

        const filterValues: any = {};

        filterableColumns.forEach(column => {
            const uniqueValues = new Set<string>();
            cleanedData.forEach((row: any) => {
                const value = row[column];
                if (value !== undefined && value !== null && value !== '') {
                    uniqueValues.add(String(value));
                }
            });
            filterValues[column] = Array.from(uniqueValues).sort();
            if (filterValues[column].length > 0) {
                console.log(`✅ ${column}: ${filterValues[column].length} unique values`);
            }
        });

        // Cache the filter values
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
    }
}