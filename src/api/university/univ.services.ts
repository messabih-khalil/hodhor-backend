import { CreateUniversityRequest } from '@api/university/index';
import logger, { Logger } from '@utils/logger';
import University from './univ.models';

const log: Logger = logger('univ.services.ts');

class UnivServices {
    async create(univData: { location: string; user_id: string }) {
        try {
            await University.create(univData);
        } catch (error) {
            log.error(error);
        }
    }
}

export const univServices: UnivServices = new UnivServices();
