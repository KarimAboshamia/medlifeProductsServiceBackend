import { Router } from 'express';

import adminProductController from '../controllers/admin-product-controller';
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
    adminProductController.postProduct
);

adminProductRouter.delete('/products/delete/:barcode', adminProductController.deleteProduct);

adminProductRouter.patch(
    '/products/update/:barcode',
    updatingProductValidator,
    validationResultChecker,
    adminProductController.updateProduct
);

adminProductRouter.patch(
    '/products/images/add',
    addingProductImagesValidator,
    validationResultChecker,
    adminProductController.addImages
);

adminProductRouter.delete(
    '/products/images/delete',
    deletingProductImageValidator,
    validationResultChecker,
    adminProductController.deleteImage
);

export default adminProductRouter;
