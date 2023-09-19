import { Router } from 'express';
import AuthHandlers from './auth.handlers';
import { isAuthenticated } from '@middlewares/isAuthenticated.middleware';

class AuthRouter {
    private router: Router;

    constructor() {
        this.router = Router();
    }

    routes(): Router {
        const authHandlers = new AuthHandlers();

        // Create user route
        this.router.post('/signup', authHandlers.createUser);

        // Login route
        this.router.post('/signin', authHandlers.login);

        // Logout route (requires authentication)
        this.router.post('/logout', [isAuthenticated], authHandlers.logout);

        return this.router;
    }
}

export const authRouter: AuthRouter = new AuthRouter();
