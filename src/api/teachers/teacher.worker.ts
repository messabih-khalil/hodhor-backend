// teacher.worker.ts
import logger, { Logger } from '@utils/logger';
import { Job } from 'bullmq';
import { teacherServices } from '@teachers/index';

const log: Logger = logger('teacher.worker.ts');

class TeacherWorker {
    async addNewJob(job: Job): Promise<void> {
        try {
            await teacherServices.create(job.data);
        } catch (error) {
            log.error(error);
        }
    }
}

export const teacherWorker: TeacherWorker = new TeacherWorker();
