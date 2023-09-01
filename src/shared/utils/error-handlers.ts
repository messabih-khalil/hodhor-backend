import HTTP_STATUS from 'http-status-codes';

export interface IErrorResponse {
    message: string;
    statusCode: number;
    status: string;
    serializeErrors(): IError;
}

export interface IError {
    message: string;
    statusCode: number;
    status: string;
}

export abstract class CustomErrorHanlder extends Error {
    abstract statusCode: number;
    abstract status: string;

    constructor(message: string) {
        super(message);
    }

    serializeErrors(): IError | any {
        return {
            message: this.message,
            statusCode: this.statusCode,
            status: this.status,
        };
    }
}

// handle bad request error

export class BadRequestError extends CustomErrorHanlder {
    status: string = 'error';
    statusCode: number = HTTP_STATUS.BAD_REQUEST;

    constructor(message: string) {
        super(message);
    }
}

export class NotFoundError extends CustomErrorHanlder {
    statusCode = HTTP_STATUS.NOT_FOUND;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}

export class NotAuthorizedError extends CustomErrorHanlder {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}

export class ServerError extends CustomErrorHanlder {
    statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}

interface ZodIssue {
    code: string;
    message: string;
    path: string[];
}

interface ZodErrorData {
    issues: ZodIssue[];
}

// Handle Request error

export class RequestError extends CustomErrorHanlder {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    status = 'error';

    constructor(private errorData: ZodErrorData) {
        super('Request Error');
    }

    serializeErrors() {
        const errors = this.errorData.issues.map((issue) => ({
            path: issue.path[1],
            message: issue.message,
        }));

        return {
            statusCode: this.statusCode,
            status: this.status,
            errors,
        };
    }
}
