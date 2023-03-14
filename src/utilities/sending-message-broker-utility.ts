import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

import ResponseError from '../models/response-error';
import SendingChannelSingleton from '../models/sending-channel-singleton';

const BROKER_URL = process.env.BROKER_URL;

interface Queue {
    queue: string;
}

export const initSender = async () => {
    try {
        await createChannelAndQueue();
    } catch (e) {
        throw e;
    }
};

export async function createChannelAndQueue(): Promise<{ channel: amqp.Channel; queue: Queue }> {
    try {
        const sendingChannel = SendingChannelSingleton.getInstance();

        const connection = await amqp.connect(BROKER_URL);
        let channel = await connection.createChannel();
        const queue = await channel.assertQueue('', { durable: false });

        sendingChannel.channel = channel;
        sendingChannel.queue = queue;

        channel.on('error', async () => {
            await connection.createChannel().then((newChannel) => {
                channel = newChannel;
                sendingChannel.channel = channel;
            });
        });

        return { channel, queue };
    } catch (error) {
        throw error;
    }
}

export async function sendMessage(
    channel: amqp.Channel,
    queueName: string,
    message: any
): Promise<{ correlationId: any; queue: Queue }> {
    const correlationId = uuidv4();

    try {
        const queue = await channel.assertQueue('', { durable: false });

        await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
            replyTo: queue.queue,
            correlationId,
        });

        return { correlationId, queue };
    } catch (error) {
        throw error;
    }
}

export function consume(channel: any, queue: any, correlationId: any) {
    return new Promise(async (resolve, reject) => {
        setTimeout(function () {
            reject('No response');
        }, 50000);

        await channel.consume(
            queue,
            (msg: any) => {
                if (msg?.properties.correlationId === correlationId) {
                    channel.cancel(msg.fields.consumerTag);
                    resolve(msg);
                }
            },
            {
                noAck: true,
            }
        );
    });
}

export const pushMessageToQueue = async (queueName: string, data: any): Promise<any> => {
    console.log(queueName, data);

    return new Promise(async (resolve, reject) => {
        try {
            const sendingChannel = SendingChannelSingleton.getInstance();

            const { correlationId, queue } = await sendMessage(sendingChannel.channel, queueName, data);

            const msg = await consume(sendingChannel.channel, queue.queue, correlationId);

            const responseBody = JSON.parse((msg as any)?.content?.toString() || '') || {};

            console.log(responseBody);

            const statusCode = +responseBody?.status;

            if (statusCode && statusCode >= 400 && statusCode < 600) {
                throw new ResponseError(responseBody.message, statusCode, responseBody.extraData);
            }

            resolve(responseBody);
        } catch (error) {
            reject(error);
        }
    });
};
