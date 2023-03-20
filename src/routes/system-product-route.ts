import { Router } from 'express';
import productController from '../controllers/system-product-controller';
import { validationResultChecker } from '../middleware/validation-result-middleware';
import { getProductValidator, getPharmacyProductsValidator, getProductPharmacyValidator } from '../validators/system-product-validator';

const systemProductRouter = Router();

systemProductRouter.get(
    '/products',
    // getProductValidator,
    // validationResultChecker,
    productController.getProducts
);

// Get All products in a specific pharmacy
systemProductRouter.get(
    '/products/pharmacy/:pharmacyId',
    productController.getPharmacyProducts
);

// Get All pharmacies that have a specific product 
systemProductRouter.get(
    '/products/product',
    // getProductPharmacyValidator,
    // validationResultChecker,
    productController.getProductPharmacy
);

systemProductRouter.get(
    '/categories',
    productController.getCategory,
);

export default systemProductRouter;
