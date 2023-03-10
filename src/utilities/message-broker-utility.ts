import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import MySingleton from './singleton-comm-utility';

const brokerURL = process.env.BROKER_URL;

interface Queue {
    queue: string;
}

export async function createChannelAndQueue(): Promise<{ channel: amqp.Channel; queue: Queue }> {
    try {
        const mySingletonInstance = MySingleton.getInstance();

        const connection = await amqp.connect(brokerURL);
        let channel = await connection.createChannel();
        const queue = await channel.assertQueue('', { durable: false });

        mySingletonInstance.channel = channel;
        mySingletonInstance.queue = queue;

        channel.on('error', async () => {
            // Re-open the channel
            await connection.createChannel().then((newChannel) => {
                channel = newChannel;
                mySingletonInstance.channel = channel;
            });
        });

        return { channel, queue };
    } catch (error) {
        throw error;
    }
}

export async function sendMessage(
    channel: amqp.Channel,
    queuename: string,
    queue: Queue,
    message: any
): Promise<{ correlationId: any; queue: Queue }> {
    const correlationId = uuidv4();
    try {
        const queue = await channel.assertQueue('', { durable: false });

        const result = await channel.sendToQueue(queuename, Buffer.from(JSON.stringify(message)), {
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
