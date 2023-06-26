import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import adminProductController from '../../controllers/admin-product-controller';
import ExpTestUtil from '../utils/exp-test-util';
import { adminProduct1, adminProduct2 } from '../utils/shared-data';
import sendingMessageBrokerUtility from '../../utilities/sending-message-broker-utility';

describe('Admin Products', function () {
    const fakeImagesUrls = () => {
        const stub = sinon.stub(sendingMessageBrokerUtility, 'pushMessageToQueue');

        stub.callsFake((_qName, productsImages) => {
            return Promise.resolve({
                responseURLs: productsImages.map((images) => {
                    if (Array.isArray(images)) {
                        return images.map((img) => `https://fakeurl.com/${img}`);
                    }
                }),
            });
        });

        return stub;
    };

    for (const product of [adminProduct1, adminProduct2]) {
        it(`should create a product with barcode (${product.barcode}) successfully!`, function (done) {
            const { req, res, next } = ExpTestUtil.createControllerParams({
                req: { body: { ...product } },
            });

            const stub = fakeImagesUrls();

            adminProductController
                .postProduct(req, res, next)
                .then(() => {
                    expect(res.details).to.not.have.property('hasError', true);
                })
                .then(() => {
                    product['_id'] = res.details.data.product._id?.toString();
                    product['invalidId'] = product['_id'].split('').reverse().join('');
                    product['invalidBarcode'] = product['barcode'].split('').reverse().join('');
                })
                .then(done)
                .catch(done)
                .finally(() => stub.restore());
        });
    }

    it('should throw an error when creating a product with an exist barcode!', function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: { body: { ...adminProduct1 } },
        });

        adminProductController
            .postProduct(req, res, next)
            .then(() => {
                expect(res.details).to.have.property('hasError', true);
            })
            .then(done)
            .catch(done);
    });

    it("should throw an error when updating a product's barcode which already exists!", function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: { body: { barcode: adminProduct2.barcode }, params: { barcode: adminProduct1.barcode } },
        });

        adminProductController
            .updateProduct(req, res, next)
            .then(() => {
                expect(res.details).to.have.property('hasError', true);
            })
            .then(done)
            .catch(done);
    });

    it('should throw an error when updating a product which has invalid barcode (not exists)!', function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: { body: {}, params: { barcode: adminProduct1['invalidBarcode'] } },
        });

        adminProductController
            .updateProduct(req, res, next)
            .then(() => {
                expect(res.details).to.have.property('hasError', true);
            })
            .then(done)
            .catch(done);
    });

    it("should update product's name successfully!", function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: { body: { name: adminProduct1.name + '_1' }, params: { barcode: adminProduct1.barcode } },
        });

        const stub = fakeImagesUrls();

        adminProductController
            .updateProduct(req, res, next)
            .then(() => {
                expect(res.details).to.not.have.property('hasError', true);
            })
            .then(() => {
                adminProduct1['name'] = res.details.data.product.name;
            })
            .then(done)
            .catch(done)
            .finally(() => stub.restore());
    });

    it('should throw an error when deleting a product which has invalid barcode (not exists)!', function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: { params: { barcode: adminProduct2['invalidBarcode'] } },
        });

        adminProductController
            .deleteProduct(req, res, next)
            .then(() => {
                expect(res.details).to.have.property('hasError', true);
            })
            .then(done)
            .catch(done);
    });

    it('should delete a product successfully!', function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: { params: { barcode: adminProduct2.barcode } },
        });

        const stub = sinon.stub(sendingMessageBrokerUtility, 'pushMessageToQueue');
        stub.returns(Promise.resolve({}));

        adminProductController
            .deleteProduct(req, res, next)
            .then(() => {
                expect(res.details).to.not.have.property('hasError', true);
            })
            .then(done)
            .catch(done)
            .finally(() => stub.restore());
    });

    it('should throw an error when adding images to a product which has invalid barcode (not exists)!', function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: { body: { barcode: adminProduct1['invalidBarcode'] } },
        });

        adminProductController
            .addImages(req, res, next)
            .then(() => {
                expect(res.details).to.have.property('hasError', true);
            })
            .then(done)
            .catch(done);
    });

    it('should add images to a product successfully!', function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: { body: { barcode: adminProduct1.barcode, images: ['p1_2.png'] } },
        });

        const stub = fakeImagesUrls();

        adminProductController
            .addImages(req, res, next)
            .then(() => {
                expect(res.details).to.not.have.property('hasError', true);
            })
            .then(() => {
                adminProduct1['images'] = res.details.data.product.images;
            })
            .then(done)
            .catch(done)
            .finally(() => stub.restore());
    });

    it('should throw an error when deleting an image of a product which has invalid barcode (not exists)!', function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: { body: { barcode: adminProduct1['invalidBarcode'] } },
        });

        adminProductController
            .deleteImage(req, res, next)
            .then(() => {
                expect(res.details).to.have.property('hasError', true);
            })
            .then(done)
            .catch(done);
    });

    it(`should delete an image of a product successfully!`, function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: { body: { barcode: adminProduct1.barcode, image: (adminProduct1.images[0] as any).id } },
        });

        const stub = fakeImagesUrls();

        adminProductController
            .deleteImage(req, res, next)
            .then(() => {
                expect(res.details).to.not.have.property('hasError', true);
            })
            .then(() => {
                adminProduct1['images'] = res.details.data.product.images;
            })
            .then(done)
            .catch(done)
            .finally(() => stub.restore());
    });

    it(`should throw an error when deleting an image of a product and the product has only that image!`, function (done) {
        const { req, res, next } = ExpTestUtil.createControllerParams({
            req: { body: { barcode: adminProduct1.barcode } },
        });

        adminProductController
            .deleteImage(req, res, next)
            .then(() => {
                expect(res.details).to.have.property('hasError', true);
            })
            .then(done)
            .catch(done);
    });
});
