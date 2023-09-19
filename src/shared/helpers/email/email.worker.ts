import logger, { Logger } from '@utils/logger';
import config from 'config';
import { mailTransport } from './mail.transport';

const log: Logger = logger('email.worker.ts');

class EmailWorker {
    async addNotificationEmail(job: any): Promise<void> {
        try {
            const { template, receiverEmail, subject } = job.data;
            await mailTransport.sendEmail(receiverEmail, subject, template);
        } catch (error) {
            log.error(error);
        }
    }
}

export const emailWorker: EmailWorker = new EmailWorker();
