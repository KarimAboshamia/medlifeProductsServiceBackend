import { startSession } from 'mongoose';

import PharmacyProduct from '../models/pharmacy-product-model';
import { ResponseMsgAndCode } from '../models/response-msg-code';
import { mapProductImages } from '../utilities/product-images-utility';
import { getError, returnBrokerResponse } from '../utilities/response-utility';
import { pushMessageToQueue } from '../utilities/sending-message-broker-utility';

const GENERATE_URLS_QUEUE = process.env.GENERATE_URLS_QUEUE;

const deletePharmacyProducts = async (pharmacyId: string) => {
    try {
        //^ delete all the products of a specific pharmacy
        await PharmacyProduct.deleteMany({ pharmacy: pharmacyId }).exec();

        //^ send a response back
        return returnBrokerResponse(ResponseMsgAndCode.SUCCESS_PHARMACY_PRODUCTS_DELETION);
    } catch (error) {
        throw error;
    }
};

const getPharmaciesProductsWithIds = async (ids: string[] = []) => {
    try {
        //^ get the products of the pharmacies that their id exists in ids array
        const products = await PharmacyProduct.find({ _id: { $in: ids } })
            .populate('product')
            .exec();

        //^ generate product images ids
        let imagesURLs = (
            await pushMessageToQueue(
                GENERATE_URLS_QUEUE,
                products.map((product) => product.product.images)
            )
        ).responseURLs;
        
        //^ send a response back
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
        //^ get the products that their id exists in the productsIds array
        const products = await PharmacyProduct.find({ _id: { $in: productsIds } }).exec();

        const pharmacies = {};

        //^ group products by the pharmacy id
        products.forEach((product) => {
            const pharmacyId = product.pharmacy.toString();

            if (!pharmacies[pharmacyId]) {
                pharmacies[pharmacyId] = [];
            }

            pharmacies[pharmacyId].push(product._id.toString());
        });

        //^ send a response back
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
        //^ get the products of the pharmacy with "data.pharmacyId" that their id exists as a key in "data.products"
        const pharmacyProducts = await PharmacyProduct.find({
            _id: { $in: Object.keys(data.products) },
            pharmacy: data.pharmacyId,
        });

        //^ decrease the product amount if it's enough otherwise throw an error
        for (const product of pharmacyProducts) {
            const quantity = +data.products[product._id.toString()];

            if (product.amount < quantity) {
                throw getError(ResponseMsgAndCode.ERROR_NO_ENOUGH_PHARMACY_PRODUCT_AMOUNT);
            }

            product.amount -= quantity;

            await product.save({ session });
        }

        //^ commit db changes
        await session.commitTransaction();

        //^ send a response back
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
