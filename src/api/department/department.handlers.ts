import { BadRequestError } from '@utils/error-handlers';
import { departmentServices } from './department.services';
import {
    DepartmentBodyRequest,
    createDepartmentRequestBodySchema,
    loginBodyRequest,
    loginBodySchema,
} from './department.validators';
import generator from 'generate-password';
import HTTP_STATUS from 'http-status-codes';

import { Request, Response, NextFunction } from 'express';
import { departmentCache } from './department.cache';
import { departmentQueue } from './department.queue';
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
        console.log('User Id : ', req.user);

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
        // 4 - add to cache
        await departmentCache.addDepartmentToCache({
            name,
            email,
            password,
            univ_id: req.user.data._id,
        });
        // 5 - add to queue
        departmentQueue.addDepartmentJob('addNewDepartment', {
            name,
            email,
            password,
            univ_id: req.user.data._id,
        });

        // 6 - send department data to the provided email : add it to the queue
        createDepartmentEmailQueue.addEmailJob('createDepartmentAccount', {
            template: departmentTemplate.createDepartmentAccount({
                name,
                email,
                password,
            }),
            receiverEmail: email,
            subject: 'Your department account info',
        });

        // 7 - reponse data
        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: {
                name,
                email,
                password,
            },
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
            throw new BadRequestError('Invalid Email');
        }

        // Compare password
        const isPasswordValid = await departmentAccount.comparePassword(
            password
        );

        if (!isPasswordValid) {
            throw new BadRequestError('Invalid password');
        }

        // Password is valid, generate JWT token
        const { _id, name } = departmentAccount;
        const token = jwtUtil.generateJWT({ _id, name, email });

        // Store JWT token in cookie session
        req.session = {
            token: token,
        };

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            message: 'Logged in successfully',
            data: req.session.token,
        });
    }
    // logout from a university account
    async logout(req: Request, res: Response): Promise<void> {
        console.log(req.user);

        req.session = null;
        res.status(HTTP_STATUS.OK).json({
            message: 'Logout successful',
        });
    }
}

export default DepartmentHandlers;
