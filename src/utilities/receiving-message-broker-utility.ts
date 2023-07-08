import amqp from 'amqplib';

import ReceivingChannelSingleton from '../models/receiving-channel-singleton';
import pharmacyProductBroker from '../brokers/pharmacy-product-broker';
import productBroker from '../brokers/product-broker';

const BROKER_URL = process.env.BROKER_URL;
const DEL_PHARMACY_PRODUCTS_QUEUE = process.env.DEL_PHARMACY_PRODUCTS_QUEUE;
const GET_PHARMACIES_PRODUCTS_WITH_IDS_QUEUE = process.env.GET_PHARMACIES_PRODUCTS_WITH_IDS_QUEUE;
const GET_PRODUCTS_PHARMACIES_QUEUE = process.env.GET_PRODUCTS_PHARMACIES_QUEUE;
const REDUCE_PHARMACY_PRODUCTS_AMOUNT_IF_POSSIBLE_QUEUE =
    process.env.REDUCE_PHARMACY_PRODUCTS_AMOUNT_IF_POSSIBLE_QUEUE;
const CREATE_NOTIFY_WHEN_AVAILABLE_REQUEST_QUEUE = process.env.CREATE_NOTIFY_WHEN_AVAILABLE_REQUEST_QUEUE;

export const pullMessageFromQueue = async (
    queueName: string,
    channel: amqp.Channel,
    controller: (data: any) => Promise<any>
) => {
    try {
        channel.consume(
            queueName,
            async (msg) => {
                channel.ack(msg!);

                let data = JSON.parse(String(msg!.content));

                let res: any;

                try {
                    res = await controller(data);
                } catch (error) {
                    res = {
                        ...error,
                        message: error.message,
                        statusCode: error.statusCode || error.status || 500,
                    };
                }

                await channel.sendToQueue(msg?.properties.replyTo!, Buffer.from(JSON.stringify(res)), {
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
        channel.prefetch(10);
    } catch (error) {
        throw error;
    }
}

export const callReceiver = async () => {
    try {
        const receivingChannel = ReceivingChannelSingleton.getInstance();

        await createChannel();

        await createQueue(DEL_PHARMACY_PRODUCTS_QUEUE, receivingChannel.channel);
        await pullMessageFromQueue(
            DEL_PHARMACY_PRODUCTS_QUEUE,
            receivingChannel.channel,
            pharmacyProductBroker.deletePharmacyProducts
        );

        await createQueue(GET_PHARMACIES_PRODUCTS_WITH_IDS_QUEUE, receivingChannel.channel);
        await pullMessageFromQueue(
            GET_PHARMACIES_PRODUCTS_WITH_IDS_QUEUE,
            receivingChannel.channel,
            pharmacyProductBroker.getPharmaciesProductsWithIds
        );

        await createQueue(GET_PRODUCTS_PHARMACIES_QUEUE, receivingChannel.channel);
        await pullMessageFromQueue(
            GET_PRODUCTS_PHARMACIES_QUEUE,
            receivingChannel.channel,
            pharmacyProductBroker.getProductsPharmacies
        );

        await createQueue(REDUCE_PHARMACY_PRODUCTS_AMOUNT_IF_POSSIBLE_QUEUE, receivingChannel.channel);
        await pullMessageFromQueue(
            REDUCE_PHARMACY_PRODUCTS_AMOUNT_IF_POSSIBLE_QUEUE,
            receivingChannel.channel,
            pharmacyProductBroker.decreasePharmacyProductsAmountIfPossible
        );

        await createQueue(CREATE_NOTIFY_WHEN_AVAILABLE_REQUEST_QUEUE, receivingChannel.channel);
        await pullMessageFromQueue(
            CREATE_NOTIFY_WHEN_AVAILABLE_REQUEST_QUEUE,
            receivingChannel.channel,
            productBroker.createNotifyWhenAvailableRequest
        );
    } catch (e) {
        throw e;
    }
};
