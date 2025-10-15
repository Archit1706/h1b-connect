// app/email/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import MultiSelectFilter from '@/components/MultiSelectFilter';
import { LCARecord } from '@/types';

// Color mapping for job domains
const getDomainColor = (domain: string): string => {
    const colorMap: Record<string, string> = {
        'Software Engineering': 'bg-blue-100 text-blue-800',
        'AI/ML': 'bg-purple-100 text-purple-800',
        'Full-Stack': 'bg-indigo-100 text-indigo-800',
        'Backend': 'bg-slate-100 text-slate-800',
        'Frontend': 'bg-pink-100 text-pink-800',
        'DevOps': 'bg-green-100 text-green-800',
        'Data Engineering': 'bg-teal-100 text-teal-800',
        'Database': 'bg-cyan-100 text-cyan-800',
        'Mobile Development': 'bg-orange-100 text-orange-800',
        'Security': 'bg-red-100 text-red-800',
        'QA/Testing': 'bg-yellow-100 text-yellow-800',
        'Product Management': 'bg-purple-100 text-purple-800',
        'Project Management': 'bg-violet-100 text-violet-800',
        'Business Analyst': 'bg-gray-100 text-gray-800',
        'UX/UI Design': 'bg-fuchsia-100 text-fuchsia-800',
        'Data Analyst': 'bg-emerald-100 text-emerald-800',
        'Financial Analyst': 'bg-lime-100 text-lime-800',
        'Accountant': 'bg-green-100 text-green-800',
        'Management': 'bg-stone-100 text-stone-800',
        'Research': 'bg-indigo-100 text-indigo-800',
        'Mechanical Engineering': 'bg-amber-100 text-amber-800',
        'Electrical Engineering': 'bg-yellow-100 text-yellow-800',
        'Mechatronics': 'bg-orange-100 text-orange-800',
        'Civil Engineering': 'bg-stone-100 text-stone-800',
        'Chemical Engineering': 'bg-lime-100 text-lime-800',
        'Industrial Engineering': 'bg-slate-100 text-slate-800',
        'Biomedical Engineering': 'bg-rose-100 text-rose-800',
        'Aerospace Engineering': 'bg-sky-100 text-sky-800',
        'Hardware Engineering': 'bg-zinc-100 text-zinc-800',
        'Network Engineering': 'bg-teal-100 text-teal-800',
        'Systems Engineering': 'bg-blue-100 text-blue-800',
        'IT Support': 'bg-cyan-100 text-cyan-800',
        'Consultant': 'bg-violet-100 text-violet-800',
        'Sales Engineer': 'bg-emerald-100 text-emerald-800',
        'Sales/Marketing': 'bg-pink-100 text-pink-800',
        'HR/Recruiting': 'bg-rose-100 text-rose-800',
        'Legal': 'bg-slate-100 text-slate-800',
        'Operations': 'bg-gray-100 text-gray-800',
        'Content/Writing': 'bg-fuchsia-100 text-fuchsia-800',
        'Architecture': 'bg-indigo-100 text-indigo-800',
        'Academic/Teaching': 'bg-blue-100 text-blue-800',
        'Healthcare': 'bg-red-100 text-red-800',
        'Finance': 'bg-green-100 text-green-800',
        'Other': 'bg-gray-100 text-gray-800'
    };

    return colorMap[domain] || 'bg-gray-100 text-gray-800';
};

