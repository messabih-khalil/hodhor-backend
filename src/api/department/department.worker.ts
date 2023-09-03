import logger, { Logger } from '@utils/logger';
import { Job } from 'bullmq';

import { departmentServices } from './department.services';

const log: Logger = logger('univ.worker.ts');

class DepartmentWorker {
    async addNewJob(job: Job): Promise<void> {
        try {
            await departmentServices.create(job.data);
        } catch (error) {
            log.error(error);
        }
    }
}

export const departmentWorker: DepartmentWorker = new DepartmentWorker();
