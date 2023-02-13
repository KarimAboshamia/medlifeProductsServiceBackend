import { Request as ExpRequest, Response as ExpResponse, NextFunction as ExpNextFunc } from 'express';

import Product from '../models/admin-product-model';
import { getAxiosError, getError, returnResponse } from '../utilities/response-utility';
import { ResponseMsgAndCode } from '../models/response-msg-code';
import { startSession } from 'mongoose';
import ResponseError from '../models/response-error';
import {
    deleteProductImages,
    generateProductImagesURL,
    mapProductImages,
    uploadProductImages,
} from '../utilities/product-images-utility';

const postProduct = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    const { barcode } = req.body;

    let productImages = (req.files as Express.Multer.File[]).filter((file) =>
        file.fieldname.match(/^productImages/)
    );

    if (productImages.length <= 0) {
        return next(new ResponseError('product images are required!', 422));
    }

    let product = await Product.findOne({ barcode }).exec();

    if (!!product) {
        return next(getError(ResponseMsgAndCode.ERROR_EXIST_PRODUCT));
    }

    let uploadedImages = [];

    try {
        uploadedImages = await uploadProductImages(productImages);
    } catch (error) {
        return next(getAxiosError(error));
    }

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

    let imagesURL = [];

    try {
        imagesURL = (await generateProductImagesURL([product.images]))[0];
    } catch (error) {
        return next(getAxiosError(error));
    }

    return returnResponse(res, ResponseMsgAndCode.SUCCESS_CREATE_PRODUCT, {
        product: { ...product.toObject(), images: mapProductImages(product.images, imagesURL) },
    });
};

const deleteProduct = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    let { barcode } = req.params;

    let product = await Product.findOne({ barcode: barcode }).exec();

    if (!product) {
        return next(getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE));
    }

    const session = await startSession();
    session.startTransaction();
    await product.remove({ session });

    try {
        await deleteProductImages(product.images);
    } catch (error) {
        await session.abortTransaction();
        return next(getAxiosError(error));
    }

    await session.commitTransaction();

    return returnResponse(res, ResponseMsgAndCode.SUCCESS_DELETE_PRODUCT, {
        product: { ...product.toObject() },
    });
};

const updateProduct = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    const { barcode: crtBarcode } = req.params;
    let { barcode } = req.body;

    if (!barcode) {
        barcode = crtBarcode;
    }

    let product: any = barcode !== crtBarcode && (await Product.findOne({ barcode }));

    if (product) {
        return next(getError(ResponseMsgAndCode.ERROR_PRODUCT_BARCODE_EXIST_ALREADY));
    }

    product = await Product.findOne({ barcode: crtBarcode }).exec();

    if (!product) {
        return next(getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE));
    }

    for (let key in req.body) {
        product[key] = req.body[key];
    }

    product = await product.save();

    let imagesURL = [];

    try {
        imagesURL = (await generateProductImagesURL([product.images]))[0];
    } catch (error) {
        return next(getAxiosError(error));
    }

    return returnResponse(res, ResponseMsgAndCode.SUCCESS_UPDATE_PRODUCT, {
        product: { ...product.toObject(), images: mapProductImages(product.images, imagesURL) },
    });
};

const addImages = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    const { barcode } = req.body;

    let productImages = (req.files as Express.Multer.File[]).filter((file) =>
        file.fieldname.match(/^productImages/)
    );

    if (productImages.length <= 0) {
        return next(new ResponseError('product images are required!', 422));
    }

    let product = await Product.findOne({ barcode }).exec();

    if (!product) {
        return next(getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE));
    }

    let uploadedImages = [];

    try {
        uploadedImages = await uploadProductImages(productImages);
    } catch (error) {
        return next(getAxiosError(error));
    }

    product.images = product.images.concat(uploadedImages);
    product = await product.save();

    let imagesURL = [];

    try {
        imagesURL = (await generateProductImagesURL([product.images]))[0];
    } catch (error) {
        return next(getAxiosError(error));
    }

    return returnResponse(res, ResponseMsgAndCode.SUCCESS_UPDATE_PRODUCT, {
        product: { ...product.toObject(), images: mapProductImages(product.images, imagesURL) },
    });
};

const deleteImage = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    const { barcode, image } = req.body;

    let product = await Product.findOne({ barcode }).exec();

    if (!product) {
        return next(getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE));
    }

    if (product.images.length == 1) {
        return next(getError(ResponseMsgAndCode.ERROR_NO_ENOUGH_IMAGES_TO_DELETE));
    }

    const session = await startSession();
    session.startTransaction();

    product.images = product.images.filter((img) => img !== image);
    product = await product.save({ session });

    try {
        await deleteProductImages(product.images);
    } catch (error) {
        await session.abortTransaction();
        return next(getAxiosError(error));
    }

    let imagesURL = [];

    try {
        imagesURL = (await generateProductImagesURL([product.images]))[0];
    } catch (error) {
        await session.abortTransaction();
        return next(getAxiosError(error));
    }

    await session.commitTransaction();

    return returnResponse(res, ResponseMsgAndCode.SUCCESS_UPDATE_PRODUCT, {
        product: { ...product.toObject(), images: mapProductImages(product.images, imagesURL) },
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
