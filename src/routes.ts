import { universityRouter } from '@api/university/univ.routes';
import { Application } from 'express';

const BASE_URL = '/api/v1';

export default (app: Application) => {
    const routes = () => {
        app.use(`${BASE_URL}/univ`, universityRouter.routes());
    };

    routes();
};
