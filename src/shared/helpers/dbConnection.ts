import mongoose from 'mongoose';
import config from 'config';
import logger from '@src/shared/utils/logger';
import { redisConnection } from '@src/shared/helpers/redis/redis.connection';

const log = logger('dbConnection.ts');

export default () => {
    const connect = () => {
        mongoose
            .connect(config.get('database_uri'))
            .then(() => {
                log.info('Successfully connected to database.');
                // Create Connection to redis db
                redisConnection.connect();
            })
            .catch((error) => {
                log.error('Error connecting to database', error);
                return process.exit(1);
            });
    };
    connect();

    mongoose.connection.on('disconnected', connect);
};
