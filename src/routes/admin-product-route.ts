import { Router } from 'express';

import productController from '../controllers/admin-product-controller';
import { imageUploader } from '../middleware/image-uploader-middleware';
import { validationResultChecker } from '../middleware/validation-result-middleware';
import {
    addingProductImagesValidator,
    creatingProductValidator,
    deletingProductImageValidator,
    updatingProductValidator,
} from '../validators/admin-product-validator';

const adminProductRouter = Router();

adminProductRouter.post(
    '/products/create',
    imageUploader.any(),
    creatingProductValidator,
    validationResultChecker,
    productController.postProduct
);

adminProductRouter.delete('/products/delete/:barcode', productController.deleteProduct);

adminProductRouter.patch(
    '/products/update/:barcode',
    updatingProductValidator,
    validationResultChecker,
    productController.updateProduct
);

adminProductRouter.patch(
    '/products/images/add',
    imageUploader.any(),
    addingProductImagesValidator,
    validationResultChecker,
    productController.addImages
);

adminProductRouter.delete(
    '/products/images/delete',
    deletingProductImageValidator,
    validationResultChecker,
    productController.deleteImage
);

export default adminProductRouter;
