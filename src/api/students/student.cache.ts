// student.cache.ts

import { BaseCache } from '@helpers/redis/redis.base';
import { CreateStudentData } from '@student/index'; // Define the StudentData type as needed
import { studentKey } from '@helpers/redis/redis.keys'; // Define the key generation function as needed

class StudentCache extends BaseCache {
    constructor() {
        super('studentCache');
    }

    async addStudentToCache(studentData: CreateStudentData) {
        if (!this.client.isOpen) {
            await this.client.connect();
        }

        await this.client.HSET(
            studentKey(studentData.studentId.toString()),
            'data',
            this.serializeData(studentData)
        );
    }

    async updateStudentInCache(
        studentId: string,
        updatedData: CreateStudentData
    ) {
        if (!this.client.isOpen) {
            await this.client.connect();
        }

        await this.client.HSET(
            studentKey(studentId),
            'data',
            this.serializeData(updatedData)
        );
    }

    async deleteStudentFromCache(studentId: string) {
        if (!this.client.isOpen) {
            await this.client.connect();
        }

        await this.client.HDEL(studentKey(studentId), 'data');
    }

    serializeData(studentData: CreateStudentData) {
        return JSON.stringify({
            ...studentData,
        });
    }

    deserializeData(studentData: string) {
        return JSON.parse(studentData);
    }
}

export const studentCache: StudentCache = new StudentCache();
