import { Request as ExpRequest, Response as ExpResponse, NextFunction as ExpNextFunc } from 'express';

import Product from '../models/admin-product-model';
import { getError, returnResponse } from '../utilities/response-utility';
import { ResponseMsgAndCode } from '../models/response-msg-code';
import { startSession } from 'mongoose';
import { mapProductImages } from '../utilities/product-images-utility';
import { pushMessageToQueue } from '../utilities/sending-message-broker-utility';

const GENERATE_URLS_QUEUE = process.env.GENERATE_URLS_QUEUE;
const DELETE_IMAGE_QUEUE = process.env.DELETE_IMAGE_QUEUE;

const postProduct = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    const { barcode } = req.body;

    try {
        let product = await Product.findOne({ barcode }).exec();

        if (!!product) {
            throw getError(ResponseMsgAndCode.ERROR_EXIST_PRODUCT);
        }

        product = await new Product({
            name: req.body.name,
            barcode,
            type: req.body.type,
            description: req.body.description,
            images: req.body.images,
            categories: req.body.categories,
            indication: req.body.indication,
            sideEffects: req.body.sideEffects,
            dosage: req.body.dosage,
            overdoseEffects: req.body.overdoseEffects,
            precautions: req.body.precautions,
            interactions: req.body.interactions,
            storage: req.body.storage,
        }).save();

        let imagesURL = (await pushMessageToQueue(GENERATE_URLS_QUEUE, [product.images])).responseURLs[0];

        return returnResponse(res, ResponseMsgAndCode.SUCCESS_CREATE_PRODUCT, {
            product: { ...product.toObject(), images: mapProductImages(product.images, imagesURL) },
        });
    } catch (error) {
        return next(error);
    }
};

const deleteProduct = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    let { barcode } = req.params;

    const session = await startSession();

    try {
        let product = await Product.findOne({ barcode: barcode }).exec();

        if (!product) {
            throw getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE);
        }

        session.startTransaction();
        await product.remove({ session });

        await pushMessageToQueue(DELETE_IMAGE_QUEUE, product.images);

        await session.commitTransaction();

        return returnResponse(res, ResponseMsgAndCode.SUCCESS_DELETE_PRODUCT, {
            product: { ...product.toObject() },
        });
    } catch (error) {
        await session.abortTransaction();
        return next(error);
    }
};

const updateProduct = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    const { barcode: crtBarcode } = req.params;
    let { barcode } = req.body;

    try {
        if (!barcode) {
            barcode = crtBarcode;
        }

        let product: any = barcode !== crtBarcode && (await Product.findOne({ barcode }));

        if (product) {
            throw getError(ResponseMsgAndCode.ERROR_PRODUCT_BARCODE_EXIST_ALREADY);
        }

        product = await Product.findOne({ barcode: crtBarcode }).exec();

        if (!product) {
            throw getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE);
        }

        for (let key in req.body) {
            product[key] = req.body[key];
        }

        product = await product.save();

        let imagesURL = (await pushMessageToQueue(GENERATE_URLS_QUEUE, [product.images])).responseURLs[0];

        return returnResponse(res, ResponseMsgAndCode.SUCCESS_UPDATE_PRODUCT, {
            product: { ...product.toObject(), images: mapProductImages(product.images, imagesURL) },
        });
    } catch (error) {
        return next(error);
    }
};

const addImages = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    const { barcode, images } = req.body;

    try {
        let product = await Product.findOne({ barcode }).exec();

        if (!product) {
            throw getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE);
        }

        product.images = product.images.concat(images);
        product = await product.save();

        let imagesURL = (await pushMessageToQueue(GENERATE_URLS_QUEUE, [product.images])).responseURLs[0];

        return returnResponse(res, ResponseMsgAndCode.SUCCESS_UPDATE_PRODUCT, {
            product: { ...product.toObject(), images: mapProductImages(product.images, imagesURL) },
        });
    } catch (error) {
        return next(error);
    }
};

const deleteImage = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    const { barcode, image } = req.body;

    const session = await startSession();

    try {
        let product = await Product.findOne({ barcode }).exec();

        if (!product) {
            throw getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE);
        }

        if (product.images.length == 1) {
            throw getError(ResponseMsgAndCode.ERROR_NO_ENOUGH_IMAGES_TO_DELETE);
        }

        session.startTransaction();

        product.images = product.images.filter((img) => img !== image);
        product = await product.save({ session });

        await pushMessageToQueue(DELETE_IMAGE_QUEUE, [image]);

        let imagesURL = (await pushMessageToQueue(GENERATE_URLS_QUEUE, [product.images])).responseURLs[0];

        await session.commitTransaction();

        return returnResponse(res, ResponseMsgAndCode.SUCCESS_UPDATE_PRODUCT, {
            product: { ...product.toObject(), images: mapProductImages(product.images, imagesURL) },
        });
    } catch (error) {
        await session.abortTransaction();
        return next(error);
    }
};

const adminProductController = {
    postProduct,
    deleteProduct,
    updateProduct,
    addImages,
    deleteImage,
};

export default adminProductController;
