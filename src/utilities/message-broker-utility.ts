import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

const brokerURL = process.env.BROKER_URL;

interface Queue {
    queue: string;
}

export async function createChannelAndQueue(): Promise<{ channel: amqp.Channel; queue: Queue }> {
    try {
        const connection = await amqp.connect(brokerURL);
        const channel = await connection.createChannel();
        const queue = await channel.assertQueue('', { durable: false });
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
): Promise<string> {
    const correlationId = uuidv4();
    try {
        const result = await channel.sendToQueue(queuename, Buffer.from(JSON.stringify(message)), {
            replyTo: queue.queue,
            correlationId,
        });
        return correlationId;
    } catch (error) {
        throw error;
    }
}

export function consume(channel: any, queue: any, correlationId: any) {
    return new Promise((resolve, reject) => {
        setTimeout(function () {
            reject('No response');
        }, 50000);

        channel.consume(
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
