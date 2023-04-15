import { startSession } from 'mongoose';

import PharmacyProduct from '../models/pharmacy-product-model';
import { ResponseMsgAndCode } from '../models/response-msg-code';
import { mapProductImages } from '../utilities/product-images-utility';
import { getError, returnBrokerResponse } from '../utilities/response-utility';
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

const getProductsPharmacies = async (productsIds: string[] = []) => {
    try {
        const products = await PharmacyProduct.find({ _id: { $in: productsIds } }).exec();

        const pharmacies = {};

        products.forEach((product) => {
            const pharmacyId = product.pharmacy.toString();

            if (!pharmacies[pharmacyId]) {
                pharmacies[pharmacyId] = [];
            }

            pharmacies[pharmacyId].push(product._id.toString());
        });

        return returnBrokerResponse(ResponseMsgAndCode.SUCCESS_PRODUCTS_PHARMACIES_FETCHED, {
            pharmacies,
        });
    } catch (error) {
        throw error;
    }
};

const decreasePharmacyProductsAmountIfPossible = async (data: {
    pharmacyId: string;
    products: { [key: string]: number };
}) => {
    const session = await startSession();
    session.startTransaction();

    try {
        const pharmacyProducts = await PharmacyProduct.find({
            _id: { $in: Object.keys(data.products) },
            pharmacy: data.pharmacyId,
        });

        for (const product of pharmacyProducts) {
            const quantity = +data.products[product._id.toString()];

            if (product.amount < quantity) {
                throw getError(ResponseMsgAndCode.ERROR_NO_ENOUGH_PHARMACY_PRODUCT_AMOUNT);
            }

            product.amount -= quantity;

            await product.save({ session });
        }

        await session.commitTransaction();

        return returnBrokerResponse(ResponseMsgAndCode.SUCCESS_PHARMACY_PRODUCTS_AMOUNT_REDUCED, {});
    } catch (error) {
        await session.abortTransaction();
        throw error;
    }
};

const pharmacyProductBroker = {
    deletePharmacyProducts,
    getPharmaciesProductsWithIds,
    getProductsPharmacies,
    decreasePharmacyProductsAmountIfPossible,
};

export default pharmacyProductBroker;
