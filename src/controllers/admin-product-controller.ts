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
        //^ find a product with the entered barcode
        let product = await Product.findOne({ barcode }).exec();

        //^ throw an error if there's a product (the barcode should be unique)
        if (!!product) {
            throw getError(ResponseMsgAndCode.ERROR_EXIST_PRODUCT);
        }

        //^ create a new product
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

        //^ generate the url of the product image
        let imagesURL = (await pushMessageToQueue(GENERATE_URLS_QUEUE, [product.images])).responseURLs[0];

        //^ send a response back
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
    session.startTransaction();

    try {
        //^ find a product with the entered barcode
        let product = await Product.findOne({ barcode: barcode }).exec();

        //^ throw an error if the product not exists
        if (!product) {
            throw getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE);
        }

        //^ remove product from db
        await product.remove({ session });

        //^ delete product images from the cloud
        await pushMessageToQueue(DELETE_IMAGE_QUEUE, product.images);

        //^ commit changes on db
        await session.commitTransaction();

        //^ send a response back
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

        //^ find a product with the entered new barcode if any
        let product: any = barcode !== crtBarcode && (await Product.findOne({ barcode }));

        //^ throw an error if the product exists (the barcode should be unique)
        if (product) {
            throw getError(ResponseMsgAndCode.ERROR_PRODUCT_BARCODE_EXIST_ALREADY);
        }

        //^ find the product with the barcode
        product = await Product.findOne({ barcode: crtBarcode }).exec();

        //^ throw an error if the product not exists
        if (!product) {
            throw getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE);
        }

        //^ update product data
        for (let key in req.body) {
            product[key] = req.body[key];
        }

        product = await product.save();

        //^ generate product images urls
        let imagesURL = (await pushMessageToQueue(GENERATE_URLS_QUEUE, [product.images])).responseURLs[0];

        //^ send a response back
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
        //^ find the product with the entered barcode
        let product = await Product.findOne({ barcode }).exec();

        //^ throw an error if not exists
        if (!product) {
            throw getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE);
        }

        //^ update product images
        product.images = product.images.concat(images);
        product = await product.save();

        //^ generate product images urls
        let imagesURL = (await pushMessageToQueue(GENERATE_URLS_QUEUE, [product.images])).responseURLs[0];

        //^ send a response back
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
    session.startTransaction();

    try {
        //^ find the product with the entered barcode
        let product = await Product.findOne({ barcode }).exec();

        //^ throw an error if not exists
        if (!product) {
            throw getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_BARCODE);
        }

        //^ throw an error if the product has only on image (each product must have at least one image)
        if (product.images.length == 1) {
            throw getError(ResponseMsgAndCode.ERROR_NO_ENOUGH_IMAGES_TO_DELETE);
        }

        //^ remove target product image
        product.images = product.images.filter((img) => img !== image);
        product = await product.save({ session });

        await pushMessageToQueue(DELETE_IMAGE_QUEUE, [image]);

        //^ generate product images urls
        let imagesURL = (await pushMessageToQueue(GENERATE_URLS_QUEUE, [product.images])).responseURLs[0];

        //^ commit db changes
        await session.commitTransaction();

        //^ send a response back
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
