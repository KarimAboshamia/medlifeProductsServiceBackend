import { body, oneOf } from 'express-validator';

const pageValidator = body('page')
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer');

const itemsPerPageValidator = body('itemsPerPage')
    .if(body('page').exists())
    .not()
    .isEmpty()
    .withMessage('Items per page is required')
    .isInt({ min: 1 })
    .withMessage('Items per page must be a positive integer');

const nameValidator = body('name')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Name must be a string');

const barcodeValidator = body('barcode')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Barcode must be a string');

const typeValidator = body('type')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Type must be a string');

const categoriesValidator = body('categories')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Categories must be a string');

const pharmacyIdValidator = body('pharmacyId')
    .exists({ checkFalsy: true })
    .withMessage('Pharmacy ID is required')
    .isMongoId()
    .withMessage('Pharmacy ID is not valid');

export const getProductPharmacyValidator = oneOf([nameValidator, barcodeValidator]);

export const getProductValidator = [
    oneOf([nameValidator, barcodeValidator, typeValidator, categoriesValidator]),
    pageValidator,
    itemsPerPageValidator,
];

export const getPharmacyProductsValidator = [
    pharmacyIdValidator,
    pageValidator,
    itemsPerPageValidator,
    oneOf([nameValidator, barcodeValidator, typeValidator, categoriesValidator]),
];
