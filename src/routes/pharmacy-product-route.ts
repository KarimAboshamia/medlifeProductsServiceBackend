import { Router } from 'express';

import pharmacyProductController from '../controllers/pharmacy-product-controller';
import { validationResultChecker } from '../middleware/validation-result-middleware';
import {
    productValidator,
    modifyProductValidator,
    deleteProductValidator,
} from '../validators/pharmacist-product-validator';

const pharmacistProductRouter = Router();

pharmacistProductRouter.post(
    '/products/create',
    productValidator,
    validationResultChecker,
    pharmacyProductController.postProduct
);

pharmacistProductRouter.put(
    '/products/modify',
    modifyProductValidator,
    validationResultChecker,
    pharmacyProductController.modifyProduct
);

pharmacistProductRouter.delete(
    '/products/delete',
    deleteProductValidator,
    validationResultChecker,
    pharmacyProductController.deleteProduct
);

export default pharmacistProductRouter;
