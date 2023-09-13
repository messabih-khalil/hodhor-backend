// teacher.cache.ts
import { BaseCache } from '@helpers/redis/redis.base';
import { TeacherData } from '@teachers/index';
import { teacherKey } from '@helpers/redis/redis.keys';

class TeacherCache extends BaseCache {
    constructor() {
        super('teacherCache');
    }

    async addTeacherToCache(teacherData: TeacherData) {
        if (!this.client.isOpen) {
            await this.client.connect();
        }

        await this.client.HSET(
            teacherKey(teacherData.email),
            'data',
            this.serializeData(teacherData)
        );
    }

    serializeData(teacherData: TeacherData) {
        return JSON.stringify({
            ...teacherData,
        });
    }

    deserializeData(teacherData: string) {
        return JSON.parse(teacherData);
    }
}

export const teacherCache: TeacherCache = new TeacherCache();
