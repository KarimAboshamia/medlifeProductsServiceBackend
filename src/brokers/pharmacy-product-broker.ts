import PharmacyProduct from '../models/pharmacy-product-model';
import { ResponseMsgAndCode } from '../models/response-msg-code';
import { mapProductImages } from '../utilities/product-images-utility';
import { returnBrokerResponse } from '../utilities/response-utility';
import { pushMessageToQueue } from '../utilities/sending-message-broker-utility';

const GENERATE_URLS_QUEUE = process.env.GENERATE_URLS_QUEUE;

const deletePharmacyProducts = async (pharmacyId: string) => {
    try {
        await PharmacyProduct.deleteMany({ pharmacy: pharmacyId }).exec();

        return returnBrokerResponse(ResponseMsgAndCode.SUCCESS_PHARMACY_PRODUCTS_DELETION);
    } catch (error) {
        throw error;
    }
};

const getPharmaciesProductsWithIds = async (ids: string[] = []) => {
    try {
        const products = await PharmacyProduct.find({ _id: { $in: ids } })
            .populate('product')
            .exec();

        let imagesURLs = (
            await pushMessageToQueue(
                GENERATE_URLS_QUEUE,
                products.map((product) => product.product.images)
            )
        ).responseURLs;

        return returnBrokerResponse(ResponseMsgAndCode.SUCCESS_PHARMACY_PRODUCTS_FETCHED, {
            products: products.map((product, idx) => ({
                ...product.toObject(),
                product: {
                    ...product.toObject().product,
                    images: mapProductImages(product.product.images, imagesURLs[idx]),
                },
            })),
        });
    } catch (error) {
        throw error;
    }
};

const pharmacyProductBroker = {
    deletePharmacyProducts,
    getPharmaciesProductsWithIds,
};

export default pharmacyProductBroker;
