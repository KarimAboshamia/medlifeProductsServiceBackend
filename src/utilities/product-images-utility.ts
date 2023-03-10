import MySingleton from './singleton-comm-utility';
import { sendMessage, consume } from './message-broker-utility';

const mySingletonInstance = MySingleton.getInstance();
const generateURLsQueue = process.env.GENERATE_URLS_QUEUE;
const deleteImageQueue = process.env.DELETE_IMAGE_QUEUE;

export const generateProductImagesURL = async (images: string[][]): Promise<string[][]> => {
    return new Promise(async (resolve, reject) => {
        const { correlationId, queue } = await sendMessage(
            mySingletonInstance.channel,
            generateURLsQueue,
            mySingletonInstance.queue,
            images
        );

        try {
            const msg = await consume(
                mySingletonInstance.channel,
                queue.queue,
                correlationId
            );

            resolve(JSON.parse((msg as any)?.content?.toString() || '')?.res || []);
            //return response.data.responseURLs;
        } catch (error) {
            reject(error);
        }
    });
};

export const deleteProductImages = async (imageNames: string[]) => {
    return new Promise(async (resolve, reject) => {
        const { correlationId, queue } = await sendMessage(
            mySingletonInstance.channel,
            deleteImageQueue,
            mySingletonInstance.queue,
            { imageNames: imageNames }
        );

        try {
            const msg = await consume(
                mySingletonInstance.channel,
                queue.queue,
                correlationId
            );

            resolve('Done');
        } catch (error) {
            reject(error);
        }
    });
};

export const mapProductImages = (imagesID: string[], imagesURL: string[]) => {
    return imagesID.map((imageID: string, idx: number) => ({ id: imageID, url: imagesURL[idx] }));
};
