import { Request as ExpRequest, Response as ExpResponse, NextFunction as ExpNextFunc } from 'express';

import PharmacyProduct from '../models/pharmacy-product-model';
import Product from '../models/admin-product-model';
import { getError, returnResponse } from '../utilities/response-utility';
import { ResponseMsgAndCode } from '../models/response-msg-code';

const postProduct = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    //! [1] Extract Data from request body
    const { pharmacyId, productId, amount, price, offer } = req.body;

    try {
        //! [2] Search for the product
        let product = await Product.findById(productId).exec();
        if (!product) {
            throw getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE);
        }

        //! [3] Search for pharmacy product with the same product and pharmacy

        const pharmProduct = await PharmacyProduct.findOne({
            product: productId,
            pharmacy: pharmacyId,
        }).exec();

        if (pharmProduct) {
            throw getError(ResponseMsgAndCode.ERROR_EXIST_PRODUCT);
        }

        //! [4] Create the product
        const pharmacyProduct = await new PharmacyProduct({
            product: product._id,
            pharmacy: pharmacyId,
            amount,
            price,
            offer,
        }).save();

        //! [6] Return the response
        returnResponse(res, ResponseMsgAndCode.SUCCESS_PRODUCT_CREATED, {
            product: { ...pharmacyProduct.toObject() },
        });
    } catch (error) {
        return next(error);
    }
};

const modifyProduct = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    //! [1] Extract Data
    const { pharmacyId, productId, amount, price, offer } = req.body;

    try {
        //! [2] Check that product exists
        const product = await PharmacyProduct.findOne({ _id: productId, pharmacy: pharmacyId }).exec();
        if (!product) {
            throw getError(ResponseMsgAndCode.ERROR_NO_PRODUCTS_FOUND);
        }

        product.amount = amount;
        product.price = price;
        product.offer = offer;
        await product.save();

        //! [3] Return the response
        returnResponse(res, ResponseMsgAndCode.SUCCESS_UPDATE_PRODUCT, {
            product: { ...product.toObject() },
        });
    } catch (error) {
        return next(error);
    }
};

const deleteProduct = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    try {
        //! [1] Extract Data
        const { pharmacyId, productId } = req.body;

        //! [2] Check that product exists
        const product = await PharmacyProduct.findOne({ _id: productId, pharmacy: pharmacyId }).exec();
        if (!product) {
            throw getError(ResponseMsgAndCode.ERROR_NO_PRODUCTS_FOUND);
        }

        //! [3] Delete the product
        await product.delete();

        //! [4] Return the response
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
