import amqp from 'amqplib';

import ReceivingChannelSingleton from '../models/receiving-channel-singleton';
import pharmacyProductBroker from '../brokers/pharmacy-product-broker';

const BROKER_URL = process.env.BROKER_URL;
const DEL_PHARMACY_PRODUCTS_QUEUE = process.env.DEL_PHARMACY_PRODUCTS_QUEUE;

export const pullMessageFromQueue = async (
    queueName: string,
    channel: amqp.Channel,
    controller: (data: any) => Promise<any>
) => {
    console.log(queueName);

    try {
        channel.consume(
            queueName,
            async (msg) => {
                channel.ack(msg!);

                let data = JSON.parse(String(msg!.content));

                console.log(data);

                let res: any;

                try {
                    res = await controller(data);
                } catch (error) {
                    res = error;
                }

                console.log(res);

                channel.sendToQueue(msg?.properties.replyTo!, Buffer.from(JSON.stringify(res)), {
                    correlationId: msg?.properties.correlationId,
                });
            },
            { noAck: false }
        );
    } catch (error) {
        throw error;
    }
};

export async function createChannel(): Promise<{ channel: amqp.Channel }> {
    try {
        const connection = await amqp.connect(BROKER_URL);
        let channel = await connection.createChannel();

        const receivingChannel = ReceivingChannelSingleton.getInstance();

        receivingChannel.channel = channel;

        //when connection is closed reopen channel
        channel.on('error', async () => {
            // Re-open the channel
            await connection.createChannel().then((newChannel) => {
                channel = newChannel;
                receivingChannel.channel = channel;
            });
        });

        return { channel };
    } catch (error) {
        throw error;
    }
}

export async function createQueue(queueName: string, channel: amqp.Channel) {
    try {
        await channel.assertQueue(queueName, { durable: false });
        channel.prefetch(1);
    } catch (error) {
        throw error;
    }
}

export const callReceiver = async () => {
    try {
        const receivingChannel = ReceivingChannelSingleton.getInstance();

        await createChannel();

        await createQueue(DEL_PHARMACY_PRODUCTS_QUEUE, receivingChannel.channel);
        pullMessageFromQueue(
            DEL_PHARMACY_PRODUCTS_QUEUE,
            receivingChannel.channel,
            pharmacyProductBroker.deletePharmacyProducts
        );
    } catch (e) {
        throw e;
    }
};
