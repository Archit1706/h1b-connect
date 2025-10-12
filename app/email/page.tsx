'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { LCARecord } from '@/types';

export default function EmailPage() {
    const [companies, setCompanies] = useState<string[]>([]);
    const [jobTitles, setJobTitles] = useState<string[]>([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedJobTitle, setSelectedJobTitle] = useState('');
    const [filters, setFilters] = useState<any[]>([]);
    const [lcaData, setLcaData] = useState<LCARecord[]>([]);
    const [selectedRecord, setSelectedRecord] = useState<LCARecord | null>(null);

    // Email generation states
    const [resume, setResume] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [generatedEmail, setGeneratedEmail] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [loading, setLoading] = useState(false);

    // Load initial data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // In production, fetch from API
        // For now, using sample data structure
        const sampleCompanies = [
            'Urban Outfitters, Inc.',
            'Illinois Wesleyan University',
            'TRUSTEES OF THE UNIVERSITY OF PENNSYLVANIA',
            'Accenture LLP'
        ];

        const sampleJobTitles = [
            'Data Scientists',
            'IT Technical Associate - Developer II',
            'Research Associate',
            'Business Architecture Manager'
        ];

        setCompanies(sampleCompanies);
        setJobTitles(sampleJobTitles);
    };

    const addFilter = () => {
        setFilters([...filters, { type: 'state', value: '', id: Date.now() }]);
    };

    const removeFilter = (id: number) => {
        setFilters(filters.filter(f => f.id !== id));
    };

    const updateFilter = (id: number, field: string, value: string) => {
        setFilters(filters.map(f =>
            f.id === id ? { ...f, [field]: value } : f
        ));
    };

    const handleCompanySelect = (company: string) => {
        setSelectedCompany(company);
        // Load corresponding job titles for this company
    };

    const handleJobTitleSelect = (jobTitle: string) => {
        setSelectedJobTitle(jobTitle);
        // Load LCA record for this combination
        // Mock data - replace with actual API call
        const mockRecord: LCARecord = {
            CASE_NUMBER: 'I-200-25181-143446',
            CASE_STATUS: 'Certified',
            EMPLOYER_NAME: selectedCompany,
            JOB_TITLE: jobTitle,
            SOC_TITLE: 'Data Scientists',
            EMPLOYER_CITY: 'Philadelphia',
            EMPLOYER_STATE: 'PA',
            WAGE_RATE_OF_PAY_FROM: '$175,000.00',
            EMPLOYER_POC_EMAIL: 'hr@company.com',
            EMPLOYER_ADDRESS1: '5000 South Broad Street',
            EMPLOYER_POSTAL_CODE: '19112',
            BEGIN_DATE: '7/14/2025',
            END_DATE: '7/13/2028',
            FULL_TIME_POSITION: 'Y',
        };
        setSelectedRecord(mockRecord);
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
            setEmailSubject(`Application for ${selectedRecord.JOB_TITLE} Position at ${selectedRecord.EMPLOYER_NAME}`);
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
                    resumePath: resume ? URL.createObjectURL(resume) : null,
                }),
            });

            if (res.ok) {
                alert('Email sent successfully!');
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

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-8">Cold Email Tool</h1>

                    {/* Filters Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-2xl font-semibold mb-4">Search & Filter</h2>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Company</label>
                                <select
                                    value={selectedCompany}
                                    onChange={(e) => handleCompanySelect(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Company</option>
                                    {companies.map((company) => (
                                        <option key={company} value={company}>{company}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Job Title</label>
                                <select
                                    value={selectedJobTitle}
                                    onChange={(e) => handleJobTitleSelect(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    disabled={!selectedCompany}
                                >
                                    <option value="">Select Job Title</option>
                                    {jobTitles.map((title) => (
                                        <option key={title} value={title}>{title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <button
                                onClick={addFilter}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                + Add Filter
                            </button>
                        </div>

                        {filters.map((filter) => (
                            <div key={filter.id} className="flex gap-2 mb-2">
                                <select
                                    value={filter.type}
                                    onChange={(e) => updateFilter(filter.id, 'type', e.target.value)}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    <option value="state">State</option>
                                    <option value="wage">Min Wage</option>
                                    <option value="status">Status</option>
                                </select>
                                <input
                                    type="text"
                                    value={filter.value}
                                    onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                                    placeholder="Filter value"
                                    className="flex-1 px-4 py-2 border rounded-lg"
                                />
                                <button
                                    onClick={() => removeFilter(filter.id)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* LCA Record Details */}
                    {selectedRecord && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Position Details</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Company</p>
                                    <p className="font-semibold">{selectedRecord.EMPLOYER_NAME}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Job Title</p>
                                    <p className="font-semibold">{selectedRecord.JOB_TITLE}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Location</p>
                                    <p className="font-semibold">{selectedRecord.EMPLOYER_CITY}, {selectedRecord.EMPLOYER_STATE}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Wage</p>
                                    <p className="font-semibold">{selectedRecord.WAGE_RATE_OF_PAY_FROM}/year</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Position Type</p>
                                    <p className="font-semibold">{selectedRecord.FULL_TIME_POSITION === 'Y' ? 'Full Time' : 'Part Time'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Case Status</p>
                                    <p className="font-semibold">{selectedRecord.CASE_STATUS}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Email Generation Section */}
                    {selectedRecord && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Generate Cover Letter</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Upload Resume (PDF)</label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleResumeUpload}
                                        className="w-full px-4 py-2 border rounded-lg"
                                    />
                                    {resume && (
                                        <p className="text-sm text-green-600 mt-1">✓ {resume.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Job Description (Optional)
                                    </label>
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the job description here for a more tailored cover letter..."
                                        rows={6}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <button
                                    onClick={generateCoverLetter}
                                    disabled={loading || !resume}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loading ? 'Generating...' : '✨ Generate Cover Letter with AI'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Email Preview */}
                    {generatedEmail && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-semibold mb-4">Email Preview</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">To</label>
                                    <input
                                        type="email"
                                        value={selectedRecord?.EMPLOYER_POC_EMAIL || 'hr@company.com'}
                                        className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Subject</label>
                                    <input
                                        type="text"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Body</label>
                                    <div
                                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 min-h-[300px] overflow-auto"
                                        dangerouslySetInnerHTML={{ __html: generatedEmail }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Attachment</label>
                                    <p className="text-sm text-gray-600">
                                        {resume ? `📎 ${resume.name}` : 'No attachment'}
                                    </p>
                                </div>

                                <button
                                    onClick={sendEmail}
                                    disabled={loading}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
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