// teacher.routes.ts
import { Router } from 'express';
import TeacherHandlers from '@teachers/teacher.handlers';
import { isAuthenticated } from '@middlewares/isAuthenticated.middleware';

class TeacherRouter {
    private router: Router;

    constructor() {
        this.router = Router();
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post(
            '/',
            [isAuthenticated],
            TeacherHandlers.prototype.createTeacher
        );

        this.router.get(
            '/',
            [isAuthenticated],
            TeacherHandlers.prototype.getTeachersByDepartmentId
        );

        this.router.put(
            '/:teacherId',
            [isAuthenticated],
            TeacherHandlers.prototype.updateTeacher
        );

        this.router.post('/login', TeacherHandlers.prototype.login);
        this.router.post(
            '/logout',
            [isAuthenticated],
            TeacherHandlers.prototype.logout
        );

        this.router.get(
            '/teacher/groups',
            [isAuthenticated],
            TeacherHandlers.prototype.getGroupsForTeacher
        );
    }

    routes(): Router {
        return this.router;
    }
}

export const teacherRouter: TeacherRouter = new TeacherRouter();
