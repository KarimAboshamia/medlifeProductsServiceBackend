import { body, oneOf } from 'express-validator';

const pharmacyIdValidator = body('pharmacyId')
    .exists({ checkFalsy: true })
    .withMessage('Pharmacy ID is required')
    .isMongoId()
    .withMessage('Pharmacy ID is not valid');

const productIdValidator = body('productId')
    .exists({ checkFalsy: true })
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Product ID is not valid');

const amountValidator = body('amount')
    .exists({ checkFalsy: true })
    .withMessage('Amount is required')
    .isInt({ min: 1 })
    .withMessage('Amount must be a positive integer');

const priceValidator = body('price')
    .exists({ checkFalsy: true })
    .withMessage('Price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive float');

const offerValidator = body('offer')
    .optional()
    .isFloat({ min: 0.01, max: 1 })
    .withMessage('Offer must be a positive float between 0.01 and 1');

//make two optional fields, only one of them required
const nameValidator = body('name').optional({ checkFalsy: true }).isString().withMessage('Name must be a string');

const barcodeValidator = body('barcode').optional({ checkFalsy: true }).isString().withMessage('Barcode must be a string');

export const productValidator = [
    pharmacyIdValidator,
    productIdValidator,
    amountValidator,
    priceValidator,
    offerValidator,
];

export const modifyProductValidator = [productIdValidator, amountValidator, priceValidator, offerValidator];

export const deleteProductValidator = [productIdValidator];
