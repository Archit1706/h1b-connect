// app/email/page.tsx - UPDATED
// app/email/page.tsx - PAGINATED VERSION
'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MultiSelectFilter from '@/components/MultiSelectFilter';
import { LCARecord } from '@/types';

export default function EmailPage() {
    const [filteredData, setFilteredData] = useState<LCARecord[]>([]);
    const [filterValues, setFilterValues] = useState<any>({});
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
    const [selectedRecord, setSelectedRecord] = useState<LCARecord | null>(null);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 100;

    // Email generation states
    const [resume, setResume] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [generatedEmail, setGeneratedEmail] = useState('');
    const [emailSubject, setEmailSubject] = useState('');

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

            // Add filters if any
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
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleRecordSelect = (record: LCARecord) => {
        setSelectedRecord(record);
        setEmailSubject(`Application for ${record.JOB_TITLE} Position at ${record.EMPLOYER_NAME}`);
    };

    const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResume(e.target.files[0]);
        }
    };

    const generateCoverLetter = async () => {
        if (!resume || !selectedRecord) {
            alert('Please select a company/job and upload your resume');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('resume', resume);
            formData.append('jobTitle', selectedRecord.JOB_TITLE);
            formData.append('companyName', selectedRecord.EMPLOYER_NAME);
            formData.append('jobDescription', jobDescription);

            const res = await fetch('/api/generate-cover-letter', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            setGeneratedEmail(data.coverLetter);
        } catch (error) {
            console.error('Error generating cover letter:', error);
            alert('Failed to generate cover letter');
        } finally {
            setLoading(false);
        }
    };

    const sendEmail = async () => {
        if (!generatedEmail || !selectedRecord) {
            alert('Please generate a cover letter first');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: selectedRecord.EMPLOYER_POC_EMAIL || 'hr@company.com',
                    subject: emailSubject,
                    htmlBody: generatedEmail,
                    companyName: selectedRecord.EMPLOYER_NAME,
                    jobTitle: selectedRecord.JOB_TITLE,
                    caseNumber: selectedRecord.CASE_NUMBER,
                    lcaData: selectedRecord
                }),
            });

            if (res.ok) {
                alert('Email sent and tracked successfully!');
                loadApplications();
            } else {
                throw new Error('Failed to send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            alert('Failed to send email');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Error Loading Data</h2>
                        <p className="text-gray-900 font-medium mb-4">{error}</p>
                        <button
                            onClick={loadPageData}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
                        >
                            🔄 Retry
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">H1B Job Search Tool</h1>
                            <p className="text-sm text-gray-700 font-medium mt-2">
                                Database: <span className="font-bold text-blue-600">{totalRecords.toLocaleString()}</span> records
                            </p>
                        </div>
                        <button
                            onClick={() => setShowApplications(!showApplications)}
                            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
                        >
                            {showApplications ? 'Hide' : 'Show'} My Applications ({applications.length})
                        </button>
                    </div>

                    {/* Application Tracking Section */}
                    {showApplications && applications.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">My Applications</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Company</th>
                                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Job Title</th>
                                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Domain</th>
                                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Sent At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map((app, idx) => (
                                            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{app.companyName}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{app.jobTitle}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-700">{app.employerDomain}</td>
                                                <td className="px-4 py-3 text-sm font-semibold">
                                                    <span className={`px-2 py-1 rounded-full ${app.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-700">
                                                    {new Date(app.sentAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Filters Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Search & Filter</h2>
                        <p className="text-sm text-gray-700 font-medium mb-4">
                            Showing: <span className="font-bold text-gray-900">{totalRecords.toLocaleString()}</span> matching records
                        </p>

                        <div className="grid md:grid-cols-3 gap-6">
                            <MultiSelectFilter
                                label="Case Status"
                                options={filterValues.CASE_STATUS || []}
                                selectedValues={selectedFilters.CASE_STATUS || []}
                                onChange={(values) => handleFilterChange('CASE_STATUS', values)}
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
                                label="Visa Class"
                                options={filterValues.VISA_CLASS || []}
                                selectedValues={selectedFilters.VISA_CLASS || []}
                                onChange={(values) => handleFilterChange('VISA_CLASS', values)}
                            />

                            <MultiSelectFilter
                                label="Wage Level"
                                options={filterValues.PW_WAGE_LEVEL || []}
                                selectedValues={selectedFilters.PW_WAGE_LEVEL || []}
                                onChange={(values) => handleFilterChange('PW_WAGE_LEVEL', values)}
                            />

                            <MultiSelectFilter
                                label="Full Time Position"
                                options={filterValues.FULL_TIME_POSITION || []}
                                selectedValues={selectedFilters.FULL_TIME_POSITION || []}
                                onChange={(values) => handleFilterChange('FULL_TIME_POSITION', values)}
                            />

                            <MultiSelectFilter
                                label="H1B Dependent"
                                options={filterValues.H_1B_DEPENDENT || []}
                                selectedValues={selectedFilters.H_1B_DEPENDENT || []}
                                onChange={(values) => handleFilterChange('H_1B_DEPENDENT', values)}
                            />
                        </div>

                        <button
                            onClick={() => {
                                setSelectedFilters({});
                                setCurrentPage(1);
                            }}
                            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700"
                        >
                            Clear All Filters
                        </button>
                    </div>

                    {/* Results Table */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Search Results</h2>

                        {dataLoading ? (
                            <div className="text-center py-12">
                                <p className="text-xl font-bold text-gray-900">Loading...</p>
                            </div>
                        ) : filteredData.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-xl font-bold text-gray-900 mb-2">No results found</p>
                                <p className="text-gray-700 font-medium">Try adjusting your filters</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Company</th>
                                                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Job Title</th>
                                                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Location</th>
                                                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Wage</th>
                                                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Status</th>
                                                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.map((record, idx) => (
                                                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.EMPLOYER_NAME}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{record.JOB_TITLE}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{record.EMPLOYER_CITY}, {record.EMPLOYER_STATE}</td>
                                                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{record.WAGE_RATE_OF_PAY_FROM}</td>
                                                    <td className="px-4 py-3 text-sm font-semibold text-green-700">{record.CASE_STATUS}</td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() => handleRecordSelect(record)}
                                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                                                        >
                                                            Select
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="flex justify-between items-center mt-6">
                                    <div className="text-sm font-medium text-gray-700">
                                        Page {currentPage} of {totalPages.toLocaleString()} ({totalRecords.toLocaleString()} total records)
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1 || dataLoading}
                                            className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <span className="px-4 py-2 text-gray-900 font-bold">
                                            Page {currentPage}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages || dataLoading}
                                            className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Selected Position Details */}
                    {selectedRecord && (
                        <>
                            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Position Details</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-700 font-semibold">Company</p>
                                        <p className="font-bold text-gray-900">{selectedRecord.EMPLOYER_NAME}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-700 font-semibold">Job Title</p>
                                        <p className="font-bold text-gray-900">{selectedRecord.JOB_TITLE}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-700 font-semibold">Location</p>
                                        <p className="font-bold text-gray-900">{selectedRecord.EMPLOYER_CITY}, {selectedRecord.EMPLOYER_STATE}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-700 font-semibold">Wage</p>
                                        <p className="font-bold text-gray-900">{selectedRecord.WAGE_RATE_OF_PAY_FROM}/year</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-700 font-semibold">Position Type</p>
                                        <p className="font-bold text-gray-900">{selectedRecord.FULL_TIME_POSITION === 'Y' ? 'Full Time' : 'Part Time'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-700 font-semibold">Case Status</p>
                                        <p className="font-bold text-green-700">{selectedRecord.CASE_STATUS}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Email Generation Section */}
                            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Generate Cover Letter</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Upload Resume (PDF)</label>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleResumeUpload}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium"
                                        />
                                        {resume && (
                                            <p className="text-sm text-green-700 font-semibold mt-1">✓ {resume.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">
                                            Job Description (Optional)
                                        </label>
                                        <textarea
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="Paste the job description here for a more tailored cover letter..."
                                            rows={6}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                                        />
                                    </div>

                                    <button
                                        onClick={generateCoverLetter}
                                        disabled={loading || !resume}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Generating...' : '✨ Generate Cover Letter with AI'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Email Preview */}
                    {generatedEmail && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Email Preview</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">To</label>
                                    <input
                                        type="email"
                                        value={selectedRecord?.EMPLOYER_POC_EMAIL || 'hr@company.com'}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-medium"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Subject</label>
                                    <input
                                        type="text"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Body</label>
                                    <div
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 min-h-[300px] overflow-auto text-gray-900"
                                        dangerouslySetInnerHTML={{ __html: generatedEmail }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">Attachment</label>
                                    <p className="text-sm text-gray-700 font-medium">
                                        {resume ? `📎 ${resume.name}` : 'No attachment'}
                                    </p>
                                </div>

                                <button
                                    onClick={sendEmail}
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : '📧 Send Email'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}