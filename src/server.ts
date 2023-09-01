// Third Party packages
import 'dotenv/config';
import {
    Application,
    Response,
    Request,
    NextFunction,
    urlencoded,
    json,
} from 'express';
import HTTP_STATUS from 'http-status-codes';
import http from 'http';
import hpp from 'hpp';
import cors from 'cors';
import helmet from 'helmet';
import config from 'config';
import cookieSession from 'cookie-session';
import compression from 'compression';
// Project modules
import {
    IErrorResponse,
    CustomErrorHanlder,
} from '@src/shared/utils/error-handlers';
import logger from '@src/shared/utils/logger';
import appRoutes from '@src/routes';
// Setup app server

const log = logger('server.ts');

export class Server {
    private app: Application;

    constructor(app: Application) {
        this.app = app;
    }

    public start(): void {
        this.securityMiddlewares(this.app);
        this.standardMiddlewares(this.app);
        this.routesMiddleware(this.app);
        this.globalErrorHandler(this.app);
        this.startHttpServer(this.app);
    }

    private securityMiddlewares(app: Application) {
        app.set('trust proxy', 1);
        app.use(
            cookieSession({
                name: 'session',
                keys: [
                    config.get('secret_key_one'),
                    config.get('secret_key_two'),
                ],
                maxAge: 24 * 7 * 3600000,
                secure: config.get('node_env') !== 'development',
                // sameSite: 'none',
            })
        );
        app.use(hpp());
        app.use(helmet());
        app.use(
            cors({
                // origin: config.get('client_url') ,
                origin: '*',
                credentials: true,
                optionsSuccessStatus: 200,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            })
        );
    }

    private standardMiddlewares(app: Application) {
        app.use(compression());
        app.use(json());
        app.use(urlencoded({ extended: true, limit: '50mb' }));
    }

    private routesMiddleware(app: Application) {
        appRoutes(app);
    }

    private globalErrorHandler(app: Application) {
        // Handle unregistred endpoints
        app.use('*', (req: Request, res: Response) => {
            return res
                .status(HTTP_STATUS.NOT_FOUND)
                .json({ message: `${req.url} note found` });
        });
        // Handle custom error throwing
        app.use(
            (
                error: IErrorResponse,
                _req: Request,
                res: Response,
                next: NextFunction
            ) => {
                log.error(error);
                if (error instanceof CustomErrorHanlder) {
                    return res
                        .status(error.statusCode)
                        .json(error.serializeErrors());
                }
                next();
            }
        );
    }

    private startHttpServer(app: Application): void {
        log.info(`Worker with process id of ${process.pid} has started...`);
        log.info(`Server has started with process ${process.pid}`);
        const httpServer: http.Server = new http.Server(app);
        httpServer.listen(config.get('server_port'), () => {
            log.info(`Server running on port ${config.get('server_port')}`);
        });
    }
}
