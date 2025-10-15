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

    const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAttachment(file);

            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                setAttachmentBase64(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    // Auto-detect if content is HTML
    const detectHtml = (text: string): boolean => {
        const htmlPattern = /<\/?[a-z][\s\S]*>/i;
        return htmlPattern.test(text);
    };

    const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newBody = e.target.value;
        setEmailBody(newBody);

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

    const handleSendTestEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setResult(null);

        // Validate inputs
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
            // Split emails by comma or newline
            const emails = recipientEmails
                .split(/[,\n]/)
                .map(email => email.trim())
                .filter(email => email.length > 0);

            // Validate email format
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

            // Format the email body
            const formattedBody = formatEmailBody(emailBody, isHtml);

            console.log('Sending email with body type:', isHtml ? 'HTML' : 'Plain Text');

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
                console.error('Server error response:', errorText);
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

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900">Email Test Tool</h1>
                        <p className="text-sm text-gray-700 font-medium mt-2">
                            Test your email configuration by sending test emails
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-8">
                        <form onSubmit={handleSendTestEmail} className="space-y-6">
                            {/* Recipient Emails */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Recipient Email(s)
                                </label>
                                <textarea
                                    value={recipientEmails}
                                    onChange={(e) => setRecipientEmails(e.target.value)}
                                    placeholder="Enter email addresses (comma or newline separated)&#10;example1@email.com, example2@email.com&#10;example3@email.com"
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                                    required
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    Separate multiple emails with commas or newlines
                                </p>
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Email subject"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                                    required
                                />
                            </div>

                            {/* Email Body Type Toggle */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Email Body Type
                                </label>
                                <div className="flex items-center space-x-4 mb-2">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={!isHtml}
                                            onChange={() => setIsHtml(false)}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-sm font-medium text-gray-900">Plain Text</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={isHtml}
                                            onChange={() => setIsHtml(true)}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <span className="text-sm font-medium text-gray-900">HTML</span>
                                    </label>
                                </div>
                                {isHtml && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                                        <p className="text-xs text-yellow-800 font-medium">
                                            ⚠️ HTML Mode: Paste your raw HTML code below. The system will auto-detect complete HTML documents.
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
                                    value={emailBody}
                                    onChange={handleBodyChange}
                                    placeholder={isHtml
                                        ? "Paste your raw HTML here...\n\n<html>\n<body>\n  <p>Your content...</p>\n</body>\n</html>"
                                        : "Enter your email message here...\n\nThis will be formatted as plain text with line breaks preserved."
                                    }
                                    rows={16}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-mono text-sm"
                                    required
                                    style={{ whiteSpace: 'pre-wrap' }}
                                />
                                <p className="text-xs text-gray-600 mt-1">
                                    {isHtml
                                        ? 'Paste complete HTML or HTML fragments. Complete documents (with <html> tag) will be sent as-is.'
                                        : 'Plain text will be automatically formatted with proper line breaks.'
                                    }
                                </p>
                            </div>

                            {/* Preview */}
                            {emailBody && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-2">
                                        Preview
                                    </label>
                                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-64 overflow-auto">
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
                                <label className="block text-sm font-bold text-gray-900 mb-2">
                                    Attachment (Optional)
                                </label>
                                <input
                                    type="file"
                                    onChange={handleAttachmentUpload}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium"
                                />
                                {attachment && (
                                    <p className="text-sm text-green-700 font-semibold mt-2">
                                        ✓ {attachment.name} ({(attachment.size / 1024).toFixed(2)} KB)
                                    </p>
                                )}
                            </div>

                            {/* Result Message */}
                            {result && (
                                <div
                                    className={`p-4 rounded-lg font-semibold ${result.success
                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                            : 'bg-red-100 text-red-800 border border-red-200'
                                        }`}
                                >
                                    {result.message}
                                </div>
                            )}

                            {/* Send Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? '📤 Sending...' : '📧 Send Test Email'}
                            </button>
                        </form>

                        {/* Info Box */}
                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-blue-800 font-medium mb-2">
                                <strong>ℹ️ Email Body Formats:</strong>
                            </p>
                            <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                                <li><strong>Plain Text:</strong> Your text will be formatted with line breaks preserved</li>
                                <li><strong>HTML:</strong> Paste complete HTML documents or fragments with inline styles</li>
                                <li>HTML is auto-detected when you paste content with HTML tags</li>
                                <li>Complete HTML documents (with &lt;html&gt; tag) are sent as-is</li>
                            </ul>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 flex gap-4">
                        <a
                            href="/email"
                            className="flex-1 bg-gray-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                        >
                            ← Back to Email Tool
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}