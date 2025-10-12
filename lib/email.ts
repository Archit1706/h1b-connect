import nodemailer from 'nodemailer';

export async function sendEmail(
    from: string,
    to: string,
    subject: string,
    htmlBody: string,
    attachmentPath?: string
) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: from,
            pass: process.env.EMAIL_PASSWORD, // User needs to provide their email password
        },
    });

    const mailOptions: any = {
        from,
        to,
        subject,
        html: htmlBody,
    };

    if (attachmentPath) {
        mailOptions.attachments = [
            {
                filename: 'resume.pdf',
                path: attachmentPath,
            },
        ];
    }

    await transporter.sendMail(mailOptions);
}