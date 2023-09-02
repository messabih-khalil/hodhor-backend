import Validate from '@helpers/decorators/zod.decorator';
import { NextFunction, Request, Response } from 'express';
import {
    CreateUniversityRequest,
    universityBodySchema,
    loginBodyRequest,
    loginBodySchema,
    univServices,
} from '@university/index';
import { AsyncErrorHandler } from '@helpers/decorators/asyncError.decorator';
import University from './univ.models';
import { BadRequestError } from '@utils/error-handlers';
import { univCache } from './univ.cache';
import { jwtUtil } from '@utils/jwt';
import _ from 'lodash';
import HTTP_STATUS from 'http-status-codes';

// ***************

export class UniversityHandlers {
    // create university account
    @Validate(universityBodySchema)
    @AsyncErrorHandler
    async create(
        req: Request<{}, {}, CreateUniversityRequest>,
        res: Response,
        next: NextFunction
    ) {
        const { name, root, password, location } = req.body;

        // check if university with the given name or root exist

        const isExist = await University.find({
            $or: [
                {
                    name,
                },
                { root },
            ],
        }).exec();

        if (isExist.length > 0) {
            throw new BadRequestError(
                'University With given credantials already exist'
            );
        }

        // add to cache
        await univCache.addUnivToCache(root, {
            name,
            root,
            password,
            location,
        });

        res.status(HTTP_STATUS.OK).json({
            status: 'success',
            message: 'account created successfully',
        });
    }

    // login into university account
    @Validate(loginBodySchema)
    @AsyncErrorHandler
    async login(
        req: Request<{}, {}, loginBodyRequest['body']>,
        res: Response
    ): Promise<void> {
        const { root, password } = req.body;

        // Get user by root
        const univAccount = await univServices.getUnivByRoot(root);

        if (!univAccount) {
            throw new BadRequestError('Invalid Root name');
        }

        // Compare password
        const isPasswordValid = await univAccount.comparePassword(password);

        if (!isPasswordValid) {
            throw new BadRequestError('Invalid password');
        }

        // Password is valid, generate JWT token
        const { _id, name, location } = univAccount;
        const token = jwtUtil.generateJWT({ _id, name, location, root });

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
