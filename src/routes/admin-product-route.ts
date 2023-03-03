import { Router } from 'express';

import productController from '../controllers/admin-product-controller';
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
