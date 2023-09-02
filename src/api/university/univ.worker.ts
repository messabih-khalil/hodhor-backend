import logger, { Logger } from '@utils/logger';
import { Job } from 'bullmq';
import { univServices } from '@university/index';

const log: Logger = logger('univ.worker.ts');

class UnivWorker {
    async addNewJob(job: Job): Promise<void> {
        try {
            await univServices.create(job.data);
        } catch (error) {
            log.error(error);
        }
    }
}

export const univWorker: UnivWorker = new UnivWorker();
