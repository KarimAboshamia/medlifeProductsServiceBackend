import { Request as ExpRequest, Response as ExpResponse, NextFunction as ExpNextFunc } from 'express';
import axios from 'axios';
import amqp from 'amqplib';
import { uuid } from 'uuidv4';
import { startSession, Types } from 'mongoose';

import PharmacyProduct from '../models/pharmacy-product-model';
import Product from '../models/admin-product-model';
import { getError, returnResponse } from '../utilities/response-utility';
import { ResponseMsgAndCode } from '../models/response-msg-code';

const imageServiceURL = process.env.IMAGE_SERVICE_URL;
const pharmacyServiceURL = process.env.PHARMACY_SERVICE_URL;

const postProduct = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    //! [1] Extract Data from request body
    const { pharmacyId, productId, amount, price, offer } = req.body;

    //! [2] Search for the product
    let product = await Product.findById(productId).exec();
    if (!product) {
        return next(getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE));
    }

    //! [3] Search for pharmacy product with the same product and pharmacy

    const pharmProduct = await PharmacyProduct.findOne({
        product: productId,
        pharmacy: pharmacyId,
    }).exec();

    if (pharmProduct) {
        return next(getError(ResponseMsgAndCode.ERROR_EXIST_PRODUCT));
    }

    const session = await startSession();
    session.startTransaction();

    //! [4] Create the product
    const pharmacyProduct = await new PharmacyProduct({
        product: product._id,
        pharmacy: pharmacyId,
        amount,
        price,
        offer,
    }).save({ session });

    //! [5] Add product in the pharmacy - send product ID
    try {
        await axios.post(`${pharmacyServiceURL}/api/pharmacist/pharmacy/products/add`, {
            pharmacyId,
            productId: pharmacyProduct._id,
        });
    } catch (error) {
        await session.abortTransaction();
        return next(error?.response?.data || error);
    }

    await session.commitTransaction();

    //! [6] Return the response
    returnResponse(res, ResponseMsgAndCode.SUCCESS_PRODUCT_CREATED, {
        product: { ...pharmacyProduct.toObject() },
    });
};


const modifyProduct = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    //! [1] Extract Data
    const { productId, amount, price, offer } = req.body;

    //! [2] Check that product exists
    const product = await PharmacyProduct.findById(productId).exec();
    if (!product) {
        return next(getError(ResponseMsgAndCode.ERROR_NO_PRODUCTS_FOUND));
    }

    product.amount = amount;
    product.price = price;
    product.offer = offer;
    await product.save();

    //! [3] Return the response
    returnResponse(res, ResponseMsgAndCode.SUCCESS_UPDATE_PRODUCT, {
        product: { ...product.toObject() },
    });
};

const deleteProduct = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    //! [1] Extract Data
    const { productId } = req.body;

    //! [2] Check that product exists
    const product = await PharmacyProduct.findById(productId).exec();
    if (!product) {
        return next(getError(ResponseMsgAndCode.ERROR_NO_PRODUCTS_FOUND));
    }

    //! [3] Delete the product
    await product.delete();

    //! [4] Return the response
    returnResponse(res, ResponseMsgAndCode.SUCCESS_DELETE_PRODUCT, {
        product: { ...product.toObject() },
    });
};

const productController = {
    postProduct,
    modifyProduct,
    deleteProduct,
};

export default productController;
