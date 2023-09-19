import { AsyncErrorHandler } from '@helpers/decorators/asyncError.decorator';
import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { BadRequestError, NotAuthorizedError } from '@utils/error-handlers';
import Validate from '@helpers/decorators/zod.decorator';

import { jwtUtil } from '@utils/jwt';
import {
    CreateUserRequestBody,
    LoginBodyRequest,
    createUserRequestBodySchema,
    loginBodySchema,
} from './auth.validators';
import { authService } from './auth.services';
import { IUserInfo } from './auth.types';
import { createAccountEmailQueue } from '@helpers/email/email.queue';
import { userTemplates } from '@helpers/email/templates/user/user.account';

class AuthHandlers {
    @Validate(loginBodySchema)
    @AsyncErrorHandler
    async login(
        req: Request<{}, {}, LoginBodyRequest['body']>,
        res: Response,
        next: NextFunction
    ) {
        const { email, password } = req.body;

        // Find the user by email
        const user = await authService.getUserByEmail(email);

        if (!user) {
            throw new NotAuthorizedError('Invalid email or password');
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            throw new NotAuthorizedError('Invalid email or password');
        }

        // Password is valid, generate JWT token
        const { _id, username, role } = user;
        const token = jwtUtil.generateJWT({ _id, username, role });

        req.session = {
            token: token,
            role,
        };

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            message: 'Logged in successfully',
            data: { token, userId: _id, role },
        });
    }
    @AsyncErrorHandler
    async logout(req: Request, res: Response, next: NextFunction) {
        req.session = null;

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            message: 'Logged out successfully',
        });
    }

    @Validate(createUserRequestBodySchema)
    @AsyncErrorHandler
    async createUser(
        req: Request<{}, {}, CreateUserRequestBody['body']>,
        res: Response,
        next: NextFunction
    ) {
        const { username, email, password, role } = req.body;

        // Check if a user with the provided email already exists
        const existingUser = await authService.getUserByEmail(email);

        if (existingUser) {
            throw new BadRequestError('Provided email already exists');
        }

        // Create a new user
        const user: IUserInfo = {
            username,
            email,
            password,
            role,
            // Add other fields as needed
        };

      

        const createdUser = await authService.createUser(user);

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            data: createdUser,
        });
    }
}

export default AuthHandlers;
