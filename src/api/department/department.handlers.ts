import { BadRequestError } from '@utils/error-handlers';
import generator from 'generate-password';
import HTTP_STATUS from 'http-status-codes';

import { Request, Response, NextFunction } from 'express';
import {
    DepartmentBodyRequest,
    createDepartmentRequestBodySchema,
    departmentServices,
} from '@department/index';

import { AsyncErrorHandler } from '@helpers/decorators/asyncError.decorator';
import Validate from '@helpers/decorators/zod.decorator';

import { jwtUtil } from '@utils/jwt';
import { authService } from '@api/auth/auth.services';

class DepartmentHandlers {
    @Validate(createDepartmentRequestBodySchema)
    @AsyncErrorHandler
    async createDepartment(
        req: Request<{}, {}, DepartmentBodyRequest['body']>,
        res: Response,
        next: NextFunction
    ) {
        // 1 - Get Data From Request Body
        const { name, email } = req.body;

        // 2 - Check if a department was exist with the provided email
        const isExist = await authService.getUserByEmail(email);

        if (isExist) {
            return next(new BadRequestError('Provided email already exists'));
        }
        // 3 - Generate strong password

        const password = generator.generate({
            length: 30,
            numbers: true,
        });

        // 4 - create new user as department
        const user = await authService.createUser({
            username: name,
            email,
            password,
            role: 'department',
        });

        // 5 - add department to database

        await departmentServices.create({
            name,
            email,
            password,
            univ_id: req.user.data._id,
            user_id: user._id,
        });

        // 6 - reponse data
        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: {
                name,
                email,
                password,
            },
        });
    }

    @AsyncErrorHandler
    async getDepartments(req: Request, res: Response, next: NextFunction) {
        const departments = await departmentServices.getDepartments(
            req.user.data._id
        );

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: departments,
        });
    }
}

export default DepartmentHandlers;
