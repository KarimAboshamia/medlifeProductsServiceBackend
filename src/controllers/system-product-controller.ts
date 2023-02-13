import { Request as ExpRequest, Response as ExpResponse, NextFunction as ExpNextFunc } from 'express';
import FormData from 'form-data';
import axios from 'axios';

import Product from '../models/admin-product-model';
import PharmacyProduct from '../models/pharmacy-product-model';
import { returnResponse, getAxiosError } from '../utilities/response-utility';
import { ResponseMsgAndCode } from '../models/response-msg-code';
import { Types } from 'mongoose';
import { generateProductImagesURL, mapProductImages } from '../utilities/product-images-utility';

const imageServiceURL = process.env.IMAGE_SERVICE_URL;

const getProducts = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    //! [1] Extract query params
    let { page, itemsPerPage, barcode, name, type, categories } = req.query;

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

    let imagesURLs = [];

    try {
        imagesURLs = await generateProductImagesURL(products.map((product) => product.images));
    } catch (error) {
        return next(getAxiosError(error));
    }

    //! [6] Return response
    return returnResponse(res, ResponseMsgAndCode.SUCCESS_FOUND_PRODUCTS, {
        products: products.map((product, idx) => ({
            ...product.toObject(),
            images: mapProductImages(product.images, imagesURLs[idx]),
        })),
        hasNext: nextProducts.length > 0,
    });
};

const getProductPharmacy = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    //! [1] Extract Data

    let { barcode, name } = req.query;

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
    let productsImages = [];
    for (let pr of products) {
        productsImages.push(pr.product[0].image);
    }

    try {
        const responseURLs = await axios.post(`${imageServiceURL}/images/generate`, {
            images: productsImages,
        });

        for (let pr of products) {
            pr.product[0].images = responseURLs.data.responseURLs[products.indexOf(pr)];
        }
    } catch (err) {
        return next(getAxiosError(err));
    }

    //! [5] Return response
    return returnResponse(res, ResponseMsgAndCode.SUCCESS_FOUND_PRODUCTS, {
        products,
    });
};

const getPharmacyProducts = async (req: ExpRequest, res: ExpResponse, next: ExpNextFunc) => {
    //! [1] Extract Data
    const { pharmacyId } = req.params;
    let { page, itemsPerPage, barcode, name, type, categories } = req.query;

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
    let counter = 0;
    for (let pr of products) {
        let imagesUrls = await generateProductImagesURL(pr.product[0].images);
        productsImages.push(imagesUrls);
        pr.product[0].images = mapProductImages(pr.product[0].images, productsImages[counter]);
        counter++;
    }

    //! [6] Return response
    return returnResponse(res, ResponseMsgAndCode.SUCCESS_FOUND_PRODUCTS, {
        products,
        hasNext: nextProducts.length > 0,
    });
};

const productController = {
    getProducts,
    getPharmacyProducts,
    getProductPharmacy,
};

export default productController;
