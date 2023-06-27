import { describe, before } from 'mocha';

import '../app';
import Product from '../models/admin-product-model';
import PharmacyProduct from '../models/pharmacy-product-model';

describe('Mobile Service', function () {
    const NODE_ENV = String(process.env.NODE_ENV)?.trim();

    if (NODE_ENV !== 'test') {
        throw Error(
            'dangerous the current node environment mode is not test. to enter test mode run "npm run start:test"!'
        );
    }

    before(async function () {
        await Product.deleteMany();
        await PharmacyProduct.deleteMany();
    });

    require('./admin-products/admin-products.spec');
    require('./pharmacy-products/pharmacy-products.spec');
    require('./system-products/system-products.spec');
});
