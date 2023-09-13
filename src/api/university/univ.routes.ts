import { Router } from 'express';
import { UniversityHandlers } from '@api/university/index';
import { isAuthenticated } from '@middlewares/isAuthenticated.middleware';

class UnivertsityRouter {
    private router: Router;

    constructor() {
        this.router = Router();
    }

    routes(): Router {
        this.router.post('/', UniversityHandlers.prototype.create);
        this.router.post('/login', UniversityHandlers.prototype.login);
        this.router.post(
            '/logout',
            [isAuthenticated],
            UniversityHandlers.prototype.logout
        );

        return this.router;
    }
}

export const universityRouter: UnivertsityRouter = new UnivertsityRouter();
