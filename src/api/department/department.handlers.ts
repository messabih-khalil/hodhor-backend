import { BadRequestError } from '@utils/error-handlers';
import generator from 'generate-password';
import HTTP_STATUS from 'http-status-codes';

import { Request, Response, NextFunction } from 'express';
import {
    DepartmentBodyRequest,
    createDepartmentRequestBodySchema,
    loginBodyRequest,
    loginBodySchema,
    departmentServices,
} from '@department/index';

import { AsyncErrorHandler } from '@helpers/decorators/asyncError.decorator';
import Validate from '@helpers/decorators/zod.decorator';
import { createDepartmentEmailQueue } from '@helpers/email/email.queue';
import { departmentTemplate } from '@helpers/email/templates/department/department.account';
import { jwtUtil } from '@utils/jwt';

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
        const isExist = await departmentServices.getDepartmentByEmail(email);

        if (isExist) {
            return next(new BadRequestError('Provided email already exists'));
        }
        // 3 - Generate strong password

        const password = generator.generate({
            length: 30,
            numbers: true,
        });

        // 4 - add department to database

        await departmentServices.create({
            name,
            email,
            password,
            univ_id: req.user.data._id,
        });

        // 5 - send department data to the provided email : add it to the queue
        createDepartmentEmailQueue.addEmailJob('createDepartmentAccount', {
            template: departmentTemplate.createDepartmentAccount({
                name,
                email,
                password,
            }),
            receiverEmail: email,
            subject: 'Your department account info',
        });

        // 5 - reponse data
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

    // login into university account
    @Validate(loginBodySchema)
    @AsyncErrorHandler
    async login(
        req: Request<{}, {}, loginBodyRequest['body']>,
        res: Response
    ): Promise<void> {
        const { email, password } = req.body;

        // Get user by root
        const departmentAccount = await departmentServices.getDepartmentByEmail(
            email
        );

        if (!departmentAccount) {
            throw new BadRequestError('Invalid department email');
        }

        // Compare password
        const isPasswordValid = await departmentAccount.comparePassword(
            password
        );

        if (!isPasswordValid) {
            throw new BadRequestError('Invalid department password');
        }

        // Password is valid, generate JWT token
        const { _id, name } = departmentAccount;
        const token = jwtUtil.generateJWT({ _id, name, email });

        // Store JWT token in cookie session
        req.session = {
            token: token,
            role : 'department'
        };

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            message: 'Logged in successfully',
            data: { token: req.session.token, department_id: _id },
        });
    }
    // logout from a university account
    async logout(req: Request, res: Response): Promise<void> {
        req.session = null;
        res.status(HTTP_STATUS.OK).json({
            message: 'Logout successful',
        });
    }
    
    
}

export default DepartmentHandlers;
