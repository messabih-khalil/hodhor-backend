import logger, { Logger } from '@utils/logger';
import Department from './department.models';
import { DepartmentData } from './department.types';

const log: Logger = logger('depatment.services.ts');

class DepartmentServices {
    async getDepartmentByEmail(email: string) {
        try {
            return await Department.findOne({ email });
        } catch (error) {
            log.error(error);
        }
    }

    async create(departmentData: DepartmentData) {
        try {
            await Department.create(departmentData);
        } catch (error) {
            log.error(error);
        }
    }
}

export const departmentServices: DepartmentServices = new DepartmentServices();
