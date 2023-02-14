import axios from 'axios';
import FormData from 'form-data';

import { getServiceToken } from './service-utility';

const gatewayServiceURL = process.env.GATEWAY_SERVICE_URL;
const gatewayServiceUsername = process.env.GATEWAY_SERVICE_USERNAME;
const gatewayServicePassword = process.env.GATEWAY_SERVICE_PASSWORD;
const gatewayServiceToken = getServiceToken(gatewayServiceUsername, gatewayServicePassword);

export const uploadProductImages = async (productImages: Express.Multer.File[]): Promise<string[]> => {
    const uploadedImages = [];

    try {
        for (let i = 0; i < productImages.length; i++) {
            const body = new FormData();

            body.append('file', productImages[i].buffer, {
                filename: productImages[i].originalname,
                contentType: productImages[i].mimetype,
            });

            const response = await axios.post(`${gatewayServiceURL}/api/image/images/create`, body, {
                headers: {
                    Authorization: gatewayServiceToken,
                },
            });

            uploadedImages.push(response.data.name);
        }
    } catch (error) {
        throw error;
    }

    return uploadedImages;
};

export const generateProductImagesURL = async (images: string[][]): Promise<string[][]> => {
    console.log(images);
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
