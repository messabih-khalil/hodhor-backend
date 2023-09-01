import { NextFunction, Request, Response } from 'express';
import { jwtUtil } from '@utils/jwt';
import { NotAuthorizedError } from '@utils/error-handlers';
export const isAuthenticated = async (
    req: Request,
    res: Response,
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

    if (!isValid) {
        next(
            new NotAuthorizedError(
                'Token is not available. Please login again.'
            )
        );
    }

    next();
};
