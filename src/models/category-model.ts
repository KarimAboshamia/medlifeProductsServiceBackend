import { model, Schema } from 'mongoose';

import { ICategorySchema } from './schema-interfaces';

const categoriesSchema = new Schema<ICategorySchema>(
    {
        name: {
            type: String,
        }
    },
    { timestamps: true }
);

const Categories = model('Categories', categoriesSchema);

export default Categories;
