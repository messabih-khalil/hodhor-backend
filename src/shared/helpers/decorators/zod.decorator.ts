import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import { RequestError } from '@utils/error-handlers';

function validate(schema: AnyZodObject) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = function (
            req: Request,
            res: Response,
            next: NextFunction
        ) {
            try {
                schema.parse({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });
                return originalMethod.apply(this, [req, res, next]);
            } catch (error : any) {
                throw new RequestError(error);
            }
        };

        return descriptor;
    };
}

export default validate;
