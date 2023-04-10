import { Request as ExpRequest, Response as ExpResponse, NextFunction as ExpNextFunc } from 'express';

import Product from '../models/admin-product-model';
import PharmacyProduct from '../models/pharmacy-product-model';
import Categories from '../models/category-model';
import { returnResponse } from '../utilities/response-utility';
import { ResponseMsgAndCode } from '../models/response-msg-code';
import { Types } from 'mongoose';
import { mapProductImages } from '../utilities/product-images-utility';
import { pushMessageToQueue } from '../utilities/sending-message-broker-utility';

const GENERATE_URLS_QUEUE = process.env.GENERATE_URLS_QUEUE;
const PHARMACY_DETAILS_QUEUE = process.env.GET_PHARMACY_DETAILS_QUEUE;

const getProducts = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    //! [1] Extract query params
    let { page, itemsPerPage, barcode, name, type, categories } = req.query;

    try {
        name = `^${!name ? '' : name}`;
        barcode = `^${!barcode ? '' : barcode}`;
        type = `^${!type ? '' : type + '$'}`;

        //! [2] Create filter
        const productFilter: any = {
            name: { $regex: new RegExp(name), $options: 'i' },
            barcode: { $regex: new RegExp(barcode), $options: 'i' },
            type: { $regex: new RegExp(type), $options: 'i' },
        };

        //! [3] Add categories to filter - IF EXISTS
        if (!!categories) {
            productFilter.categories = {
                $all: (categories as string).split(',').map((cat) => cat.trim()),
            };
        }

        //! [4] Get products
        let limitValue =
            itemsPerPage?.length == 0 || isNaN(+itemsPerPage) || +itemsPerPage < 1 ? 20 : +itemsPerPage;
        let skipValue = page?.length == 0 || isNaN(+page) || +page < 1 ? 1 : +page;

        const nextProducts = await Product.find(productFilter)
            .limit(limitValue)
            .skip(skipValue * limitValue)
            .exec();

        let products = await Product.find(productFilter)
            .limit(limitValue)
            .skip((skipValue - 1) * limitValue)
            .exec();

        let imagesURLs = (
            await pushMessageToQueue(
                GENERATE_URLS_QUEUE,
                products.map((product) => product.images)
            )
        ).responseURLs;

        //! [6] Return response
        return returnResponse(res, ResponseMsgAndCode.SUCCESS_FOUND_PRODUCTS, {
            products: products.map((product, idx) => ({
                ...product.toObject(),
                images: mapProductImages(product.images, imagesURLs[idx]),
            })),
            hasNext: nextProducts.length > 0,
        });
    } catch (error) {
        return next(error);
    }
};

const getProductPharmacy = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    //! [1] Extract Data
    let { barcode, name } = req.query;
    try {
        name = `^${!name ? '' : name}`;
        barcode = `^${!barcode ? '' : barcode}`;

        //! [2] Create filter
        const productFilter: any = {
            name: { $regex: new RegExp(name), $options: 'i' },
            barcode: { $regex: new RegExp(barcode), $options: 'i' },
        };

        //! [3] Get products
        let products = (
            await PharmacyProduct.find()
                .populate({
                    path: 'product',
                    match: productFilter,
                })
                .exec()
        ).filter((prod) => prod.product);

        //! [4] Add images to products
        let imagesURLs = (
            await pushMessageToQueue(
                GENERATE_URLS_QUEUE,
                products.map((product) => product.product.images)
            )
        ).responseURLs;

        let pharmacyDetails = await pushMessageToQueue(
            PHARMACY_DETAILS_QUEUE,
            products.map((product) => product.pharmacy)
        );

        //! [5] Return response
        return returnResponse(res, ResponseMsgAndCode.SUCCESS_FOUND_PRODUCTS, {
            products: products.map((product, idx) => ({
                ...product.toObject(),
                product: {
                    ...product.toObject().product,
                    images: mapProductImages(product.product.images, imagesURLs[idx]),
                    pharmacy: pharmacyDetails[idx],
                },
            })),
        });
    } catch (error) {
        return next(error);
    }
};

const getPharmacyProducts = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    //! [1] Extract Data
    const { pharmacyId } = req.params;
    let { page, itemsPerPage, barcode, name, type, categories } = req.query;

    try {
        name = `^${!name ? '' : name}`;
        barcode = `^${!barcode ? '' : barcode}`;
        type = `^${!type ? '' : type + '$'}`;

        //! [2] Create filter
        const productFilter: any = {
            name: { $regex: new RegExp(name), $options: 'i' },
            barcode: { $regex: new RegExp(barcode), $options: 'i' },
            type: { $regex: new RegExp(type), $options: 'i' },
        };

        //! [3] Add categories to filter - IF EXISTS
        if (!!categories) {
            productFilter.categories = {
                $all: (categories as string).split(',').map((cat) => cat.trim()),
            };
        }

        //! [4] Get products
        let limitValue =
            itemsPerPage?.length == 0 || isNaN(+itemsPerPage) || +itemsPerPage < 1 ? 20 : +itemsPerPage;
        let skipValue = page?.length == 0 || isNaN(+page) || +page < 1 ? 1 : +page;

        const nextProducts = (
            await PharmacyProduct.find({ pharmacy: new Types.ObjectId(pharmacyId) })
                .populate({
                    path: 'product',
                    match: productFilter,
                })
                .limit(limitValue)
                .skip(skipValue * limitValue)
                .exec()
        ).filter((prod) => prod.product);

        let products = (
            await PharmacyProduct.find({ pharmacy: new Types.ObjectId(pharmacyId) })
                .populate({
                    path: 'product',
                    match: productFilter,
                })
                .limit(limitValue)
                .skip((skipValue - 1) * limitValue)
                .exec()
        ).filter((prod) => prod.product);

        //! [5] Add images to products
        let productsImages = [];
        for (let pr of products) {
            productsImages.push(pr.product.images);
        }

        let imagesURLs = (await pushMessageToQueue(GENERATE_URLS_QUEUE, productsImages)).responseURLs;

        for (let pr of products) {
            pr.product.images = imagesURLs[products.indexOf(pr)];
        }

        //! [6] Return response
        return returnResponse(res, ResponseMsgAndCode.SUCCESS_FOUND_PRODUCTS, {
            products,
            hasNext: nextProducts.length > 0,
        });
    } catch (error) {
        return next(error);
    }
};

const getCategory = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    const categories = await Categories.find({}).exec();
    return returnResponse(res, ResponseMsgAndCode.SUCCESS_FOUND_CATEGORIES, {
        ...categories,
    });
};

const systemProductController = {
    getProducts,
    getPharmacyProducts,
    getProductPharmacy,
    getCategory,
};

export default systemProductController;
