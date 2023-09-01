import express, { Express } from 'express';

import { Server } from '@src//server';

import logger from '@src/shared/utils/logger';

import databaseConnection from '@src/shared/helpers/dbConnection';

const log = logger('app.ts');



class Application {
    public initialize(): void {
        databaseConnection();
        const app: Express = express();
        const server: Server = new Server(app);
        server.start();
        // Application.handleExit();
    }

    private static handleExit(): void {
        process.on('uncaughtException', (error: Error) => {
            log.error(`There was an uncaught error: ${error}`);
            Application.shutDownProperly(1);
        });

        process.on('unhandleRejection', (reason: Error) => {
            log.error(`Unhandled rejection at promise: ${reason}`);
            Application.shutDownProperly(2);
        });

        process.on('SIGTERM', () => {
            log.error('Caught SIGTERM');
            Application.shutDownProperly(2);
        });

        process.on('SIGINT', () => {
            log.error('Caught SIGINT');
            Application.shutDownProperly(2);
        });

        process.on('exit', () => {
            log.error('Exiting');
        });
    }

    private static shutDownProperly(exitCode: number): void {
        Promise.resolve()
            .then(() => {
                log.info('Shutdown complete');
                process.exit(exitCode);
            })
            .catch((error) => {
                log.error(`Error during shutdown: ${error}`);
                process.exit(1);
            });
    }
}

const application: Application = new Application();
application.initialize();
