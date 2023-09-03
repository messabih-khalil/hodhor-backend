import { BaseQueue } from '@helpers/queue/base.queue';
import { departmentWorker } from './department.worker';

class DepartmentQueue extends BaseQueue {
    constructor(public queueWorkerName: string) {
        super(queueWorkerName, departmentWorker.addNewJob);
    }

    async addDepartmentJob(jobName: string, job: any) {
        await this.addJobToQueue(jobName, job);
    }
}

export const departmentQueue: DepartmentQueue = new DepartmentQueue(
    'departmentQueue'
);
