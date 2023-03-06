import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

//npm install @types/uuid
//npm install uuid

interface Queue {
    queue: string;
}

export async function createChannelAndQueue(): Promise<{ channel: amqp.Channel; queue: Queue }> {
    try {
        console.log("Here");
        const connection = await amqp.connect(
            'amqps://hxhbuwqc:pNhM1LZazWWxYJ9N_HPpHD0TRTNR-2-H@rat.rmq2.cloudamqp.com/hxhbuwqc'
        );
        console.log("Here2");
        const channel = await connection.createChannel();
        const queue = await channel.assertQueue('', { durable: false });
        return { channel, queue };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function sendMessage(channel: amqp.Channel, queuename : string, queue: Queue, message: string[][]): Promise<string> {
    const correlationId = uuidv4();
    try {
        const result = await channel.sendToQueue(queuename, Buffer.from(JSON.stringify(message)), {
            replyTo: queue.queue,
            correlationId,
        });
        console.log(`Message sent with result ${result}`);
        return correlationId;
    } catch (error) {
        console.error(error);
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
                    resolve(msg);
                }
            },
            {
                noAck: true,
            }
        );
    });
}

// export const sendMsg = async () => {
//     console.log("Here");
//     const queueName = 'my_queue';
//     const { channel, queue } = await createChannelAndQueue();
//     const message = { name: 'John' };
//     const correlationId = await sendMessage(channel, queueName, queue, message);
//     console.log(correlationId);
//     try {
//         const msg = await consume(channel, queue.queue, correlationId);
//         console.log("Done");
//         console.log((msg as any) ? (msg as any).content.toString()  : 'No response');
//     } catch (error) {
//         console.error(error);
//     } finally {
//         await channel.close();
//     }
// };
