// teacher.handlers.ts
import { NextFunction, Request, Response } from 'express';
import generator from 'generate-password';
import HTTP_STATUS from 'http-status-codes';
import Teacher from './teacher.models';

import { createTeacherEmailQueue } from '@helpers/email/email.queue';
import { teacherTemplates } from '@helpers/email/templates/teachers/teacher.account';
import { jwtUtil } from '@utils/jwt';
import { AsyncErrorHandler } from '@helpers/decorators/asyncError.decorator';

import { BadRequestError } from '@utils/error-handlers';
import Validate from '@helpers/decorators/zod.decorator';

import {
    teacherCache,
    teacherQueue,
    TeacherLoginRequest,
    createTeacherBodyRequest,
    createTeacherRequestBodySchema,
    teacherServices,
} from '@teachers/index';

type groups = string[];

class TeacherHandlers {
    @Validate(createTeacherRequestBodySchema)
    @AsyncErrorHandler
    async createTeacher(
        req: Request<
            {},
            {},
            { email: string; full_name: string; groups: string[] }
        >,
        res: Response,
        next: NextFunction
    ) {
        // Get Data From Request Body
        const { full_name, email, groups } = req.body;

        // Check if a teacher with the provided email exists
        const isExist = await Teacher.findOne({ email });

        if (isExist) {
            next(
                new BadRequestError(
                    'Teacher with the provided email already exists'
                )
            );
        }

        // Generate a strong password
        const password = generator.generate({
            length: 30,
            numbers: true,
        });

        // Add Teacher To Db

        await teacherServices.create({
            full_name,
            email,
            password,
            groups,
            department_id: req.user.data._id,
        });

        // Send teacher's account information to the provided email
        createTeacherEmailQueue.addEmailJob('createTeacherAccount', {
            template: teacherTemplates.createTeacherAccount({
                full_name,
                email,
                password,
            }),
            receiverEmail: email,
            subject: 'Your teacher account info',
        });

        res.status(HTTP_STATUS.CREATED).json({
            status: 'success',
            data: {
                full_name,
                email,
                groups,
            },
        });
    }

    @AsyncErrorHandler
    async updateTeacher(req: Request, res: Response) {
        try {
            const { teacherId } = req.params;

            const { full_name, email, groups } = req.body;

            // Call the service method to update teacher groups
            const updatedTeacher = await teacherServices.updateTeacher(
                teacherId,
                { full_name, email, groups }
            );

            res.status(HTTP_STATUS.OK).json({
                status: 'success',
                data: updatedTeacher,
            });
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: 'An error occurred while updating teacher groups',
            });
        }
    }

    @AsyncErrorHandler
    async login(
        req: Request<{}, {}, TeacherLoginRequest['body']>,
        res: Response,
        next: NextFunction
    ) {
        const { email, password } = req.body;

        // Find the teacher by email
        const teacher = await teacherServices.getTeacherByEmail(email);

        if (!teacher) {
            return next(new BadRequestError('Invalid email or password'));
        }

        // Check if the provided password matches the stored password
        const isPasswordValid = await teacher.comparePassword(password);

        if (!isPasswordValid) {
            return next(new BadRequestError('Invalid email or password'));
        }

        // Password is valid, generate a JWT token
        const { _id, full_name } = teacher;
        const token = jwtUtil.generateJWT({ _id, full_name, email });

        // Store JWT token in cookie session or response header, as needed
        // For example, if using a cookie-based session:
        req.session = {
            token: token,
        };

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            message: 'Logged in successfully',
            data: {
                token,
                full_name,
                email,
            },
        });
    }

    @AsyncErrorHandler
    async logout(req: Request, res: Response) {
        req.session = null;

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            message: 'Logged out successfully',
        });
    }

    @AsyncErrorHandler
    async getTeachersByDepartmentId(req: Request, res: Response) {
        try {
            const { full_name } = req.query;
            // Use the teacherService to get teachers by department_id
            const teachers = await teacherServices.getTeachersByDepartmentId(
                req.user.data._id,
                full_name as string
            );

            res.status(HTTP_STATUS.OK).json({
                status: 'success',
                data: teachers,
            });
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: 'An error occurred while fetching teachers',
            });
        }
    }

    @AsyncErrorHandler
    async getGroupsForTeacher(req: Request, res: Response) {
        const { teacherId } = req.params;

        // Call the service method to get the groups for the teacher
        const data = await teacherServices.getGroupsWithStudentsForTeacher(
            teacherId
        );

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: data,
        });
    }
}

export default TeacherHandlers;
