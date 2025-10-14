// app/api/lca/data/route.ts - PAGINATED VERSION (Best for 1M+ records)
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import Papa from 'papaparse';

export const runtime = 'nodejs';

let cachedData: any[] | null = null;
let isLoading = false;

async function loadDataIfNeeded() {
    if (cachedData || isLoading) return;

    isLoading = true;
    console.log('📊 Loading LCA data from CSV (first time)...');

    try {
        const filePath = path.join(process.cwd(), 'data', 'lca_data.csv');

        if (!fs.existsSync(filePath)) {
            throw new Error('CSV file not found');
        }

        const stats = fs.statSync(filePath);
        console.log('📦 File size:', (stats.size / 1024 / 1024).toFixed(2), 'MB');

        console.log('📖 Reading and parsing CSV (this will take a minute)...');
        const fileContent = fs.readFileSync(filePath, 'utf8');

        const parseResult = Papa.parse(fileContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            delimitersToGuess: [',', '\t', '|', ';']
        });

        console.log('✅ Parsed', parseResult.data.length, 'records');

        // Clean up column names
        const cleanedData = parseResult.data.map((row: any) => {
            const cleanRow: any = {};
            Object.keys(row).forEach(key => {
                const cleanKey = key.trim().toUpperCase();
                cleanRow[cleanKey] = row[key];
            });
            return cleanRow;
        });

        cachedData = cleanedData;
        console.log('✅ Data cached in memory for fast filtering');

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
        const pageSize = parseInt(searchParams.get('pageSize') || '100');
        const filters = searchParams.get('filters');

        // Load data if not already loaded
        await loadDataIfNeeded();

        if (!cachedData) {
            return NextResponse.json(
                { error: 'Failed to load data' },
                { status: 500 }
            );
        }

        console.log(`📊 Request: page ${page}, filters: ${filters ? 'yes' : 'no'}`);

        // Apply filters if provided
        let filteredData = cachedData;

        if (filters) {
            const filterObj = JSON.parse(filters);
            filteredData = cachedData.filter(record => {
                for (const [column, values] of Object.entries(filterObj)) {
                    if (Array.isArray(values) && values.length > 0) {
                        if (!values.includes(String(record[column]))) {
                            return false;
                        }
                    }
                }
                return true;
            });
            console.log(`🔍 Filtered to ${filteredData.length} records`);
        }

        // Paginate
        const startIdx = (page - 1) * pageSize;
        const endIdx = startIdx + pageSize;
        const paginatedData = filteredData.slice(startIdx, endIdx);

        console.log(`✅ Returning ${paginatedData.length} records (page ${page})`);

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