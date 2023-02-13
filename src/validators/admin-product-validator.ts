import { body } from 'express-validator';
import { EProductCategory, EProductType } from '../models/schema-interfaces';

import { getEnumValues } from '../utilities/enum-utility';

const productTypes = getEnumValues(EProductType);
const productCategories = getEnumValues(EProductCategory);

const nameValidator = body('name', 'product name is required!').exists({ checkFalsy: true });

const barcodeValidator = body('barcode', 'product barcode is required!').exists({ checkFalsy: true });

const typeValidator = body('type')
    .exists({ checkFalsy: true })
    .withMessage('product type is required!')
    .custom((input) => {
        if (productTypes.indexOf(input) === -1) {
            throw new Error(`${input} is an invalid product type!`);
        }

        return true;
    });

const arrayValidator = (field) =>
    body(field)
        .customSanitizer((input) => {
            if (Array.isArray(input)) {
                return input;
            }

            return input ? JSON.parse(input) : [];
        })
        .isArray()
        .withMessage(`product ${field} should be an array`)
        .if(body(field).isArray())
        .customSanitizer((array) => {
            return array.filter((item) => item);
        });

const categoriesValidator = arrayValidator('categories')
    .isLength({ min: 1 })
    .withMessage('product category should be at least one!')
    .custom((input) => {
        for (const cat of input) {
            if (productCategories.indexOf(cat) === -1) {
                throw new Error(`${cat} is an invalid product category!`);
            }

            if (input.indexOf(cat) !== input.lastIndexOf(cat)) {
                throw new Error('categories array should has no duplicates!');
            }
        }

        return true;
    });

const descriptionValidator = arrayValidator('description')
    .isLength({ min: 1 })
    .withMessage('product description should be at least one!');

export const creatingProductValidator = [
    nameValidator,
    barcodeValidator,
    typeValidator,
    categoriesValidator,
    descriptionValidator,
    arrayValidator('indication'),
    arrayValidator('sideEffects'),
    arrayValidator('dosage'),
    arrayValidator('overdoseEffects'),
    arrayValidator('precautions'),
    arrayValidator('interactions'),
    arrayValidator('storage'),
];

export const updatingProductValidator = [...creatingProductValidator];

export const addingProductImagesValidator = [barcodeValidator];

export const deletingProductImageValidator = [
    barcodeValidator,
    body('image', 'image is required!').exists({ checkFalsy: true }),
];
