// app/email/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import FilterSidebar from '@/components/FilterSidebar';
import CompanyCard from '@/components/CompanyCard';
import EmailComposer from '@/components/EmailComposer';
import StatsCard from '@/components/StatsCard';
import { LCARecord } from '@/types';

// Info Modal Component
interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: LCARecord | null;
}

function InfoModal({ isOpen, onClose, record }: InfoModalProps) {
    if (!isOpen || !record) return null;

    const generateLinkedInSearchURL = () => {
        const firstName = record.EMPLOYER_POC_FIRST_NAME || '';
        const lastName = record.EMPLOYER_POC_LAST_NAME || '';
        const company = record.EMPLOYER_NAME || '';
        const jobTitle = record.EMPLOYER_POC_JOB_TITLE || 'HR';

        const searchQuery = `${firstName} ${lastName} ${company} ${jobTitle}`.trim();
        return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}`;
    };

    const formatFieldName = (fieldName: string): string => {
        return fieldName
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    const fieldCategories = {
        'Case Information': [
            'CASE_NUMBER', 'CASE_STATUS', 'RECEIVED_DATE', 'DECISION_DATE',
            'ORIGINAL_CERT_DATE', 'VISA_CLASS'
        ],
        'Company Information': [
            'EMPLOYER_NAME', 'TRADE_NAME_DBA', 'EMPLOYER_ADDRESS1', 'EMPLOYER_ADDRESS2',
            'EMPLOYER_CITY', 'EMPLOYER_STATE', 'EMPLOYER_POSTAL_CODE',
            'EMPLOYER_PHONE', 'EMPLOYER_PHONE_EXT', 'EMPLOYER_FEIN', 'NAICS_CODE'
        ],
        'Contact Person': [
            'EMPLOYER_POC_FIRST_NAME', 'EMPLOYER_POC_LAST_NAME',
            'EMPLOYER_POC_MIDDLE_NAME', 'EMPLOYER_POC_JOB_TITLE',
            'EMPLOYER_POC_ADDRESS1', 'EMPLOYER_POC_ADDRESS2',
            'EMPLOYER_POC_CITY', 'EMPLOYER_POC_STATE', 'EMPLOYER_POC_POSTAL_CODE',
            'EMPLOYER_POC_COUNTRY', 'EMPLOYER_POC_PROVINCE',
            'EMPLOYER_POC_PHONE', 'EMPLOYER_POC_PHONE_EXT', 'EMPLOYER_POC_EMAIL'
        ],
        'Job Details': [
            'JOB_TITLE', 'SOC_CODE', 'SOC_TITLE', 'JOB_DOMAIN',
            'FULL_TIME_POSITION', 'BEGIN_DATE', 'END_DATE'
        ],
        'Wage Information': [
            'WAGE_RATE_OF_PAY_FROM', 'WAGE_RATE_OF_PAY_TO', 'WAGE_UNIT_OF_PAY',
            'PREVAILING_WAGE', 'PW_UNIT_OF_PAY', 'PW_TRACKING_NUMBER',
            'PW_WAGE_LEVEL', 'PW_OES_YEAR', 'PW_OTHER_SOURCE',
            'PW_OTHER_YEAR', 'PW_SURVEY_PUBLISHER', 'PW_SURVEY_NAME'
        ],
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="relative bg-white border-2 border-gray-200 w-full max-w-4xl shadow-2xl rounded-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b-2 border-gray-100">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            Complete LCA Details
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 font-medium">
                            Case Number: {record.CASE_NUMBER}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* LinkedIn Search Button */}
                {(record.EMPLOYER_POC_FIRST_NAME || record.EMPLOYER_POC_LAST_NAME) && (
                    <div className="mx-6 mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">HR Contact</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {record.EMPLOYER_POC_FIRST_NAME} {record.EMPLOYER_POC_MIDDLE_NAME} {record.EMPLOYER_POC_LAST_NAME}
                                </p>
                                <p className="text-sm text-gray-600">{record.EMPLOYER_POC_JOB_TITLE || 'HR Representative'}</p>
                            </div>
                            <a
                                href={generateLinkedInSearchURL()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                                Search LinkedIn
                            </a>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="max-h-[60vh] overflow-y-auto p-6">
                    {Object.entries(fieldCategories).map(([category, fields]) => {
                        const nonEmptyFields = fields.filter(field =>
                            record[field] !== undefined &&
                            record[field] !== null &&
                            record[field] !== ''
                        );

                        if (nonEmptyFields.length === 0) return null;

                        return (
                            <div key={category} className="mb-6">
                                <h4 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-gray-100">
                                    {category}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {nonEmptyFields.map(field => (
                                        <div key={field} className="text-sm">
                                            <span className="font-semibold text-gray-700">
                                                {formatFieldName(field)}:
                                            </span>
                                            <span className="ml-2 text-gray-900">
                                                {field === 'EMPLOYER_POC_EMAIL' ? (
                                                    <a href={`mailto:${record[field]}`} className="text-blue-600 hover:underline">
                                                        {record[field]}
                                                    </a>
                                                ) : field === 'EMPLOYER_PHONE' || field === 'EMPLOYER_POC_PHONE' ? (
                                                    <a href={`tel:${record[field]}`} className="text-blue-600 hover:underline">
                                                        {record[field]}
                                                    </a>
                                                ) : (
                                                    record[field]
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-6 border-t-2 border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function EmailPage() {
    const [filteredData, setFilteredData] = useState<LCARecord[]>([]);
    const [filterValues, setFilterValues] = useState<any>({});
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);

    // Modal state
    const [selectedRecordForModal, setSelectedRecordForModal] = useState<LCARecord | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 50;

    // Mass email states
    const [resume, setResume] = useState<File | null>(null);
    const [resumeBase64, setResumeBase64] = useState<string>('');
    const [coverLetter, setCoverLetter] = useState('');
    const [isHtml, setIsHtml] = useState(true);
    const [emailSubject, setEmailSubject] = useState('Application for {jobTitle} at {company}');
    const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
    const [sendingProgress, setSendingProgress] = useState<{ total: number, sent: number, failed: number } | null>(null);

    // Application tracking
    const [applications, setApplications] = useState<any[]>([]);
    const [showApplications, setShowApplications] = useState(false);

    // Filter sidebar toggle
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // View mode
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Memoized set of already applied case numbers
    const appliedCaseNumbers = useMemo(() => {
        return new Set(applications.map(app => app.caseNumber).filter(Boolean));
    }, [applications]);

    // Count available positions
    const availableCount = useMemo(() => {
        return filteredData.filter(record =>
            record.EMPLOYER_POC_EMAIL && !appliedCaseNumbers.has(record.CASE_NUMBER)
        ).length;
    }, [filteredData, appliedCaseNumbers]);

    useEffect(() => {
        loadFilterValues();
        loadApplications();
    }, []);

    useEffect(() => {
        loadPageData();
    }, [currentPage, selectedFilters]);

    const loadFilterValues = async () => {
        try {
            const res = await fetch('/api/lca/filter-values');
            const data = await res.json();
            setFilterValues(data);
        } catch (error) {
            console.error('Error loading filters:', error);
        }
    };

    const loadPageData = async () => {
        setDataLoading(true);

        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                pageSize: pageSize.toString()
            });

            if (Object.keys(selectedFilters).length > 0) {
                const activeFilters: Record<string, string[]> = {};
                Object.entries(selectedFilters).forEach(([key, values]) => {
                    if (values.length > 0) {
                        activeFilters[key] = values;
                    }
                });
                if (Object.keys(activeFilters).length > 0) {
                    params.append('filters', JSON.stringify(activeFilters));
                }
            }

            const res = await fetch(`/api/lca/data?${params}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to load data');
            }

            setFilteredData(data.data || []);
            setTotalRecords(data.totalRecords || 0);
            setTotalPages(data.totalPages || 0);

        } catch (error: any) {
            console.error('Error loading data:', error);
        } finally {
            setDataLoading(false);
        }
    };

    const loadApplications = async () => {
        try {
            const res = await fetch('/api/applications/track');
            const data = await res.json();
            setApplications(data.applications || []);
        } catch (error) {
            console.error('Error loading applications:', error);
        }
    };

    const handleFilterChange = (column: string, values: string[]) => {
        setSelectedFilters(prev => ({
            ...prev,
            [column]: values
        }));
        setCurrentPage(1);
        setSelectedCompanies(new Set());
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setResume(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                setResumeBase64(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const detectHtml = (text: string): boolean => {
        const htmlPattern = /<\/?[a-z][\s\S]*>/i;
        return htmlPattern.test(text);
    };

    const handleCoverLetterChange = (newBody: string) => {
        setCoverLetter(newBody);
        if (detectHtml(newBody)) {
            setIsHtml(true);
        }
    };

    const formatEmailBody = (body: string, isHtmlContent: boolean): string => {
        if (isHtmlContent) {
            if (body.trim().toLowerCase().startsWith('<html') || body.trim().toLowerCase().startsWith('<!doctype')) {
                return body;
            }
            return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    ${body}
</body>
</html>`;
        } else {
            return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
    <div style="white-space: pre-wrap;">${body.replace(/\n/g, '<br>')}</div>
</body>
</html>`;
        }
    };

    const toggleCompanySelection = (caseNumber: string) => {
        if (appliedCaseNumbers.has(caseNumber)) {
            return;
        }

        const newSelected = new Set(selectedCompanies);
        if (newSelected.has(caseNumber)) {
            newSelected.delete(caseNumber);
        } else {
            newSelected.add(caseNumber);
        }
        setSelectedCompanies(newSelected);
    };

    const selectAllOnPage = () => {
        const newSelected = new Set(selectedCompanies);
        filteredData.forEach(record => {
            if (record.EMPLOYER_POC_EMAIL && !appliedCaseNumbers.has(record.CASE_NUMBER)) {
                newSelected.add(record.CASE_NUMBER);
            }
        });
        setSelectedCompanies(newSelected);
    };

    const clearSelection = () => {
        setSelectedCompanies(new Set());
    };

    const sendBulkEmails = async () => {
        if (selectedCompanies.size === 0) {
            alert('Please select at least one company');
            return;
        }

        if (!coverLetter.trim()) {
            alert('Please write your cover letter');
            return;
        }

        if (!resume) {
            alert('Please upload your resume');
            return;
        }

        const validSelections = Array.from(selectedCompanies).filter(
            caseNum => !appliedCaseNumbers.has(caseNum)
        );

        if (validSelections.length === 0) {
            alert('All selected companies have already been applied to!');
            return;
        }

        if (validSelections.length !== selectedCompanies.size) {
            const skipped = selectedCompanies.size - validSelections.length;
            if (!confirm(`${skipped} companies were already applied to and will be skipped. Continue with ${validSelections.length} companies?`)) {
                return;
            }
        }

        if (!confirm(`Send ${validSelections.length} emails?\n\nNote: Emails will be sent with delays to prevent rate limiting.`)) {
            return;
        }

        setLoading(true);
        setSendingProgress({ total: validSelections.length, sent: 0, failed: 0 });

        try {
            const recipients = filteredData
                .filter(record =>
                    validSelections.includes(record.CASE_NUMBER) &&
                    record.EMPLOYER_POC_EMAIL &&
                    !appliedCaseNumbers.has(record.CASE_NUMBER)
                )
                .map(record => ({
                    email: record.EMPLOYER_POC_EMAIL,
                    companyName: record.EMPLOYER_NAME,
                    jobTitle: record.JOB_TITLE,
                    caseNumber: record.CASE_NUMBER
                }));

            const formattedBody = formatEmailBody(coverLetter, isHtml);

            const res = await fetch('/api/send-bulk-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients,
                    subject: emailSubject,
                    htmlBody: formattedBody,
                    resumeBase64,
                    resumeName: resume.name
                }),
            });

            const result = await res.json();

            if (res.ok) {
                setSendingProgress({
                    total: result.results.total,
                    sent: result.results.sent,
                    failed: result.results.failed
                });

                alert(`✅ Bulk email completed!\n✉️ Sent: ${result.results.sent}\n❌ Failed: ${result.results.failed}`);

                if (result.results.errors.length > 0) {
                    console.error('Failed emails:', result.results.errors);
                }

                await loadApplications();
                clearSelection();
            } else {
                throw new Error(result.error || 'Failed to send emails');
            }
        } catch (error: any) {
            console.error('Error sending bulk emails:', error);
            alert('Failed to send bulk emails: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const isAlreadyApplied = (caseNumber: string) => {
        return appliedCaseNumbers.has(caseNumber);
    };

    const openModal = (record: LCARecord) => {
        setSelectedRecordForModal(record);
        setIsModalOpen(true);
    };

    return (
        <>
            <Navbar />
            <InfoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                record={selectedRecordForModal}
            />

            <div className="min-h-screen bg-gray-50">
                <div className="flex">
                    {/* Filter Sidebar */}
                    <FilterSidebar
                        filterValues={filterValues}
                        selectedFilters={selectedFilters}
                        onFilterChange={handleFilterChange}
                        onClearAll={() => {
                            setSelectedFilters({});
                            setCurrentPage(1);
                            clearSelection();
                        }}
                        isOpen={isFilterOpen}
                        onToggle={() => setIsFilterOpen(!isFilterOpen)}
                    />

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Top Bar */}
                        <div className="sticky top-0 bg-white border-b-2 border-gray-100 z-30 px-6 py-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                                        className="lg:hidden p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                        </svg>
                                    </button>
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">H1B Cold Email Tool</h1>
                                        <p className="text-sm text-gray-600 font-medium mt-1">
                                            <span className="font-bold text-blue-600">{totalRecords.toLocaleString()}</span> matching records
                                            {availableCount > 0 && (
                                                <span className="ml-3 text-emerald-600 font-bold">
                                                    • {availableCount} available
                                                </span>
                                            )}
                                            {selectedCompanies.size > 0 && (
                                                <span className="ml-3 text-purple-600 font-bold">
                                                    • {selectedCompanies.size} selected
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* View Mode Toggle */}
                                    <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                                                ? 'bg-white shadow-sm text-blue-600'
                                                : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setViewMode('table')}
                                            className={`p-2 rounded-md transition-colors ${viewMode === 'table'
                                                ? 'bg-white shadow-sm text-blue-600'
                                                : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => setShowApplications(!showApplications)}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                                    >
                                        {showApplications ? 'Hide' : 'Show'} Applications ({applications.length})
                                    </button>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatsCard
                                    title="Total Records"
                                    value={totalRecords}
                                    icon={
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    }
                                    color="blue"
                                />
                                <StatsCard
                                    title="Available"
                                    value={availableCount}
                                    subtitle="Not yet applied"
                                    icon={
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    }
                                    color="green"
                                />
                                <StatsCard
                                    title="Selected"
                                    value={selectedCompanies.size}
                                    subtitle="Ready to send"
                                    icon={
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    }
                                    color="purple"
                                />
                                <StatsCard
                                    title="Applied"
                                    value={applications.length}
                                    subtitle="Total sent"
                                    icon={
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    }
                                    color="orange"
                                />
                            </div>
                        </div>

                        {/* Applications List */}
                        {showApplications && applications.length > 0 && (
                            <div className="p-6">
                                <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
                                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
                                        <h2 className="text-xl font-bold text-white">My Applications</h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Company</th>
                                                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Job Title</th>
                                                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Status</th>
                                                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Date Sent</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {applications.slice(0, 10).map((app, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{app.companyName}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-700">{app.jobTitle}</td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === 'sent'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {app.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-700">
                                                            {new Date(app.sentAt).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Companies Grid/List */}
                        <div className="p-6">
                            {/* Action Bar */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {filteredData.length.toLocaleString()} Companies
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={selectAllOnPage}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        Select All Available
                                    </button>
                                    <button
                                        onClick={clearSelection}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors text-sm"
                                    >
                                        Clear Selection
                                    </button>
                                </div>
                            </div>

                            {dataLoading ? (
                                <div className="text-center py-20">
                                    <svg className="animate-spin h-12 w-12 mx-auto text-blue-600 mb-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <p className="text-xl font-bold text-gray-900">Loading companies...</p>
                                </div>
                            ) : filteredData.length === 0 ? (
                                <div className="text-center py-20">
                                    <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-2xl font-bold text-gray-900 mb-2">No results found</p>
                                    <p className="text-gray-600">Try adjusting your filters</p>
                                </div>
                            ) : (
                                <>
                                    {/* Grid View */}
                                    {viewMode === 'grid' && (
                                        <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {filteredData.map((record, idx) => (
                                                <CompanyCard
                                                    key={idx}
                                                    record={record}
                                                    isSelected={selectedCompanies.has(record.CASE_NUMBER)}
                                                    isApplied={isAlreadyApplied(record.CASE_NUMBER)}
                                                    onToggleSelect={() => toggleCompanySelection(record.CASE_NUMBER)}
                                                    onViewDetails={() => openModal(record)}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Table View */}
                                    {viewMode === 'table' && (
                                        <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th scope="col" className="px-6 py-4 text-left">
                                                                <input
                                                                    type="checkbox"
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            selectAllOnPage();
                                                                        } else {
                                                                            clearSelection();
                                                                        }
                                                                    }}
                                                                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            </th>
                                                            <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                                                                Status
                                                            </th>
                                                            <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                                                                Company
                                                            </th>
                                                            <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                                                                Job Title
                                                            </th>
                                                            <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                                                                Domain
                                                            </th>
                                                            <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                                                                Visa Status
                                                            </th>
                                                            <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                                                                Location
                                                            </th>
                                                            <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                                                                Email
                                                            </th>
                                                            <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                                                                Wage
                                                            </th>
                                                            <th scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                                                                Info
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-100">
                                                        {filteredData.map((record, idx) => {
                                                            const alreadyApplied = isAlreadyApplied(record.CASE_NUMBER);
                                                            const canSelect = record.EMPLOYER_POC_EMAIL && !alreadyApplied;

                                                            // Domain color helper
                                                            // Color mapping for job domains
                                                            const getDomainColor = (domain: string): string => {
                                                                const colorMap: Record<string, string> = {
                                                                    'Software Engineering': 'bg-blue-100 text-blue-800 border-blue-200',
                                                                    'AI/ML': 'bg-purple-100 text-purple-800 border-purple-200',
                                                                    'Full-Stack': 'bg-indigo-100 text-indigo-800',
                                                                    'Backend': 'bg-slate-100 text-slate-800 border-slate-200',
                                                                    'Frontend': 'bg-pink-100 text-pink-800',
                                                                    'DevOps': 'bg-green-100 text-green-800 border-green-200',
                                                                    'Data Engineering': 'bg-teal-100 text-teal-800',
                                                                    'Database': 'bg-cyan-100 text-cyan-800 border-cyan-200',
                                                                    'Mobile Development': 'bg-orange-100 text-orange-800',
                                                                    'Security': 'bg-red-100 text-red-800 border-red-200',
                                                                    'QA/Testing': 'bg-yellow-100 text-yellow-800',
                                                                    'Product Management': 'bg-purple-100 text-purple-800 border-purple-200',
                                                                    'Project Management': 'bg-violet-100 text-violet-800',
                                                                    'Business Analyst': 'bg-gray-100 text-gray-800 border-gray-200',
                                                                    'UX/UI Design': 'bg-fuchsia-100 text-fuchsia-800',
                                                                    'Data Analyst': 'bg-emerald-100 text-emerald-800 border-emerald-200',
                                                                    'Financial Analyst': 'bg-lime-100 text-lime-800',
                                                                    'Accountant': 'bg-green-100 text-green-800 border-green-200',
                                                                    'Management': 'bg-stone-100 text-stone-800',
                                                                    'Research': 'bg-indigo-100 text-indigo-800 border-indigo-200',
                                                                    'Mechanical Engineering': 'bg-amber-100 text-amber-800',
                                                                    'Electrical Engineering': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                                                                    'Mechatronics': 'bg-orange-100 text-orange-800 border-orange-200',
                                                                    'Civil Engineering': 'bg-stone-100 text-stone-800',
                                                                    'Chemical Engineering': 'bg-lime-100 text-lime-800 border-lime-200',
                                                                    'Industrial Engineering': 'bg-slate-100 text-slate-800 border-slate-200',
                                                                    'Biomedical Engineering': 'bg-rose-100 text-rose-800 border-rose-200',
                                                                    'Aerospace Engineering': 'bg-sky-100 text-sky-800 border-sky-200',
                                                                    'Hardware Engineering': 'bg-zinc-100 text-zinc-800',
                                                                    'Network Engineering': 'bg-teal-100 text-teal-800',
                                                                    'Systems Engineering': 'bg-blue-100 text-blue-800 border-blue-200',
                                                                    'IT Support': 'bg-cyan-100 text-cyan-800',
                                                                    'Consultant': 'bg-violet-100 text-violet-800',
                                                                    'Sales Engineer': 'bg-emerald-100 text-emerald-800 border-emerald-200',
                                                                    'Sales/Marketing': 'bg-pink-100 text-pink-800 border-pink-200',
                                                                    'HR/Recruiting': 'bg-rose-100 text-rose-800',
                                                                    'Legal': 'bg-slate-100 text-slate-800 border-slate-200',
                                                                    'Operations': 'bg-gray-100 text-gray-800 border-gray-200',
                                                                    'Content/Writing': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
                                                                    'Architecture': 'bg-indigo-100 text-indigo-800 border-indigo-200',
                                                                    'Academic/Teaching': 'bg-blue-100 text-blue-800',
                                                                    'Healthcare': 'bg-red-100 text-red-800 border-red-200',
                                                                    'Finance': 'bg-green-100 text-green-800 border-green-200',
                                                                    'Other': 'bg-gray-100 text-gray-800 border-gray-200'
                                                                };

                                                                return colorMap[domain] || 'bg-gray-100 text-gray-800 border-gray-200';
                                                            };

                                                            // Visa status color helper
                                                            const getVisaStatusColor = (status: string): string => {
                                                                const statusLower = status.toLowerCase();
                                                                if (statusLower.includes('certified') && !statusLower.includes('withdrawn')) {
                                                                    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                                                                } else if (statusLower.includes('withdrawn')) {
                                                                    return 'bg-amber-100 text-amber-800 border-amber-200';
                                                                } else if (statusLower.includes('denied')) {
                                                                    return 'bg-red-100 text-red-800 border-red-200';
                                                                }
                                                                return 'bg-blue-100 text-blue-800 border-blue-200';
                                                            };

                                                            return (
                                                                <tr
                                                                    key={idx}
                                                                    className={`${alreadyApplied ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'} transition-colors`}
                                                                >
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={selectedCompanies.has(record.CASE_NUMBER)}
                                                                            onChange={() => toggleCompanySelection(record.CASE_NUMBER)}
                                                                            disabled={!canSelect}
                                                                            className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 disabled:opacity-30 disabled:cursor-not-allowed"
                                                                            title={alreadyApplied ? 'Already applied' : !record.EMPLOYER_POC_EMAIL ? 'No email available' : ''}
                                                                        />
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        {alreadyApplied ? (
                                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                                                Applied ✓
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                                                                Available
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 max-w-xs truncate">
                                                                        {record.EMPLOYER_NAME}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                                                                        {record.JOB_TITLE}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        {record.JOB_DOMAIN && (
                                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getDomainColor(record.JOB_DOMAIN)}`}>
                                                                                {record.JOB_DOMAIN}
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold border ${getVisaStatusColor(record.CASE_STATUS)}`}>
                                                                            {record.CASE_STATUS}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                                                                        {record.EMPLOYER_CITY}, {record.EMPLOYER_STATE}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm text-blue-600 max-w-xs truncate">
                                                                        {record.EMPLOYER_POC_EMAIL || (
                                                                            <span className="text-gray-400 font-medium">No email</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                                                                        ${record.WAGE_RATE_OF_PAY_FROM}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <button
                                                                            onClick={() => openModal(record)}
                                                                            className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                            title="View all details"
                                                                        >
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    <div className="flex items-center justify-between mt-8">
                                        <div className="text-sm text-gray-600 font-medium">
                                            Page {currentPage} of {totalPages.toLocaleString()}
                                            <span className="ml-2 text-gray-500">
                                                ({((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords.toLocaleString()})
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1 || dataLoading}
                                                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-gray-900 transition-colors"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages || dataLoading}
                                                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-gray-900 transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Email Composer - Fixed Bottom */}
                        <div className="p-6">
                            <EmailComposer
                                emailSubject={emailSubject}
                                setEmailSubject={setEmailSubject}
                                coverLetter={coverLetter}
                                setCoverLetter={handleCoverLetterChange}
                                isHtml={isHtml}
                                setIsHtml={setIsHtml}
                                resume={resume}
                                onResumeUpload={handleResumeUpload}
                                selectedCount={selectedCompanies.size}
                                onSend={sendBulkEmails}
                                loading={loading}
                                sendingProgress={sendingProgress}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}