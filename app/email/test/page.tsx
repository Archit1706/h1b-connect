// app/email/test/page.tsx
'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function EmailTestPage() {
    const [recipientEmails, setRecipientEmails] = useState('');
    const [subject, setSubject] = useState('Test Email');
    const [emailBody, setEmailBody] = useState('');
    const [isHtml, setIsHtml] = useState(false);
    const [attachment, setAttachment] = useState<File | null>(null);
    const [attachmentBase64, setAttachmentBase64] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAttachment(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                setAttachmentBase64(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const detectHtml = (text: string): boolean => {
        const htmlPattern = /<\/?[a-z][\s\S]*>/i;
        return htmlPattern.test(text);
    };

    const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newBody = e.target.value;
        setEmailBody(newBody);

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

    const handleSendTestEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setResult(null);

        if (!recipientEmails.trim()) {
            setResult({ success: false, message: 'Please enter at least one recipient email' });
            return;
        }

        if (!subject.trim()) {
            setResult({ success: false, message: 'Please enter a subject' });
            return;
        }

        if (!emailBody.trim()) {
            setResult({ success: false, message: 'Please enter email body' });
            return;
        }

        setLoading(true);

        try {
            const emails = recipientEmails
                .split(/[,\n]/)
                .map(email => email.trim())
                .filter(email => email.length > 0);

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const invalidEmails = emails.filter(email => !emailRegex.test(email));

            if (invalidEmails.length > 0) {
                setResult({
                    success: false,
                    message: `Invalid email format: ${invalidEmails.join(', ')}`
                });
                setLoading(false);
                return;
            }

            const formattedBody = formatEmailBody(emailBody, isHtml);

            const res = await fetch('/api/test-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients: emails,
                    subject,
                    htmlBody: formattedBody,
                    attachmentBase64: attachmentBase64 || null,
                    attachmentName: attachment?.name || null
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                try {
                    const errorData = JSON.parse(errorText);
                    throw new Error(errorData.error || 'Failed to send email');
                } catch (parseError) {
                    throw new Error(`Server error: ${res.status} - ${errorText.substring(0, 100)}`);
                }
            }

            const data = await res.json();

            setResult({
                success: true,
                message: `✅ Successfully sent to ${data.results.sent} recipient(s)!${data.results.failed > 0 ? ` ${data.results.failed} failed.` : ''}`
            });

            // Clear form on success
            setRecipientEmails('');
            setEmailBody('');
            setAttachment(null);
            setAttachmentBase64('');
            setIsHtml(false);

        } catch (error: any) {
            console.error('Error sending test email:', error);
            setResult({
                success: false,
                message: `❌ Error: ${error.message}`
            });
        } finally {
            setLoading(false);
        }
    };

    const emailCount = recipientEmails.split(/[,\n]/).filter(e => e.trim()).length;
    const wordCount = emailBody.split(/\s+/).filter(Boolean).length;
    const charCount = emailBody.length;

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="container mx-auto px-4 py-8 max-w-5xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-blue-600 rounded-xl">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900">Email Test Tool</h1>
                                <p className="text-gray-600 font-medium mt-1">
                                    Test your email configuration before sending bulk emails
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-white rounded-xl border-2 border-gray-100 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium">Recipients</p>
                                    <p className="text-2xl font-bold text-gray-900">{emailCount}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border-2 border-gray-100 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium">Words</p>
                                    <p className="text-2xl font-bold text-gray-900">{wordCount}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border-2 border-gray-100 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-medium">Characters</p>
                                    <p className="text-2xl font-bold text-gray-900">{charCount}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Form Card */}
                    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-xl overflow-hidden">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <h2 className="text-2xl font-bold text-white">Compose Test Email</h2>
                                </div>
                                {emailBody && (
                                    <button
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg font-semibold text-sm transition-colors"
                                    >
                                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleSendTestEmail} className="p-8 space-y-6">
                            {/* Recipients */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Recipient Email(s)
                                </label>
                                <textarea
                                    value={recipientEmails}
                                    onChange={(e) => setRecipientEmails(e.target.value)}
                                    placeholder="Enter email addresses (comma or newline separated)&#10;example1@email.com, example2@email.com&#10;example3@email.com"
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900 font-medium resize-none"
                                    required
                                />
                                <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Separate multiple emails with commas or newlines
                                </p>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                    Subject Line
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Email subject"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900 font-medium"
                                    required
                                />
                            </div>

                            {/* Email Format Toggle */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    Email Format
                                </label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsHtml(false)}
                                        className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${!isHtml
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        Plain Text
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsHtml(true)}
                                        className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${isHtml
                                                ? 'bg-blue-600 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        HTML
                                    </button>
                                </div>
                                {isHtml && (
                                    <div className="mt-3 bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                                        <div className="flex gap-3">
                                            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-sm text-amber-800 font-medium">
                                                HTML Mode: Paste your raw HTML code. Complete documents (with &lt;html&gt; tag) will be sent as-is.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Email Body */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Email Body
                                </label>
                                <textarea
                                    value={emailBody}
                                    onChange={handleBodyChange}
                                    placeholder={
                                        isHtml
                                            ? "Paste your HTML here...\n\n<p>Your content...</p>"
                                            : "Enter your email message here...\n\nThis will be formatted as plain text with line breaks preserved."
                                    }
                                    rows={16}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-900 font-mono text-sm resize-none"
                                    required
                                    style={{ whiteSpace: 'pre-wrap' }}
                                />
                                <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                                    <span>{charCount} characters</span>
                                    <span>{wordCount} words</span>
                                </div>
                            </div>

                            {/* Preview */}
                            {showPreview && emailBody && (
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Preview
                                    </label>
                                    <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50 max-h-96 overflow-auto">
                                        {isHtml ? (
                                            <div dangerouslySetInnerHTML={{ __html: emailBody }} />
                                        ) : (
                                            <div style={{ whiteSpace: 'pre-wrap' }}>{emailBody}</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Attachment */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                    </svg>
                                    Attachment (Optional)
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        onChange={handleAttachmentUpload}
                                        className="hidden"
                                        id="attachment-upload"
                                    />
                                    <label
                                        htmlFor="attachment-upload"
                                        className="flex items-center justify-center w-full px-6 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                                    >
                                        {attachment ? (
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-green-100 rounded-xl">
                                                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-gray-900 text-base">{attachment.name}</p>
                                                    <p className="text-sm text-gray-600">{(attachment.size / 1024).toFixed(2)} KB</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <svg className="mx-auto w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="font-bold text-gray-900 mb-1">Click to upload attachment</p>
                                                <p className="text-sm text-gray-600">or drag and drop</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Result Message */}
                            {result && (
                                <div
                                    className={`rounded-xl p-5 font-semibold border-2 ${result.success
                                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200'
                                            : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-200'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {result.success ? (
                                            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                        <span>{result.message}</span>
                                    </div>
                                </div>
                            )}

                            {/* Send Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        📧 Send Test Email to {emailCount} {emailCount === 1 ? 'Recipient' : 'Recipients'}
                                    </span>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Info Card */}
                    <div className="mt-8 bg-white rounded-2xl border-2 border-blue-100 overflow-hidden shadow-lg">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b-2 border-blue-100">
                            <div className="flex items-center gap-3">
                                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <h3 className="text-lg font-bold text-gray-900">Email Format Guide</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <span className="font-bold text-blue-600">1</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 mb-1">Plain Text</p>
                                        <p className="text-sm text-gray-600">Your text will be formatted with line breaks preserved. Best for simple messages.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <span className="font-bold text-purple-600">2</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 mb-1">HTML</p>
                                        <p className="text-sm text-gray-600">Paste complete HTML documents or fragments with inline styles. Auto-detected when you paste HTML tags.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <span className="font-bold text-green-600">3</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 mb-1">Auto-Detection</p>
                                        <p className="text-sm text-gray-600">HTML is automatically detected when you paste content with HTML tags like &lt;p&gt;, &lt;div&gt;, etc.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8 flex gap-4">
                        <a
                            href="/email"
                            className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-center py-4 rounded-xl font-bold hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl"
                        >
                            ← Back to Email Tool
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}