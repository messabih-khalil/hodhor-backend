import HTTP_STATUS from 'http-status-codes';
import { departmentRouter } from '@api/department/department.routes';
import { groupRouter } from '@api/group/groups.routes';
import { studentRouter } from '@api/students/student.routes';
import { teacherRouter } from '@api/teachers/teacher.routes';
import { universityRouter } from '@api/university/univ.routes';
import { Application } from 'express';

import { authRouter } from '@api/auth/auth.routes';

const BASE_URL = '/api/v1';

export default (app: Application) => {
    const routes = () => {
        app.use(`${BASE_URL}/univ`, universityRouter.routes());
        app.use(`${BASE_URL}/department`, departmentRouter.routes());
        app.use(`${BASE_URL}/groups`, groupRouter.routes());
        app.use(`${BASE_URL}/students`, studentRouter.routes());
        app.use(`${BASE_URL}/teachers`, teacherRouter.routes());
        app.use(`${BASE_URL}/auth`, authRouter.routes());
    };

    routes();
};
