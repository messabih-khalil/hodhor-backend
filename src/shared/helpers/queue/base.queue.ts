import logger, { Logger } from '@src/shared/utils/logger';
import { Queue, Worker, QueueEvents, Processor } from 'bullmq';
import config from 'config';
import IORedis from 'ioredis';

const connection = new IORedis(config.get<string>('redis_host'));

abstract class BaseWorker {
    worker: Worker;
    log: Logger;
    constructor(public queueName: string, public processor: Processor) {
        // Create Worker to proccess jobs
        this.worker = new Worker(queueName, processor, {
            connection,
        });

        this.log = logger(queueName);

        // Log Jobs Status
        this.worker.on('completed', (job) => {
            this.log.info(`${job.id} has completed!`);
        });

        this.worker.on('failed', (job, err) => {
            this.log.error(`${job?.id} has failed with ${err.message}`);
        });
    }
}

export abstract class BaseQueue extends BaseWorker {
    queue: Queue;

    queueName: string;

    constructor(queueName: string, public processor: Processor) {
        // process jobs
        super(queueName, processor);
        //

        this.queue = new Queue(queueName, {
            connection,
        });
        this.queueName = queueName;
    }

    // Add jobs to queue
    async addJobToQueue(jobName: string, job: any) {
        await this.queue.add(jobName, job, { removeOnComplete: true });
    }
}
