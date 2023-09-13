import HTTP_STATUS from 'http-status-codes';
import { departmentRouter } from '@api/department/department.routes';
import { groupRouter } from '@api/group/groups.routes';
import { studentRouter } from '@api/students/student.routes';
import { teacherRouter } from '@api/teachers/teacher.routes';
import { universityRouter } from '@api/university/univ.routes';
import { Application, Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '@utils/error-handlers';

const BASE_URL = '/api/v1';

export default (app: Application) => {
    const routes = () => {
        app.use(`${BASE_URL}/univ`, universityRouter.routes());
        app.use(`${BASE_URL}/department`, departmentRouter.routes());
        app.use(`${BASE_URL}/groups`, groupRouter.routes());
        app.use(`${BASE_URL}/students`, studentRouter.routes());
        app.use(`${BASE_URL}/teachers`, teacherRouter.routes());

        // TODO move this to auth routes
        app.get(
            `${BASE_URL}/auth/me`,
            (req: Request, res: Response, next: NextFunction) => {
                if (req.session?.role) {
                    return res.status(HTTP_STATUS.OK).json({
                        status: 'success',
                        role: req.session?.role,
                    });
                }

                return next(
                    new NotAuthorizedError(
                        'Your Not Authorized to perform this action'
                    )
                );
            }
        );
    };

    routes();
};
