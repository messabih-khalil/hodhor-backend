import { Router } from 'express';
import { isAuthenticated } from '@middlewares/isAuthenticated.middleware';
import DepartmentHandlers from '@department/department.handlers';
class DepartmentRouter {
    private router: Router;

    constructor() {
        this.router = Router();
    }

    routes(): Router {
        this.router.post(
            '/',
            [isAuthenticated],
            DepartmentHandlers.prototype.createDepartment
        );

        this.router.get(
            '/',
            [isAuthenticated],
            DepartmentHandlers.prototype.getDepartments
        );

        return this.router;
    }
}

export const departmentRouter: DepartmentRouter = new DepartmentRouter();
