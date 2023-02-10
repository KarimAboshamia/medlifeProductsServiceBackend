import { Request as ExpRequest, Response as ExpResponse, NextFunction as ExpNextFunc } from 'express';
import { validationResult } from 'express-validator';

import ResponseError from '../models/response-error';

export const validationResultChecker = (req: ExpRequest, _res: ExpResponse, next: ExpNextFunc) => {
    const validation = validationResult(req);

    if (!validation.isEmpty()) {
        return next(new ResponseError(validation.array().at(0)?.msg, 422));
    }

    next();
};
