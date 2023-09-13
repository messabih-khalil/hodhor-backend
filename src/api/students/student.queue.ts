import { BaseQueue } from '@helpers/queue/base.queue';

export class StudentQueue extends BaseQueue {
    constructor(public queueWorkerName: string, workerJob: any) {
        super(queueWorkerName, workerJob);
    }

    async addStudentJob(jobName: string, jobData: any) {
        await this.addJobToQueue(jobName, jobData);
    }
}
