import { describe, it } from 'mocha';
import { expect } from 'chai';

import { fakeImagesUrls, pharmacyProduct1, pharmacyProduct2, pharmacyProduct3, pharmacyProduct4 } from '../utils/shared-data';
import pharmacyProductController from '../../controllers/pharmacy-product-controller';
import ExpTestUtil from '../utils/exp-test-util';

describe('Pharmacy Products', function () {
    for (const product of [pharmacyProduct1, pharmacyProduct3, pharmacyProduct4]) {
        it(`should create a pharmacy product with admin product barcode (${product.product.barcode}) and pharmacy id (${product.pharmacyId}) successfully!`, function (done) {
            const { req, res, next } = ExpTestUtil.createControllerParams({
                req: { body: { ...product, productId: product.product['_id'], product: undefined } },
            });

            const stub = fakeImagesUrls();

            pharmacyProductController
                .postProduct(req, res, next)
                .then(() => {
                    expect(res.details).to.not.have.property('hasError', true);
                })
                .then(() => {
                    product['_id'] = res.details.data.product._id?.toString();
                    product['invalidId'] = product['_id'].split('').reverse().join('');
                })
                .then(done)
                .catch(done)
                .finally(() => stub.restore());
        });
    }

    it('should throw an error when creating a pharmacy product with non-exist admin product!', function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: { body: { productId: pharmacyProduct2.product['invalidId'] } },
        });

        pharmacyProductController
            .postProduct(req, res, next)
            .then(() => {
                expect(res.details).to.have.property('hasError', true);
            })
            .then(done)
            .catch(done);
    });

    it('should throw an error when creating a pharmacy product which already exists!', function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: {
                body: { ...pharmacyProduct1, productId: pharmacyProduct1.product['_id'], product: undefined },
            },
        });

        pharmacyProductController
            .postProduct(req, res, next)
            .then(() => {
                expect(res.details).to.have.property('hasError', true);
            })
            .then(done)
            .catch(done);
    });

    it('should throw an error when updating a pharmacy product which not exists', function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: {
                body: { productId: pharmacyProduct1['invalidId'], pharmacyId: pharmacyProduct1.pharmacyId },
            },
        });

        pharmacyProductController
            .modifyProduct(req, res, next)
            .then(() => {
                expect(res.details).to.have.property('hasError', true);
            })
            .then(done)
            .catch(done);
    });

    it('should update pharmacy product price successfully!', function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: {
                body: {
                    ...pharmacyProduct1,
                    productId: pharmacyProduct1['_id'],
                    price: 80,
                    product: undefined,
                },
            },
        });

        const stub = fakeImagesUrls();

        pharmacyProductController
            .modifyProduct(req, res, next)
            .then(() => {
                expect(res.details).to.not.have.property('hasError', true);
            })
            .then(done)
            .catch(done)
            .finally(() => stub.restore());
    });

    it('should throw an error when deleting a pharmacy product which not exists', function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: {
                body: { productId: pharmacyProduct4['invalidId'], pharmacyId: pharmacyProduct4.pharmacyId },
            },
        });

        pharmacyProductController
            .deleteProduct(req, res, next)
            .then(() => {
                expect(res.details).to.have.property('hasError', true);
            })
            .then(done)
            .catch(done);
    });

    it('should delete pharmacy product price successfully!', function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: {
                body: {
                    pharmacyId: pharmacyProduct4.pharmacyId,
                    productId: pharmacyProduct4['_id'],
                },
            },
        });

        pharmacyProductController
            .deleteProduct(req, res, next)
            .then(() => {
                expect(res.details).to.not.have.property('hasError', true);
            })
            .then(done)
            .catch(done);
    });
});
