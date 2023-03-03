import axios from 'axios';
import FormData from 'form-data';

import { getServiceToken } from './service-utility';

const gatewayServiceURL = process.env.GATEWAY_SERVICE_URL;
const gatewayServiceUsername = process.env.GATEWAY_SERVICE_USERNAME;
const gatewayServicePassword = process.env.GATEWAY_SERVICE_PASSWORD;
const gatewayServiceToken = getServiceToken(gatewayServiceUsername, gatewayServicePassword);

export const generateProductImagesURL = async (images: string[][]): Promise<string[][]> => {
    //!-------------------------
    //! REPLACE IT WITH RabbitMQ
    //!-------------------------
    try {
        const response = await axios.post(
            `${gatewayServiceURL}/api/image/images/generate`,
            {
                images,
            },
            {
                headers: {
                    Authorization: gatewayServiceToken,
                },
            }
        );

        return response.data.responseURLs;
    } catch (error) {
        throw error;
    }
};

export const deleteProductImages = async (imageNames: string[]) => {
    //!-------------------------
    //! REPLACE IT WITH RabbitMQ
    //!-------------------------
    try {
        await axios.delete(`${gatewayServiceURL}/api/image/images/delete`, {
            data: { imageName: imageNames },
            headers: {
                Authorization: gatewayServiceToken,
            },
        });
    } catch (error) {
        throw error;
    }
};

export const mapProductImages = (imagesID: string[], imagesURL: string[]) => {
    return imagesID.map((imageID: string, idx: number) => ({ id: imageID, url: imagesURL[idx] }));
};
