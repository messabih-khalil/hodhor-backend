import { BaseCache } from '@helpers/redis/redis.base';
import { DepartmentData } from '@department/index';
import { departmentKey } from '@helpers/redis/redis.keys';

class DepartmentCache extends BaseCache {
    constructor() {
        super('departmentCache');
    }

    // add department

    async addDepartmentToCache(departmentData: DepartmentData) {
        if (!this.client.isOpen) {
            await this.client.connect();
        }

        await this.client.HSET(
            departmentKey(departmentData.email),
            'data',
            this.serializeData(departmentData)
        );
    }

    serializeData(departmentData: DepartmentData) {
        return JSON.stringify({
            ...departmentData,
        });
    }

    deserializeData(departmentData: string) {
        return JSON.parse(departmentData);
    }
}

export const departmentCache: DepartmentCache = new DepartmentCache();
