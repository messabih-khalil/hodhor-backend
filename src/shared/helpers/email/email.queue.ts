import { BaseQueue } from '@helpers/queue/base.queue';
import { emailWorker } from './email.worker';

class EmailQueue extends BaseQueue {
    constructor(public queueName: string) {
        super(queueName, emailWorker.addNotificationEmail);
    }

    public addEmailJob(name: string, job: any): void {
        this.addJobToQueue(name, job);
    }
}

export const createDepartmentEmailQueue: EmailQueue = new EmailQueue(
    'createDepartmentEmail'
);
