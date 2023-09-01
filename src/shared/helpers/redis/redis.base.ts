import { createClient } from 'redis';
import logger from '@src/shared/utils/logger';
import config from 'config';
import type { Logger } from '@src/shared/utils/logger';

export type RedisClient = ReturnType<typeof createClient>;

export abstract class BaseCache {
    client: RedisClient;
    log: Logger;

    constructor(cacheName: string) {
        this.client = createClient({ url: config.get('redis_host') });
        this.log = logger(cacheName);
        this.cacheError();
    }

    private cacheError(): void {
        this.client.on('error', (error: unknown) => {
            this.log.error(error);
        });
    }
}
