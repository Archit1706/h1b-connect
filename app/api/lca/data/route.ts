// app/api/lca/data/route.ts - OPTIMIZED VERSION
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import Papa from 'papaparse';

export const runtime = 'nodejs';

// Cache structure with essential fields only
let cachedData: any[] | null = null;
let isLoading = false;

// Store only essential fields to reduce memory usage
const ESSENTIAL_FIELDS = [
    'CASE_NUMBER',
    'CASE_STATUS',
    'EMPLOYER_NAME',
    'JOB_TITLE',
    'SOC_TITLE',
    'EMPLOYER_CITY',
    'EMPLOYER_STATE',
    'EMPLOYER_POSTAL_CODE',
    'WAGE_RATE_OF_PAY_FROM',
    'WAGE_UNIT_OF_PAY',
    'FULL_TIME_POSITION',
    'H_1B_DEPENDENT',
    'PW_WAGE_LEVEL',
    'VISA_CLASS',
    'EMPLOYER_POC_EMAIL',
    'EMPLOYER_PHONE',
    'EMPLOYER_ADDRESS1'
];

async function loadDataIfNeeded() {
    if (cachedData || isLoading) return;

    isLoading = true;
    console.log('📊 Loading LCA data (optimized)...');

    try {
        const filePath = path.join(process.cwd(), 'data', 'lca_data.csv');

        if (!fs.existsSync(filePath)) {
            throw new Error('CSV file not found');
        }

        const stats = fs.statSync(filePath);
        console.log('📦 File size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');

        // Stream parsing for large files
        const fileContent = fs.readFileSync(filePath, 'utf8');

        const parseResult = Papa.parse(fileContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            delimitersToGuess: [',', '\t', '|', ';'],
            // Add worker: true for even better performance if available
        });

        console.log('✅ Parsed', parseResult.data.length, 'records');

        // Clean and optimize data - store only essential fields
        const optimizedData = parseResult.data.map((row: any) => {
            const cleanRow: any = {};
            ESSENTIAL_FIELDS.forEach(field => {
                const value = row[field] || row[field.toLowerCase()] || row[field.toUpperCase()];
                if (value !== undefined && value !== null && value !== '') {
                    cleanRow[field] = value;
                }
            });
            return cleanRow;
        });

        cachedData = optimizedData;
        console.log('✅ Data cached with', Object.keys(optimizedData[0] || {}).length, 'fields per record');

    } catch (error) {
        console.error('❌ Error loading data:', error);
        throw error;
    } finally {
        isLoading = false;
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '50'), 100); // Limit to 100
        const filters = searchParams.get('filters');

        await loadDataIfNeeded();

        if (!cachedData) {
            return NextResponse.json(
                { error: 'Failed to load data' },
                { status: 500 }
            );
        }

        // Apply filters efficiently
        let filteredData = cachedData;

        if (filters) {
            const filterObj = JSON.parse(filters);

            // Create a Set for each filter for O(1) lookup
            const filterSets: Record<string, Set<string>> = {};
            Object.entries(filterObj).forEach(([column, values]) => {
                if (Array.isArray(values) && values.length > 0) {
                    filterSets[column] = new Set(values.map(String));
                }
            });

            // Single-pass filtering
            filteredData = cachedData.filter(record => {
                for (const [column, valueSet] of Object.entries(filterSets)) {
                    if (!valueSet.has(String(record[column]))) {
                        return false;
                    }
                }
                return true;
            });
        }

        // Paginate
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        const paginatedData = filteredData.slice(startIdx, endIdx);

        return NextResponse.json({
            data: paginatedData,
            count: paginatedData.length,
            totalRecords: filteredData.length,
            totalPages: Math.ceil(filteredData.length / pageSize),
            currentPage: page,
            pageSize: pageSize
        });

    } catch (error: any) {
        console.error('❌ Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to load data',
                details: error.message
            },
            { status: 500 }
        );
    }
}