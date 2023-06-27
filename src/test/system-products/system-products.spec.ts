import { describe, it } from 'mocha';
import { expect } from 'chai';

import { fakeImagesUrls, pharmacyProduct1, pharmacyProduct2, pharmacyProduct3 } from '../utils/shared-data';
import systemProductController from '../../controllers/system-product-controller';
import ExpTestUtil from '../utils/exp-test-util';

describe('System Products', function () {
    it(`should get admin products successfully!`, function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: { query: {} },
        });

        const stub = fakeImagesUrls();

        systemProductController
            .getProducts(req, res, next)
            .then(() => {
                expect(res.details).to.not.have.property('hasError', true);
            })
            .then(done)
            .catch(done)
            .finally(() => stub.restore());
    });

    it(`should get pharmacies products successfully!`, function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: { query: {} },
        });

        const stub = fakeImagesUrls();

        systemProductController
            .getProductPharmacy(req, res, next)
            .then(() => {
                expect(res.details).to.not.have.property('hasError', true);
            })
            .then(done)
            .catch(done)
            .finally(() => stub.restore());
    });

    it(`should get products of a pharmacy successfully!`, function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: { query: {}, params: { pharmacyId: pharmacyProduct1.pharmacyId } },
        });

        const stub = fakeImagesUrls();

        systemProductController
            .getPharmacyProducts(req, res, next)
            .then(() => {
                expect(res.details).to.not.have.property('hasError', true);
            })
            .then(done)
            .catch(done)
            .finally(() => stub.restore());
    });
});
