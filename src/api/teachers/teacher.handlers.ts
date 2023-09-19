import { NextFunction, Request, Response } from 'express';
import generator from 'generate-password';
import HTTP_STATUS from 'http-status-codes';

import { jwtUtil } from '@utils/jwt';
import { AsyncErrorHandler } from '@helpers/decorators/asyncError.decorator';

import { BadRequestError, NotFoundError } from '@utils/error-handlers';
import Validate from '@helpers/decorators/zod.decorator';

import {
    createTeacherRequestBodySchema,
    teacherServices,
} from '@teachers/index';
import { authService } from '@api/auth/auth.services';

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
        const isExist = await authService.getUserByEmail(email);

        if (isExist) {
            return next(
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

        // create new teacher account
        const user = await authService.createUser({
            username: full_name,
            email,
            password,
            role: 'teacher',
        });

        // Add Teacher To Db

        await teacherServices.create({
            groups,
            department_id: req.user.data._id,
            user_id: user._id,
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
        const { teacherId } = req.params;

        const { full_name, email, groups } = req.body;

        // get teacher with id
        const teacher = await teacherServices.getTeacherById(teacherId);
        // update teacher username and email
        if (!teacher) {
            throw new NotFoundError('Teacher Is Not Exist');
        }

        await authService.updateUser(teacher.user_id, {
            username: full_name,
            email,
        });
        // update teacher groups
        const updatedTeacher = await teacherServices.updateTeacher(
            teacherId,
            groups
        );

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: updatedTeacher,
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
        const user = await authService.getUserById(req.user.data._id);

        // Call the service method to get the groups for the teacher
        const data = await teacherServices.getGroupsWithStudentsForTeacher(
            user?._id
        );

        // const filteredData = data.filter((d: any) => d && d.length);

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: data,
        });
    }
}

export default TeacherHandlers;
