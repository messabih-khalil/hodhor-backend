import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

import sendGridMail from '@sendgrid/mail';
import logger, { Logger } from '@utils/logger';
import config from 'config';
import { BadRequestError } from '@utils/error-handlers';

interface IMailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
}

const log: Logger = logger('mail.transport.ts');
sendGridMail.setApiKey(config.get('sendgrid_api_key'));

class MailTransport {
    public async sendEmail(
        receiverEmail: string,
        subject: string,
        body: string
    ): Promise<void> {
        if (
            config.get('node_env') === 'test' ||
            config.get('node_env') === 'development'
        ) {
            this.developmentEmailSender(receiverEmail, subject, body);
        } else {
            this.productionEmailSender(receiverEmail, subject, body);
        }
    }

    private async developmentEmailSender(
        receiverEmail: string,
        subject: string,
        body: string
    ): Promise<void> {
        const transporter: Mail = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: config.get('sender_email')!,
                pass: config.get('sender_email_password')!,
            },
        });

        const mailOptions: IMailOptions = {
            from: `Chatty App <${config.get('sender_email')!}>`,
            to: receiverEmail,
            subject,
            html: body,
        };

        try {
            await transporter.sendMail(mailOptions);
            log.info('Development email sent successfully.');
        } catch (error) {
            log.error('Error sending email', error);
            throw new BadRequestError('Error sending email');
        }
    }

    private async productionEmailSender(
        receiverEmail: string,
        subject: string,
        body: string
    ): Promise<void> {
        const mailOptions: IMailOptions = {
            from: `Chatty App <${config.get('sender_email')!}>`,
            to: receiverEmail,
            subject,
            html: body,
        };

        try {
            await sendGridMail.send(mailOptions);
            log.info('Production email sent successfully.');
        } catch (error) {
            log.error('Error sending email', error);
            throw new BadRequestError('Error sending email');
        }
    }
}

export const mailTransport: MailTransport = new MailTransport();
