import { LCARecord } from '@/types';

let cachedData: LCARecord[] | null = null;

export async function loadLCAData(): Promise<LCARecord[]> {
    if (cachedData) return cachedData;

    // In production, load from your uploaded Excel/CSV file
    // For now, using the sample data provided
    const sampleData: LCARecord[] = [
        // Add your LCA data here or load from file
    ];

    cachedData = sampleData;
    return sampleData;
}

export function getUniqueCompanies(data: LCARecord[]): string[] {
    return [...new Set(data.map(record => record.EMPLOYER_NAME))].sort();
}

export function getUniqueJobTitles(data: LCARecord[]): string[] {
    return [...new Set(data.map(record => record.JOB_TITLE))].sort();
}

export function filterData(
    data: LCARecord[],
    filters: {
        company?: string;
        jobTitle?: string;
        state?: string;
        minWage?: number;
        status?: string;
    }
): LCARecord[] {
    return data.filter(record => {
        if (filters.company && record.EMPLOYER_NAME !== filters.company) return false;
        if (filters.jobTitle && record.JOB_TITLE !== filters.jobTitle) return false;
        if (filters.state && record.EMPLOYER_STATE !== filters.state) return false;
        if (filters.status && record.CASE_STATUS !== filters.status) return false;
        if (filters.minWage) {
            const wage = parseFloat(record.WAGE_RATE_OF_PAY_FROM.replace(/[^0-9.]/g, ''));
            if (wage < filters.minWage) return false;
        }
        return true;
    });
}