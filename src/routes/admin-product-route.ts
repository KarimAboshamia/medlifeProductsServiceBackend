import { Router } from 'express';
import productController from '../controllers/admin-product-controller';
import { validationResultChecker } from '../middleware/validation-result-middleware';
import multer from 'multer';

const storage = multer.memoryStorage();
const uploadImages = multer({
    storage: storage,
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error('Please upload an image'));
        }
        cb(undefined, true);
    },
});

const adminProductRouter = Router();

adminProductRouter.post('/products/create', uploadImages.array('images'), productController.postProduct);

adminProductRouter.delete('/products/delete', validationResultChecker, productController.deleteProduct);

adminProductRouter.patch('/products/update', validationResultChecker, productController.updateProduct);

adminProductRouter.patch('/products/images/add', uploadImages.array('images'), productController.addImages);

adminProductRouter.delete('/products/images/delete', productController.deleteImage);

export default adminProductRouter;
