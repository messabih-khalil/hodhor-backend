import { NextFunction, Request, Response } from 'express';
import { jwtUtil } from '@utils/jwt';
import { NotAuthorizedError } from '@utils/error-handlers';

export const isAuthenticated = async (
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    if (!req.session?.token) {
        next(
            new NotAuthorizedError(
                'Token is not available. Please login again.'
            )
        );
    }

    const isValid = jwtUtil.validateJWT(req.session?.token);
    // add user id to request

    req.user = isValid;
    if (!isValid) {
        next(
            new NotAuthorizedError(
                'Token is not available. Please login again.'
            )
        );
    }

    next();
};
