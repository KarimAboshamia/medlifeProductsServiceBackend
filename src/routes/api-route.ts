import { Router } from 'express';

import adminProductRouter from './admin-product-route';
import pharmacyProductRouter from './pharmacy-product-route';
import systemProductRouter from './system-product-route';

const apiRouter = Router();

apiRouter.use('/system', systemProductRouter);
apiRouter.use('/admin', adminProductRouter);
apiRouter.use('/pharmacist', pharmacyProductRouter);

export default apiRouter;