// Color mapping for visa case status
const getVisaStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();

    if (statusLower.includes('certified') && !statusLower.includes('withdrawn')) {
        return 'bg-green-100 text-green-800 border-green-200';
    } else if (statusLower.includes('certified') && statusLower.includes('withdrawn')) {
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (statusLower.includes('withdrawn')) {
        return 'bg-gray-100 text-gray-800 border-gray-200';
    } else if (statusLower.includes('denied')) {
        return 'bg-red-100 text-red-800 border-red-200';
    } else {
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
};

export default function EmailPage() {
    const [filteredData, setFilteredData] = useState<LCARecord[]>([]);
    const [filterValues, setFilterValues] = useState<any>({});
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
    const [applicationsLoading, setApplicationsLoading] = useState(true);

    // Memoized set of already applied case numbers for O(1) lookup
    const appliedCaseNumbers = useMemo(() => {
        return new Set(applications.map(app => app.caseNumber).filter(Boolean));
    }, [applications]);

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
        setError(null);

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
            setError(error.message);
        } finally {
            setDataLoading(false);
        }
    };

    const loadApplications = async () => {
        setApplicationsLoading(true);
        try {
            const res = await fetch('/api/applications/track');
            const data = await res.json();
            setApplications(data.applications || []);
        } catch (error) {
            console.error('Error loading applications:', error);
        } finally {
            setApplicationsLoading(false);
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

            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                setResumeBase64(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    // Auto-detect if content is HTML
    const detectHtml = (text: string): boolean => {
        const htmlPattern = /<\/?[a-z][\s\S]*>/i;
        return htmlPattern.test(text);
    };

    const handleCoverLetterChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newBody = e.target.value;
        setCoverLetter(newBody);

        // Auto-detect HTML
        if (detectHtml(newBody)) {
            setIsHtml(true);
        }
    };

    const formatEmailBody = (body: string, isHtmlContent: boolean): string => {
        if (isHtmlContent) {
            // If it's already complete HTML (has <html> tag), use as-is
            if (body.trim().toLowerCase().startsWith('<html') || body.trim().toLowerCase().startsWith('<!doctype')) {
                return body;
            }
            // Otherwise, wrap in minimal HTML structure
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
            // Plain text - convert to HTML with line breaks
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
        // Don't allow selecting if already applied
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
            // Only select if has email and NOT already applied
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

        // Filter out any already-applied positions (extra safety check)
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
            // Get all selected records with emails, excluding already applied
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

            // Format the email body properly
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

                // Reload applications to update the applied list
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

    // Check if a record has been applied to
    const isAlreadyApplied = (caseNumber: string) => {
        return appliedCaseNumbers.has(caseNumber);
    };

    // Count available positions (not applied yet)
    const availableCount = useMemo(() => {
        return filteredData.filter(record =>
            record.EMPLOYER_POC_EMAIL && !appliedCaseNumbers.has(record.CASE_NUMBER)
        ).length;
    }, [filteredData, appliedCaseNumbers]);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Mass H1B Cold Email Tool</h1>
                            <p className="text-sm text-gray-700 font-medium mt-2">
                                Database: <span className="font-bold text-blue-600">{totalRecords.toLocaleString()}</span> matching records
                                {availableCount > 0 && (
                                    <span className="ml-4 text-emerald-600 font-bold">
                                        • {availableCount} available to apply
                                    </span>
                                )}
                                {selectedCompanies.size > 0 && (
                                    <span className="ml-4 text-green-600 font-bold">
                                        • {selectedCompanies.size} selected
                                    </span>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowApplications(!showApplications)}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
                        >
                            {showApplications ? 'Hide' : 'Show'} Applications ({applications.length})
                        </button>
                    </div>

                    {/* Application Tracking */}
                    {showApplications && applications.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-2xl font-semibold mb-4">My Applications</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-bold">Company</th>
                                            <th className="px-4 py-3 text-left text-sm font-bold">Job Title</th>
                                            <th className="px-4 py-3 text-left text-sm font-bold">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-bold">Sent At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.slice(0, 10).map((app, idx) => (
                                            <tr key={idx} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm">{app.companyName}</td>
                                                <td className="px-4 py-3 text-sm">{app.jobTitle}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${app.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {new Date(app.sentAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Filter Target Companies</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <MultiSelectFilter
                                label="Job Domain"
                                options={filterValues.JOB_DOMAIN || []}
                                selectedValues={selectedFilters.JOB_DOMAIN || []}
                                onChange={(values) => handleFilterChange('JOB_DOMAIN', values)}
                            />
                            <MultiSelectFilter
                                label="Job Title"
                                options={filterValues.JOB_TITLE || []}
                                selectedValues={selectedFilters.JOB_TITLE || []}
                                onChange={(values) => handleFilterChange('JOB_TITLE', values)}
                            />
                            <MultiSelectFilter
                                label="SOC Title"
                                options={filterValues.SOC_TITLE || []}
                                selectedValues={selectedFilters.SOC_TITLE || []}
                                onChange={(values) => handleFilterChange('SOC_TITLE', values)}
                            />
                            <MultiSelectFilter
                                label="State"
                                options={filterValues.EMPLOYER_STATE || []}
                                selectedValues={selectedFilters.EMPLOYER_STATE || []}
                                onChange={(values) => handleFilterChange('EMPLOYER_STATE', values)}
                            />
                            <MultiSelectFilter
                                label="City"
                                options={filterValues.EMPLOYER_CITY || []}
                                selectedValues={selectedFilters.EMPLOYER_CITY || []}
                                onChange={(values) => handleFilterChange('EMPLOYER_CITY', values)}
                            />
                            <MultiSelectFilter
                                label="Case Status"
                                options={filterValues.CASE_STATUS || []}
                                selectedValues={selectedFilters.CASE_STATUS || []}
                                onChange={(values) => handleFilterChange('CASE_STATUS', values)}
                            />
                            <MultiSelectFilter
                                label="Wage Level"
                                options={filterValues.PW_WAGE_LEVEL || []}
                                selectedValues={selectedFilters.PW_WAGE_LEVEL || []}
                                onChange={(values) => handleFilterChange('PW_WAGE_LEVEL', values)}
                            />
                        </div>
                        <button
                            onClick={() => {
                                setSelectedFilters({});
                                setCurrentPage(1);
                                clearSelection();
                            }}
                            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700"
                        >
                            Clear All Filters
                        </button>
                    </div>

                    {/* Results Table */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">Filtered Companies</h2>
                            <div className="space-x-2">
                                <button
                                    onClick={selectAllOnPage}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                                >
                                    Select All Available
                                </button>
                                <button
                                    onClick={clearSelection}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>

                        {dataLoading ? (
                            <div className="text-center py-12">
                                <p className="text-xl font-bold">Loading...</p>
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-xl font-bold mb-2">No results found</p>
                                <p className="text-gray-700">Try adjusting your filters</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left">
                                                    <input
                                                        type="checkbox"
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                selectAllOnPage();
                                                            } else {
                                                                clearSelection();
                                                            }
                                                        }}
                                                        className="w-4 h-4"
                                                    />
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-bold">Status</th>
                                                <th className="px-4 py-3 text-left text-sm font-bold">Company</th>
                                                <th className="px-4 py-3 text-left text-sm font-bold">Job Title</th>
                                                <th className="px-4 py-3 text-left text-sm font-bold">Domain</th>
                                                <th className="px-4 py-3 text-left text-sm font-bold">Visa Status</th>
                                                <th className="px-4 py-3 text-left text-sm font-bold">Location</th>
                                                <th className="px-4 py-3 text-left text-sm font-bold">Email</th>
                                                <th className="px-4 py-3 text-left text-sm font-bold">Wage</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.map((record, idx) => {
                                                const alreadyApplied = isAlreadyApplied(record.CASE_NUMBER);
                                                const canSelect = record.EMPLOYER_POC_EMAIL && !alreadyApplied;

                                                return (
                                                    <tr key={idx} className={`border-b ${alreadyApplied ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}`}>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCompanies.has(record.CASE_NUMBER)}
                                                                onChange={() => toggleCompanySelection(record.CASE_NUMBER)}
                                                                disabled={!canSelect}
                                                                className="w-4 h-4 disabled:opacity-30 disabled:cursor-not-allowed"
                                                                title={alreadyApplied ? 'Already applied' : !record.EMPLOYER_POC_EMAIL ? 'No email available' : ''}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {alreadyApplied ? (
                                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                                                    Applied ✓
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                                                    Available
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-medium">{record.EMPLOYER_NAME}</td>
                                                        <td className="px-4 py-3 text-sm">{record.JOB_TITLE}</td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDomainColor(record.JOB_DOMAIN || 'Other')}`}>
                                                                {record.JOB_DOMAIN || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getVisaStatusColor(record.CASE_STATUS)}`}>
                                                                {record.CASE_STATUS}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">{record.EMPLOYER_CITY}, {record.EMPLOYER_STATE}</td>
                                                        <td className="px-4 py-3 text-sm text-blue-600">
                                                            {record.EMPLOYER_POC_EMAIL || 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm font-bold">{record.WAGE_RATE_OF_PAY_FROM}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="flex justify-between items-center mt-6">
                                    <div className="text-sm font-medium">
                                        Page {currentPage} of {totalPages.toLocaleString()}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1 || dataLoading}
                                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages || dataLoading}
                                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Email Composition */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Compose Mass Email</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2">Email Subject</label>
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    placeholder="Use {company} and {jobTitle} for personalization"
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    Tip: Use {'{company}'} and {'{jobTitle}'} placeholders for personalization
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">Upload Resume (PDF)</label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleResumeUpload}
                                    className="w-full px-4 py-2 border rounded-lg"
                                />
                                {resume && (
                                    <p className="text-sm text-green-700 font-semibold mt-1">✓ {resume.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">Email Body Type</label>
                                <div className="flex items-center space-x-4 mb-2">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={!isHtml}
                                            onChange={() => setIsHtml(false)}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-sm font-medium">Plain Text</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={isHtml}
                                            onChange={() => setIsHtml(true)}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-sm font-medium">HTML</span>
                                    </label>
                                </div>
                                {isHtml && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                                        <p className="text-xs text-yellow-800 font-medium">
                                            ⚠️ HTML Mode: Paste your raw HTML code below. Use {'{company}'} and {'{jobTitle}'} for personalization.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">Cover Letter / Email Body</label>
                                <textarea
                                    value={coverLetter}
                                    onChange={handleCoverLetterChange}
                                    placeholder={isHtml
                                        ? "Paste your raw HTML here with {company} and {jobTitle} placeholders...\n\n<html>\n<body>\n  <p>Dear Hiring Manager at {company},</p>\n  <p>I'm interested in the {jobTitle} position...</p>\n</body>\n</html>"
                                        : "Write your generic cover letter here. Use {company} and {jobTitle} for automatic personalization.\n\nDear Hiring Manager at {company},\n\nI am writing to express my interest in the {jobTitle} position..."
                                    }
                                    rows={16}
                                    className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                                    style={{ whiteSpace: 'pre-wrap' }}
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    {isHtml
                                        ? 'Paste complete HTML or HTML fragments. Use {company} and {jobTitle} for personalization.'
                                        : 'This will be sent to all selected companies with automatic personalization using {company} and {jobTitle}.'
                                    }
                                </p>
                            </div>

                            {/* Preview */}
                            {coverLetter && (
                                <div>
                                    <label className="block text-sm font-bold mb-2">
                                        Preview (with sample data)
                                    </label>
                                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-96 overflow-auto">
                                        {isHtml ? (
                                            <div dangerouslySetInnerHTML={{
                                                __html: coverLetter
                                                    .replace(/\{company\}/gi, 'Sample Company Inc.')
                                                    .replace(/\{jobTitle\}/gi, 'Software Engineer')
                                            }} />
                                        ) : (
                                            <div style={{ whiteSpace: 'pre-wrap' }}>
                                                {coverLetter
                                                    .replace(/\{company\}/g, 'Sample Company Inc.')
                                                    .replace(/\{jobTitle\}/g, 'Software Engineer')}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Preview shows how your email will look with sample company name and job title
                                    </p>
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800 font-medium">
                                    ℹ️ <strong>Note:</strong> Emails will be sent with delays between each message to prevent rate limiting and ensure deliverability.
                                    This process may take several minutes for large batches.
                                </p>
                            </div>

                            <button
                                onClick={sendBulkEmails}
                                disabled={loading || selectedCompanies.size === 0 || !resume || !coverLetter.trim()}
                                className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading
                                    ? `Sending... ${sendingProgress?.sent || 0}/${sendingProgress?.total || 0}`
                                    : `📧 Send to ${selectedCompanies.size} Companies`
                                }
                            </button>

                            {sendingProgress && !loading && (
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="font-bold text-green-600">
                                        ✅ Sent: {sendingProgress.sent}
                                    </p>
                                    <p className="font-bold text-red-600">
                                        ❌ Failed: {sendingProgress.failed}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}