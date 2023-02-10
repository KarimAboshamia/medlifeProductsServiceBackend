import { Request as ExpRequest, Response as ExpResponse, NextFunction as ExpNextFunc } from 'express';
import FormData from 'form-data';
import axios from 'axios';

import Product from '../models/admin-product-model';
import { getError, returnResponse } from '../utilities/response-utility';
import { ResponseMsgAndCode } from '../models/response-msg-code';
import { startSession } from 'mongoose';

const imageServiceURL = process.env.IMAGE_SERVICE_URL;

const postProduct = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    //! [1] Extract barcode from request body
    const { barcode } = req.body;
    let uploadedImages = [];
    let product = await Product.findOne({ barcode }).exec();

    //! [2] Check if product already exists
    if (!!product) {
        return next(getError(ResponseMsgAndCode.ERROR_EXIST_PRODUCT));
    }

    //! [3] Upload images to image service
    for (let i = 0; i < req.files.length; i++) {
        const body = new FormData();
        body.append('file', req.files[i].buffer, {
            filename: req.files[i].originalname,
            contentType: req.files[i].mimetype,
        });

        try {
            const response = await axios.post(`${imageServiceURL}/images/create`, body);

            uploadedImages.push(response.data.name);
        } catch (err) {
            return next(getError(ResponseMsgAndCode.ERROR_UPLOAD_IMAGE));
        }
    }

    //! [4] Create product
    product = await new Product({
        name: req.body.name,
        barcode,
        type: req.body.type,
        description: req.body.description,
        images: uploadedImages,
        categories: req.body.categories,
        indication: req.body.indication,
        sideEffects: req.body.sideEffects,
        dosage: req.body.dosage,
        overdoseEffects: req.body.overdoseEffects,
        precautions: req.body.precautions,
        interactions: req.body.interactions,
        storage: req.body.storage,
    }).save();

    //! [5] Generate images URLs
    let productsImagesNames = [];
    productsImagesNames.push(product.images);

    try {
        const responseURLs = await axios.post(`${imageServiceURL}/images/generate`, {
            images: productsImagesNames,
        });
        product.images = responseURLs.data.responseURLs[0];
    } catch (err) {
        return next(getError(ResponseMsgAndCode.ERROR_GENERATE_IMAGE_URLS));
    }

    //! [6] Return response
    return returnResponse(res, ResponseMsgAndCode.SUCCESS_CREATE_PRODUCT, {
        product: { ...product.toObject() },
    });
};

const deleteProduct = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    //! [1] Extract query params - barcode
    let barcode = req.query.barcode;

    //! [2] Check if product already exists - IF NOT EXISTS - RETURN ERROR
    let product = await Product.findOne({ barcode: barcode }).exec();

    if (!product) {
        return next(getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE));
    }

    //! [3] Delete images from image service
    let imageNames = [];
    for (let pr of product.images) {
        imageNames.push(pr);
    }

    const session = await startSession();
    session.startTransaction();
    await product.remove({ session });

    try {
        await axios.delete(`${imageServiceURL}/images/delete`, {
            data: { imageName: imageNames },
        });
    } catch (error) {
        await session.abortTransaction();
        return next(error?.response?.data || error);
    }

    await session.commitTransaction();

    //! [4] Return response
    return returnResponse(res, ResponseMsgAndCode.SUCCESS_DELETE_PRODUCT, {
        product: { ...product.toObject() },
    });
};

const updateProduct = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    //! [1] Extract Request Body
    const updatedData = {
        ...req.body,
    };

    //! [2] Check if barcode is provided - IF NOT PROVIDED - RETURN ERROR
    if (!updatedData.barcode) {
        return next(getError(ResponseMsgAndCode.ERROR_NO_BARCODE_PROVIDED));
    }

    //! [3] Check if product already exists - IF NOT EXISTS - RETURN ERROR
    let product = await Product.findOne({ barcode: updatedData.barcode }).exec();

    if (!product) {
        return next(getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE));
    }

    //! [4] Update product
    for (let key in updatedData) {
        product[key] = updatedData[key];
    }

    product = await product.save();

    //! [5] Return response
    return returnResponse(res, ResponseMsgAndCode.SUCCESS_UPDATE_PRODUCT, {
        product: { ...product.toObject() },
    });
};

const addImages = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    //! [1] Extract barcode from Request Body
    const { barcode } = req.body;
    let uploadedImages = [];

    //! [2] Check if barcode is provided - IF NOT PROVIDED - RETURN ERROR
    let product = await Product.findOne({ barcode }).exec();

    if (!product) {
        return next(getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE));
    }

    //! [3] Upload images to image service
    for (let i = 0; i < req.files.length; i++) {
        const body = new FormData();
        body.append('file', req.files[i].buffer, {
            filename: req.files[i].originalname,
            contentType: req.files[i].mimetype,
        });

        try {
            const response = await axios.post(`${imageServiceURL}/images/create`, body);
            uploadedImages.push(response.data.name);
        } catch (err) {
            return next(getError(ResponseMsgAndCode.ERROR_UPLOAD_IMAGE, err));
        }
    }

    //! [4] Update product
    product.images = product.images.concat(uploadedImages);
    product = await product.save();

    //! [5] Return response
    return returnResponse(res, ResponseMsgAndCode.SUCCESS_UPDATE_PRODUCT, {
        product: { ...product.toObject() },
    });
};

const deleteImage = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    //! [1] Extract Request Params
    const { barcode, image } = req.query;
    let imageNames = [image];

    //! [2] Check if barcode is provided - IF NOT PROVIDED - RETURN ERROR
    let product = await Product.findOne({ barcode }).exec();
    if (!product) {
        return next(getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE));
    }

    const session = await startSession();
    session.startTransaction();
    //! [3] Update product
    let totalImages = product.images.filter((img) => img !== image);
    product.images = totalImages;
    product = await product.save({ session });

    //! [4] Delete image using image service
    try {
        await axios.delete(`${imageServiceURL}/images/delete`, {
            data: { imageName: imageNames },
        });
    } catch (err) {
        await session.abortTransaction();
        return next(err?.response?.data || err);
    }

    await session.commitTransaction();

    //! [5] Return response
    return returnResponse(res, ResponseMsgAndCode.SUCCESS_UPDATE_PRODUCT, {
        product: { ...product.toObject() },
    });
};

const productController = {
    postProduct,
    deleteProduct,
    updateProduct,
    addImages,
    deleteImage,
};

export default productController;
