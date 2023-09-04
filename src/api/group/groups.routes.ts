import { Router } from 'express';
import { isAuthenticated } from '@middlewares/isAuthenticated.middleware';
import GroupHandlers from './groups.handlers';

class GroupRouter {
    private router: Router;

    constructor() {
        this.router = Router();
    }

    routes(): Router {
        this.router.post(
            '/',
            [isAuthenticated],
            GroupHandlers.prototype.createGroup
        );
        this.router.put(
            '/:groupId',
            [isAuthenticated],
            GroupHandlers.prototype.updateGroup
        );
        this.router.delete(
            '/:groupId',
            [isAuthenticated],
            GroupHandlers.prototype.deleteGroup
        );

        // Add a route to get all groups
        this.router.get(
            '/',
            [isAuthenticated],
            GroupHandlers.prototype.getAllGroups
        );

        return this.router;
    }
}

export const groupRouter: GroupRouter = new GroupRouter();
