import logger, { Logger } from '@utils/logger';
import { Job } from 'bullmq';

import { studentServices } from '@student/index';

const log: Logger = logger('student.worker.ts');

class StudentWorker {
    async addNewJob(job: Job): Promise<void> {
        try {
            await studentServices.create(job.data);
        } catch (error) {
            log.error(error);
        }
    }

    async updateStudentJob(job: Job): Promise<void> {
        try {
            const _id = job.data.studentId;
            const updatedData = job.data.updatedData;

            await studentServices.updateById(_id, updatedData);
        } catch (error) {
            log.error(error);
        }
    }

    async deleteStudentJob(job: Job): Promise<void> {
        try {
            const _id = job.data.studentId;

            await studentServices.deleteById(_id);
        } catch (error) {
            log.error(error);
        }
    }

    async increaseAbsenceWorker(job: Job): Promise<void> {
        try {
            const { teacher_id, studentId } = job.data;

            await studentServices.createOrUpdateAbsence({
                teacher_id,
                studentId,
            });
        } catch (error) {}
    }

    async decreaseAbsenceWorker(job: Job): Promise<void> {
        try {
            const { absense_id, studentId } = job.data;

            await studentServices.decreaseAbsences({ absense_id, studentId });
        } catch (error) {}
    }

    async subimtJustificationWorker(job: Job): Promise<void> {
        try {
            const { absense_id, studentId, image_url, created_at, _id } =
                job.data;

           

            await studentServices.submitJustification(
                { absense_id, studentId },
                { image_url, created_at, _id }
            );
        } catch (error) {}
    }
}

export const studentWorker: StudentWorker = new StudentWorker();
