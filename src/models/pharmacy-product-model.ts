import { model, Schema } from 'mongoose';

import { IPharmacyProductSchema } from './schema-interfaces';

const pharmacyProductSchema = new Schema<IPharmacyProductSchema>(
    {
        product: {
            //Type IProductSchema
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Product',
        },
        pharmacy: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        offer: {
            type: String,
            default: '0%',
        },
    },
    { timestamps: true }
);

const PharmacyProduct = model('PharmacyProduct', pharmacyProductSchema);

export default PharmacyProduct;
