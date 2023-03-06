import axios from 'axios';
import FormData from 'form-data';

import { getServiceToken } from './service-utility';

import MySingleton from './singleton-comm-utility';
import { sendMessage, consume } from './message-broker-utility';

const gatewayServiceURL = process.env.GATEWAY_SERVICE_URL;
const gatewayServiceUsername = process.env.GATEWAY_SERVICE_USERNAME;
const gatewayServicePassword = process.env.GATEWAY_SERVICE_PASSWORD;
const gatewayServiceToken = getServiceToken(gatewayServiceUsername, gatewayServicePassword);

const mySingletonInstance = MySingleton.getInstance();
const channel = mySingletonInstance.channel;
const queue = mySingletonInstance.queue;
const generateURLsQueue = process.env.GENERATE_URLS_QUEUE;
const deleteImageQueue = process.env.DELETE_IMAGE_QUEUE;

export const generateProductImagesURL = async (images: string[][]): Promise<string[][]> => {
    return new Promise(async (resolve, reject) => {
        const correlationId = await sendMessage(
            mySingletonInstance.channel,
            generateURLsQueue,
            mySingletonInstance.queue,
            images
        );

        try {
            const msg = await consume(
                mySingletonInstance.channel,
                mySingletonInstance.queue.queue,
                correlationId
            );
            console.log('Done');

            resolve(JSON.parse((msg as any)?.content?.toString() || '')?.res || []);
            //return response.data.responseURLs;
        } catch (error) {
            reject(error);
        }
    });
};

export const deleteProductImages = async (imageNames: string[]) => {
    return new Promise(async (resolve, reject) => {
        const correlationId = await sendMessage(
            mySingletonInstance.channel,
            deleteImageQueue,
            mySingletonInstance.queue,
            { imageNames: imageNames }
        );

        try {
            const msg = await consume(
                mySingletonInstance.channel,
                mySingletonInstance.queue.queue,
                correlationId
            );
            console.log('Done');

            resolve('Done');
            //return response.data.responseURLs;
        } catch (error) {
            reject(error);
        }
    });
};

export const mapProductImages = (imagesID: string[], imagesURL: string[]) => {
    return imagesID.map((imageID: string, idx: number) => ({ id: imageID, url: imagesURL[idx] }));
};
