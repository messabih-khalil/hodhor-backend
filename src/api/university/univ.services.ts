import { CreateUniversityRequest } from '@university/index';
import logger, { Logger } from '@utils/logger';
import University from './univ.models';

const log: Logger = logger('univ.services.ts');

class UnivServices {
    async create(univData: CreateUniversityRequest) {
        try {
            await University.create(univData);
        } catch (error) {
            log.error(error);
        }
    }

    async getUnivByRoot(root: string) {
        return await University.findOne({ root });
    }
}

export const univServices: UnivServices = new UnivServices();
