import { Schema, model } from 'mongoose';

import { INotifyWhenAvailableRequestSchema } from './schema-interfaces';

const notifyWhenAvailableRequestSchema = new Schema<INotifyWhenAvailableRequestSchema>(
    {
        productId: {
            required: true,
            type: Schema.Types.ObjectId,
            ref: 'Product',
        },
        pharmacyId: {
            required: false,
            type: String,
        },
        patientId: {
            required: true,
            type: String,
        },
    },
    { timestamps: true }
);

const NotifyWhenAvailableRequest = model('NotifyWhenAvailableRequest', notifyWhenAvailableRequestSchema);

export default NotifyWhenAvailableRequest;
