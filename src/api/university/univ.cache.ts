import { BaseCache } from '@helpers/redis/redis.base';
import { univKey } from '@helpers/redis/redis.keys';
import { ServerError } from '@utils/error-handlers';
import { CreateUniversityRequest, univQueue } from '@api/university/index';

class UnivCache extends BaseCache {
    constructor() {
        super('universityCache');
    }

    // Add univ credantails to the cache
    async addUnivToCache(univRoot: string, univData: CreateUniversityRequest) {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }

            await this.client.HSET(
                univKey(univRoot),
                'data',
                this.serializeData(univData)
            );

            // create new job to add new record to db

            univQueue.addUnivJob('NewUnivAccount', univData);
        } catch (error) {
            this.log.error(error);
            throw new ServerError('Server Error , try later');
        }
    }

    // Get University data from the cache

    async getUnivFromCache(univRoot: string) {
        try {
            if (!this.client.isOpen) {
                await this.client.connect();
            }
            const data = await this.client.hGet(univKey(univRoot), 'data');
            return this.deserializeData(data as string);
        } catch (err) {
            this.log.error(err);
        }
    }

    serializeData(univData: CreateUniversityRequest) {
        return JSON.stringify({
            ...univData,
        });
    }

    deserializeData(univData: string) {
        return JSON.parse(univData);
    }
}

export const univCache: UnivCache = new UnivCache();
