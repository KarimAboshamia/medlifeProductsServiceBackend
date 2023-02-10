import { Router } from 'express';
import productController from '../controllers/pharmacist-product-controller';
import { validationResultChecker } from '../middleware/validation-result-middleware';
import { productValidator, modifyProductValidator, deleteProductValidator } from '../validators/pharmacist-product-validator';

const pharmacistProductRouter = Router();

pharmacistProductRouter.post('/products/create', productValidator, validationResultChecker, productController.postProduct);
pharmacistProductRouter.put('/products/modify', modifyProductValidator, validationResultChecker, productController.modifyProduct);
pharmacistProductRouter.delete('/products/delete', deleteProductValidator, validationResultChecker, productController.deleteProduct);

export default pharmacistProductRouter;
