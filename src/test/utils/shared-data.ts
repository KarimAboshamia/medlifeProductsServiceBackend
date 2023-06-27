import sinon from 'sinon';
import sendingMessageBrokerUtility from '../../utilities/sending-message-broker-utility';

export const adminProduct1 = {
    barcode: '123',
    name: 'product1',
    type: 'TABLET',
    description: ['a product'],
    images: ['p1.png'],
    categories: ['DRUG'],
};

export const adminProduct2 = {
    barcode: '456',
    name: 'product2',
    type: 'TABLET',
    description: ['a product'],
    images: ['p2.png'],
    categories: ['DRUG'],
};

export const adminProduct3 = {
    barcode: '789',
    name: 'product3',
    type: 'TABLET',
    description: ['a product'],
    images: ['p2.png'],
    categories: ['DRUG'],
};

export const pharmacyProduct1 = {
    pharmacyId: '64998acbb79c63e4da93a38e',
    product: adminProduct1,
    amount: 10,
    price: 20,
};

export const pharmacyProduct2 = {
    pharmacyId: '64998acbb79c63e4da93a38e',
    product: adminProduct2,
    amount: 30,
    price: 5,
};

export const pharmacyProduct3 = {
    pharmacyId: '63e4da93a38e64998acbb79c',
    product: adminProduct3,
    amount: 5,
    price: 100,
};

export const pharmacyProduct4 = {
    pharmacyId: '63e4da93a38e64998acbb79c',
    product: adminProduct1,
    amount: 50,
    price: 2,
};

export const fakeImagesUrls = () => {
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
