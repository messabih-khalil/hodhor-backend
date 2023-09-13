// teacher.queue.ts
import { BaseQueue } from '@helpers/queue/base.queue';
import { teacherWorker } from './teacher.worker';

class TeacherQueue extends BaseQueue {
    constructor(public queueWorkerName: string) {
        super(queueWorkerName, teacherWorker.addNewJob);
    }

    async addTeacherJob(jobName: string, job: any) {
        await this.addJobToQueue(jobName, job);
    }
}

export const teacherQueue: TeacherQueue = new TeacherQueue('teacherQueue');
