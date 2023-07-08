import { Request as ExpRequest, Response as ExpResponse, NextFunction as ExpNextFunc } from 'express';

import PharmacyProduct from '../models/pharmacy-product-model';
import Product from '../models/admin-product-model';
import { getError, returnResponse } from '../utilities/response-utility';
import { ResponseMsgAndCode } from '../models/response-msg-code';
import { pushMessageToQueue } from '../utilities/sending-message-broker-utility';
import { notifyWithProductNewAddedAmount } from '../utilities/notify-when-available-utility';

const GENERATE_URLS_QUEUE = process.env.GENERATE_URLS_QUEUE;

const postProduct = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    const { pharmacyId, productId, amount, price, offer } = req.body;

    try {
        //^ find an admin product with the entered id
        let product = await Product.findById(productId).exec();

        //^ throw an error if not exists
        if (!product) {
            throw getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE);
        }

        //^ find pharmacy product with the same adimn product and pharmacy
        const pharmProduct = await PharmacyProduct.findOne({
            product: productId,
            pharmacy: pharmacyId,
        }).exec();

        //^ throw an error of exists (a pharmacy must add an admin product only once)
        if (pharmProduct) {
            throw getError(ResponseMsgAndCode.ERROR_EXIST_PRODUCT);
        }

        //^ create the product
        const pharmacyProduct = await new PharmacyProduct({
            product: product._id,
            pharmacy: pharmacyId,
            amount,
            price,
            offer,
        }).save();

        //^ notify users that created notifyWhenAvailableRequest
        try {
            await notifyWithProductNewAddedAmount(productId, pharmacyId);
        } catch (error) {
            //! we don't care when an error occurs here
        }

        //^ send a response back
        returnResponse(res, ResponseMsgAndCode.SUCCESS_PRODUCT_CREATED, {
            product: {
                ...pharmacyProduct.toObject(),
                product: {
                    ...product.toObject(),
                    images: (await pushMessageToQueue(GENERATE_URLS_QUEUE, [product.images])).responseURLs[0],
                },
            },
        });
    } catch (error) {
        return next(error);
    }
};

const modifyProduct = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    const { pharmacyId, productId, amount, price, offer } = req.body;

    try {
        //^ find a pharmacy product with the entered product and pharmacy id
        let product = await PharmacyProduct.findOne({ _id: productId, pharmacy: pharmacyId })
            .populate('product')
            .exec();

        //^ throw an error if not exists
        if (!product) {
            throw getError(ResponseMsgAndCode.ERROR_NO_PRODUCTS_FOUND);
        }

        //^ update product data
        const previousProductAmount = product.amount;

        product.amount = amount;
        product.price = price;
        product.offer = offer || product.offer;

        product = await product.save();

        //^ notify the users that created notifyWhenAvailableRequest
        if (previousProductAmount === 0 && product.amount > 0) {
            try {
                await notifyWithProductNewAddedAmount(product.product['_id'], pharmacyId);
            } catch (error) {
                //! we don't care when an error occurs here
            }
        }

        //^ send a response back
        returnResponse(res, ResponseMsgAndCode.SUCCESS_UPDATE_PRODUCT, {
            product: {
                ...product.toObject(),
                product: {
                    ...product.toObject().product,
                    images: (await pushMessageToQueue(GENERATE_URLS_QUEUE, [product.product.images]))
                        .responseURLs[0],
                },
            },
        });
    } catch (error) {
        return next(error);
    }
};

const deleteProduct = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    try {
        const { pharmacyId, productId } = req.body;

        //^ find a pharmacy product with the entered product and pharmacy id
        const product = await PharmacyProduct.findOne({ _id: productId, pharmacy: pharmacyId }).exec();
        
        //^ throw an error if not exists
        if (!product) {
            throw getError(ResponseMsgAndCode.ERROR_NO_PRODUCTS_FOUND);
        }

        //^ delete the product
        await product.delete();

        //^ send a response back
        returnResponse(res, ResponseMsgAndCode.SUCCESS_DELETE_PRODUCT, {
            product: { ...product.toObject() },
        });
    } catch (error) {
        return next(error);
    }
};

const pharmacyProductController = {
    postProduct,
    modifyProduct,
    deleteProduct,
};

export default pharmacyProductController;
