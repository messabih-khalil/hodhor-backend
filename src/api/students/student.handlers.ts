import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '@utils/error-handlers';

import {
    CreateStudentBodyRequest,
    UpdateStudentBodyRequest,
    createStudentRequestBodySchema,
    updateStudentRequestBodySchema,
    studentServices,
    studentCache,
    StudentQueue,
    studentWorker,
    CreateStudentData,
    StudentModel,
} from '@student/index';

import HTTP_STATUS from 'http-status-codes';
import mongoose from 'mongoose';
import csvParser from 'csv-parser';

import fs from 'fs';
import { AsyncErrorHandler } from '@helpers/decorators/asyncError.decorator';
import Validate from '@helpers/decorators/zod.decorator';
import ShortUniqueId from 'short-unique-id';

class StudentHandlers {
    @Validate(createStudentRequestBodySchema)
    @AsyncErrorHandler
    async createStudent(
        req: Request<{}, {}, CreateStudentBodyRequest['body']>,
        res: Response,
        next: NextFunction
    ) {
        const { full_name, email, group_id } = req.body;

        const isExist = await StudentModel.findOne({ email });

        if (isExist) {
            next(
                new BadRequestError(
                    'Student with the provided email already exists'
                )
            );
        }

        // Generate new user id to use it in the cache and the main db
        const studentId = new mongoose.Types.ObjectId();

        const studentData = {
            studentId,
            full_name,
            email,
            group_id,
            department_id: req.user.data._id,
        };

        // add student to db

        await studentServices.create(studentData);

        res.status(HTTP_STATUS.CREATED).json({
            status: 'success',
            data: studentData,
        });
    }

    @AsyncErrorHandler
    async createFromCsv(req: Request, res: Response, next: NextFunction) {
        if (!req.file) {
            next(new BadRequestError('No CSV file uploaded.'));
        }

        const { group_id } = req.body;

        const dataArray: any[] = [];

        fs.createReadStream(req.file!.path)
            .pipe(csvParser())
            .on('data', async (row) => {
                const studentId = new mongoose.Types.ObjectId();

                const studentData = {
                    ...row,
                    group_id,
                    department_id: req.user.data._id,
                    studentId,
                };

                dataArray.push(studentData);

                // add student to cache
                await studentCache.addStudentToCache(studentData);

                // add student in the queue
                const studentQueue = new StudentQueue(
                    'addStudentQueue',
                    studentWorker.addNewJob
                );

                studentQueue.addStudentJob('studentData', studentData);
            })
            .on('end', () => {
                fs.unlinkSync(req.file!.path); // Remove the uploaded file
            });

        res.status(200).json({ message: 'The file under process' });
    }

    @Validate(updateStudentRequestBodySchema)
    @AsyncErrorHandler
    async updateStudent(
        req: Request<
            { studentId: string },
            {},
            UpdateStudentBodyRequest['body']
        >,
        res: Response,
        next: NextFunction
    ) {
        const { studentId } = req.params;
        const updatedData = req.body as CreateStudentData;

        // Update student in the cache
        await studentCache.updateStudentInCache(studentId, updatedData);

        // Add update student job to the queue
        const studentQueue = new StudentQueue(
            'updateStudentQueue',
            studentWorker.updateStudentJob
        );
        studentQueue.addStudentJob('updateStudent', {
            studentId,
            updatedData,
        });

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: updatedData,
        });
    }

    @AsyncErrorHandler
    async deleteStudent(
        req: Request<{ studentId: string }, {}, {}>,
        res: Response,
        next: NextFunction
    ) {
        const { studentId } = req.params;

        const deletedStudent = await studentServices.deleteById(studentId);

        if (!deletedStudent) {
            return next(new BadRequestError('Student not found'));
        }

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            message: 'Student deleted successfully',
        });
    }

    @AsyncErrorHandler
    async getAllStudents(req: Request, res: Response, next: NextFunction) {
        const fullName = req.query.fullName as string;

        const students = !fullName
            ? await studentServices.getAllStudents(req.user.data._id)
            : await studentServices.searchForAStudent(
                  fullName,

                  req.user.data._id
              );

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: students,
        });
    }

    @AsyncErrorHandler
    async getStudentsByGroupId(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        const groupId = req.params.groupId;

        const fullName = req.query.fullName as string;

        const students = !fullName
            ? await studentServices.getStudentsByGroupId(
                  groupId,
                  req.user.data._id
              )
            : await studentServices.searchForAStudent(
                  fullName,
                  groupId,
                  req.user.data._id
              );

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: students,
        });
    }

    @AsyncErrorHandler
    async increaseOrUpdateAbsence(
        req: Request<{}, {}, { studentIds: string[] }>,
        res: Response,
        next: NextFunction
    ) {
        const { studentIds } = req.body;

        const studentQueue = new StudentQueue(
            'increaseOrUpdateAbsenceQueue',
            studentWorker.increaseAbsenceWorker
        );
        // Loop through the list of student IDs
        for (const studentId of studentIds) {
            // Increase or update absence for each student
            // Add increase or update absence job to the queue

            studentQueue.addStudentJob('increaseOrUpdateAbsence', {
                studentId,
                teacher_id: req.user.data._id,
            });
        }

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            message: 'Absences increased or updated successfully.',
        });
    }

    @AsyncErrorHandler
    async submitJustification(req: Request, res: Response, next: NextFunction) {
        const { studentId } = req.params;
        const { absense_id } = req.body;
        console.log('File : ----- ', req.file);

        const file = req.file!.path;
        const { randomUUID } = new ShortUniqueId({ length: 10 });

        // Add submit justification job to the queue
        const studentQueue = new StudentQueue(
            'submitJustificationQueue',
            studentWorker.subimtJustificationWorker
        );
        studentQueue.addStudentJob('submitJustification', {
            studentId,
            image_url: file,
            absense_id,
            _id: randomUUID(),
            created_at: new Date().toISOString(),
        });

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            message: 'Justification submitted successfully.',
        });
    }

    @AsyncErrorHandler
    async decreaseAbsence(
        req: Request<{ studentId: string }, {}, { absense_id: string }>,
        res: Response,
        next: NextFunction
    ) {
        const { studentId } = req.params;
        const { absense_id } = req.body;
        // Add decrease absence job to the queue
        const studentQueue = new StudentQueue(
            'decreaseAbsenceQueue',
            studentWorker.decreaseAbsenceWorker
        );
        studentQueue.addStudentJob('decreaseAbsence', {
            absense_id,
            studentId,
        });

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            message: 'Absence decreased successfully.',
        });
    }

    // @AsyncErrorHandler
    // async getStudentAbsences(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         // Get student id from request parameters
    //         const { studentId } = req.params;

    //         // Call the service function to get student absences
    //         const absences = await studentServices.getAbsencesByStudentId(
    //             studentId
    //         );

    //         if (!absences) {
    //             return next(new BadRequestError('Student not found'));
    //         }

    //         // Send the absences data as a response
    //         return res.status(200).json({ absences });
    //     } catch (error) {
    //         // The AsyncErrorHandler middleware will handle any errors
    //         throw error;
    //     }
    // }

    @AsyncErrorHandler
    async deleteJustificationHandler(
        req: Request<
            { studentId: string; absenseId: string; justificationId: string },
            {},
            {}
        >,
        res: Response,
        next: NextFunction
    ) {
        const { studentId, absenseId, justificationId } = req.params;

        await studentServices.deleteJustification({
            studentId,
            absense_id: absenseId,
            justificationId,
        });

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            message: 'Justification deleted successfully.',
        });
    }
}

export default StudentHandlers;
