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
        console.log("Consuming");
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

                console.log("Sending back the response");
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
        console.log("connect to broker URL")
        const connection = await amqp.connect(BROKER_URL);
        console.log("create channel")
        let channel = await connection.createChannel();

        const receivingChannel = ReceivingChannelSingleton.getInstance();

        receivingChannel.channel = channel;

        console.log("reopen channel")
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
        console.log("create queue")
        await channel.assertQueue(queueName, { durable: false });
        channel.prefetch(1);
    } catch (error) {
        throw error;
    }
}

export const callReceiver = async () => {
    try {
        const receivingChannel = ReceivingChannelSingleton.getInstance();

        console.log("calling create channel");
        await createChannel();

        
        console.log("calling create queue 1");
        await createQueue(DEL_PHARMACY_PRODUCTS_QUEUE, receivingChannel.channel);

        console.log("calling pull message from queue 1");
        await pullMessageFromQueue(
            DEL_PHARMACY_PRODUCTS_QUEUE,
            receivingChannel.channel,
            pharmacyProductBroker.deletePharmacyProducts
        );

        console.log("calling create queue 2");
        await createQueue(GET_PHARMACIES_PRODUCTS_WITH_IDS_QUEUE, receivingChannel.channel);

        console.log("calling pull message from queue 2");
        await pullMessageFromQueue(
            GET_PHARMACIES_PRODUCTS_WITH_IDS_QUEUE,
            receivingChannel.channel,
            pharmacyProductBroker.getPharmaciesProductsWithIds
        );

        console.log("calling create queue 3");
        await createQueue(GET_PRODUCTS_PHARMACIES_QUEUE, receivingChannel.channel);
        console.log("calling pull message from queue 3");
        await pullMessageFromQueue(
            GET_PRODUCTS_PHARMACIES_QUEUE,
            receivingChannel.channel,
            pharmacyProductBroker.getProductsPharmacies
        );

        console.log("calling create queue 4");
        await createQueue(REDUCE_PHARMACY_PRODUCTS_AMOUNT_IF_POSSIBLE_QUEUE, receivingChannel.channel);
        console.log("calling pull message from queue 4");
        await pullMessageFromQueue(
            REDUCE_PHARMACY_PRODUCTS_AMOUNT_IF_POSSIBLE_QUEUE,
            receivingChannel.channel,
            pharmacyProductBroker.decreasePharmacyProductsAmountIfPossible
        );

        console.log("calling create queue 5");
        await createQueue(CREATE_NOTIFY_WHEN_AVAILABLE_REQUEST_QUEUE, receivingChannel.channel);
        console.log("calling pull message from queue 5");
        await pullMessageFromQueue(
            CREATE_NOTIFY_WHEN_AVAILABLE_REQUEST_QUEUE,
            receivingChannel.channel,
            productBroker.createNotifyWhenAvailableRequest
        );
    } catch (e) {
        throw e;
    }
};
