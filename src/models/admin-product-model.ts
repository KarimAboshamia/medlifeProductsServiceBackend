import { model, Schema } from 'mongoose';

import { IProductSchema } from './schema-interfaces';

const productSchema = new Schema<IProductSchema>(
    {
        name: {
            type: String,
            required: true,
        },
        barcode: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        categories: {
            type: [String],
            required: true,
        },
        images: {
            type: [String],
            required: true,
        },
        description: {
            type: [String],
            required: true,
        },
        indication: {
            type: [String],
            required: false,
            default: [],
        },
        sideEffects: {
            type: [String],
            required: false,
            default: [],
        },
        dosage: {
            type: [String],
            required: false,
            default: [],
        },
        overdoseEffects: {
            type: [String],
            required: false,
            default: [],
        },
        precautions: {
            type: [String],
            required: false,
            default: [],
        },
        interactions: {
            type: [String],
            required: false,
            default: [],
        },
        storage: {
            type: [String],
            required: false,
            default: [],
        },
    },
    { timestamps: true }
);

const Product = model('Product', productSchema);

export default Product;
