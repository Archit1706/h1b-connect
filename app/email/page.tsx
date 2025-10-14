// app/email/page.tsx - MASS EMAIL VERSION
'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MultiSelectFilter from '@/components/MultiSelectFilter';
import { LCARecord } from '@/types';

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
    const [emailSubject, setEmailSubject] = useState('Application for {jobTitle} at {company}');
    const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
    const [sendingProgress, setSendingProgress] = useState<{ total: number, sent: number, failed: number } | null>(null);

    // Application tracking
    const [applications, setApplications] = useState<any[]>([]);
    const [showApplications, setShowApplications] = useState(false);

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

            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                setResumeBase64(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleCompanySelection = (caseNumber: string) => {
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
            if (record.EMPLOYER_POC_EMAIL) {
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

        if (!confirm(`Send ${selectedCompanies.size} emails?`)) {
            return;
        }

        setLoading(true);
        setSendingProgress({ total: selectedCompanies.size, sent: 0, failed: 0 });

        try {
            // Get all selected records with emails
            const recipients = filteredData
                .filter(record => selectedCompanies.has(record.CASE_NUMBER) && record.EMPLOYER_POC_EMAIL)
                .map(record => ({
                    email: record.EMPLOYER_POC_EMAIL,
                    companyName: record.EMPLOYER_NAME,
                    jobTitle: record.JOB_TITLE,
                    caseNumber: record.CASE_NUMBER
                }));

            const res = await fetch('/api/send-bulk-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients,
                    subject: emailSubject,
                    htmlBody: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        ${coverLetter.replace(/\n/g, '<br>')}
                    </div>`,
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

                loadApplications();
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
                                    Select All on Page
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
                                                <th className="px-4 py-3 text-left text-sm font-bold">Company</th>
                                                <th className="px-4 py-3 text-left text-sm font-bold">Job Title</th>
                                                <th className="px-4 py-3 text-left text-sm font-bold">Location</th>
                                                <th className="px-4 py-3 text-left text-sm font-bold">Email</th>
                                                <th className="px-4 py-3 text-left text-sm font-bold">Wage</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.map((record, idx) => (
                                                <tr key={idx} className="border-b hover:bg-gray-50">
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCompanies.has(record.CASE_NUMBER)}
                                                            onChange={() => toggleCompanySelection(record.CASE_NUMBER)}
                                                            disabled={!record.EMPLOYER_POC_EMAIL}
                                                            className="w-4 h-4"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-medium">{record.EMPLOYER_NAME}</td>
                                                    <td className="px-4 py-3 text-sm">{record.JOB_TITLE}</td>
                                                    <td className="px-4 py-3 text-sm">{record.EMPLOYER_CITY}, {record.EMPLOYER_STATE}</td>
                                                    <td className="px-4 py-3 text-sm text-blue-600">
                                                        {record.EMPLOYER_POC_EMAIL || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-bold">{record.WAGE_RATE_OF_PAY_FROM}</td>
                                                </tr>
                                            ))}
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
                                <label className="block text-sm font-bold mb-2">Cover Letter</label>
                                <textarea
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    placeholder="Write your generic cover letter here. Use {company} and {jobTitle} for automatic personalization.&#10;&#10;Dear Hiring Manager at {company},&#10;&#10;I am writing to express my interest in the {jobTitle} position..."
                                    rows={12}
                                    className="w-full px-4 py-2 border rounded-lg font-mono text-sm"
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    This will be sent to all selected companies with automatic personalization
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