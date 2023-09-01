import pino from 'pino';

const logger = (name: string) =>
    pino({
        name: name,
        transport: {
            target: 'pino-pretty',

            options: {
                colorize: true,
            },
        },
    });

export type Logger = ReturnType<typeof logger>;

export default logger;
