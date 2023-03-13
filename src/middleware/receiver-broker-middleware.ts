import productController from '../controllers/pharmacist-product-controller';

import { createChannel, createQueue, pullMessageFromQueue } from '../utilities/receiver-broker-utility';

import ChannelMySingleton from '../utilities/singleton-rec-utility';

const DEL_PHARMACY_PRODUCTS_QUEUE = process.env.DEL_PHARMACY_PRODUCTS_QUEUE;

export const callReceiver = async () => {
    try {
        const mySingletonInstance = ChannelMySingleton.getInstance();

        await createChannel();

        await createQueue(DEL_PHARMACY_PRODUCTS_QUEUE, mySingletonInstance.channel);
        pullMessageFromQueue(
            DEL_PHARMACY_PRODUCTS_QUEUE,
            mySingletonInstance.channel,
            productController.deletePharmacyProducts
        );
    } catch (e) {
        throw e;
    }
};
