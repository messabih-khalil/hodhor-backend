import { BaseCache } from '@src/shared/helpers/redis/redis.base';

class RedisConnection extends BaseCache {
    constructor() {
        super('redisConnection');
    }

    async connect(): Promise<void> {
        try {
            await this.client.connect();
            this.log.info(`Redis connection: ${await this.client.ping()}`);
        } catch (error) {
            this.log.error(error);
        }
    }
}

export const redisConnection: RedisConnection = new RedisConnection();
