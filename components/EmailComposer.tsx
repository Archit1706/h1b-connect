// components/EmailComposer.tsx
'use client';

import { useState } from 'react';

interface EmailComposerProps {
    emailSubject: string;
    setEmailSubject: (value: string) => void;
    coverLetter: string;
    setCoverLetter: (value: string) => void;
    isHtml: boolean;
    setIsHtml: (value: boolean) => void;
    resume: File | null;
    onResumeUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectedCount: number;
    onSend: () => void;
    loading: boolean;
    sendingProgress: { total: number; sent: number; failed: number } | null;
}

export default function EmailComposer({
    emailSubject,
    setEmailSubject,
    coverLetter,
    setCoverLetter,
    isHtml,
    setIsHtml,
    resume,
    onResumeUpload,
    selectedCount,
    onSend,
    loading,
    sendingProgress
}: EmailComposerProps) {
    const [showPreview, setShowPreview] = useState(false);

    return (
        <div className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Compose Email</h2>
                            <p className="text-blue-100 text-sm font-medium">
                                {selectedCount > 0 ? `${selectedCount} companies selected` : 'Select companies to send'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-semibold text-sm transition-colors text-black border border-gray-300 shadow-sm"
                    >
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Subject Line */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                        Email Subject
                    </label>
                    <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Application for {jobTitle} at {company}"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900 font-medium"
                    />
                    <p className="mt-2 text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-2">
                        💡 Use <code className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-xs">{'{company}'}</code> and <code className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-mono text-xs">{'{jobTitle}'}</code> for automatic personalization
                    </p>
                </div>

                {/* Resume Upload */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                        Resume Attachment
                    </label>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={onResumeUpload}
                            className="hidden"
                            id="resume-upload"
                        />
                        <label
                            htmlFor="resume-upload"
                            className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                        >
                            {resume ? (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900">{resume.name}</p>
                                        <p className="text-sm text-gray-600">{(resume.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <svg className="mx-auto w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="font-semibold text-gray-900 mb-1">Click to upload resume (PDF)</p>
                                    <p className="text-sm text-gray-600">or drag and drop</p>
                                </div>
                            )}
                        </label>
                    </div>
                </div>

                {/* Email Format Toggle */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                        Email Format
                    </label>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsHtml(false)}
                            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${!isHtml
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Plain Text
                        </button>
                        <button
                            onClick={() => setIsHtml(true)}
                            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${isHtml
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            HTML
                        </button>
                    </div>
                    {isHtml && (
                        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs text-amber-800 font-medium flex items-start gap-2">
                                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                HTML Mode: Paste your raw HTML code. Remember to use {'{company}'} and {'{jobTitle}'} for personalization.
                            </p>
                        </div>
                    )}
                </div>

                {/* Email Body */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                        Email Body
                    </label>
                    <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder={
                            isHtml
                                ? "Paste your HTML here...\n\n<p>Dear Hiring Manager at {company},</p>\n<p>I'm interested in the {jobTitle} position...</p>"
                                : "Write your email here. Use {company} and {jobTitle} for personalization.\n\nDear Hiring Manager at {company},\n\nI am writing to express my interest in the {jobTitle} position..."
                        }
                        rows={16}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900 font-mono text-sm resize-none"
                        style={{ whiteSpace: 'pre-wrap' }}
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                        <span>{coverLetter.length} characters</span>
                        <span>{coverLetter.split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                </div>

                {/* Preview */}
                {showPreview && coverLetter && (
                    <div className="border-t-2 border-gray-100 pt-6">
                        <label className="block text-sm font-bold text-gray-900 mb-3">
                            Preview (with sample data)
                        </label>
                        <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50 max-h-96 overflow-auto">
                            {isHtml ? (
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: coverLetter
                                            .replace(/\{company\}/gi, 'Sample Company Inc.')
                                            .replace(/\{jobTitle\}/gi, 'Software Engineer'),
                                    }}
                                />
                            ) : (
                                <div style={{ whiteSpace: 'pre-wrap' }}>
                                    {coverLetter
                                        .replace(/\{company\}/g, 'Sample Company Inc.')
                                        .replace(/\{jobTitle\}/g, 'Software Engineer')}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Info Banner */}
                <div className="bg-blue-50 border-2 border-blue-100 rounded-lg p-4">
                    <div className="flex gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-blue-900 mb-1">Rate Limiting Protection</p>
                            <p className="text-xs text-blue-700">
                                Emails are sent with delays between batches to prevent rate limiting and ensure maximum deliverability.
                                Large batches may take several minutes to complete.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Send Button */}
                <button
                    onClick={onSend}
                    disabled={loading || selectedCount === 0 || !resume || !coverLetter.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending... {sendingProgress?.sent || 0}/{sendingProgress?.total || 0}
                        </span>
                    ) : (
                        `📧 Send to ${selectedCount} ${selectedCount === 1 ? 'Company' : 'Companies'}`
                    )}
                </button>

                {/* Progress Result */}
                {sendingProgress && !loading && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-green-900">Batch Complete!</span>
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-green-700 font-medium">Sent Successfully</p>
                                <p className="text-2xl font-bold text-green-900">{sendingProgress.sent}</p>
                            </div>
                            <div>
                                <p className="text-red-700 font-medium">Failed</p>
                                <p className="text-2xl font-bold text-red-900">{sendingProgress.failed}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}