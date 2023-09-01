import { Response, Request, NextFunction } from 'express';

// Decorator for async error handling
export const AsyncErrorHandler = (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            await originalMethod.call(this, req, res, next);
        } catch (error) {
            next(error);
        }
    };

    return descriptor;
};
