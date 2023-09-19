import Validate from '@helpers/decorators/zod.decorator';
import { NextFunction, Request, Response } from 'express';
import {
    CreateUniversityRequest,
    universityBodySchema,
    univServices,
} from '@api/university/index';
import { AsyncErrorHandler } from '@helpers/decorators/asyncError.decorator';

import { BadRequestError } from '@utils/error-handlers';

import _ from 'lodash';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '@api/auth/auth.services';
import generator from 'generate-password';

export class UniversityHandlers {
    // create university account
    @Validate(universityBodySchema)
    @AsyncErrorHandler
    async create(
        req: Request<{}, {}, CreateUniversityRequest>,
        res: Response,
        next: NextFunction
    ) {
        const { username, email, location } = req.body;

        // Check if a teacher with the provided email exists
        const isExist = await authService.getUserByEmail(email);

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

        // create new teacher account
        const user = await authService.createUser({
            username,
            email,
            password,
            role: 'university',
        });

        await univServices.create({
            location,
            user_id: user._id,
        });

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            message: 'account created successfully',
        });
    }
}
