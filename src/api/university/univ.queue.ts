import { BaseQueue } from '@helpers/queue/base.queue';
import { univWorker } from './univ.worker';
import { Job } from 'bullmq';

class UnivQueue extends BaseQueue {
    constructor(public queueWorkerName: string) {
        super(queueWorkerName, univWorker.addNewJob);
    }

    async addUnivJob(jobName: string, job: any) {
        await this.addJobToQueue(jobName, job);
    }
}

export const univQueue: UnivQueue = new UnivQueue('univQueue');
