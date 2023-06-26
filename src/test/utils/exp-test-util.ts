import { Request, NextFunction } from 'express';

class ExpResponse {
    details = {};

    status(code) {
        this.details['status'] = code;
        return this;
    }

    json(data) {
        this.details['data'] = data;
        return this;
    }

    set(key, val) {
        this.details[key] = val;
        return this;
    }
}

class ExpTestUtil {
    expResponse = new ExpResponse() as any;

    createExpRequest(params: object) {
        return {
            ...params,
        } as Request;
    }

    createExpNextFunc() {
        return ((error) => {
            this.expResponse.set('hasError', !!error);
            this.expResponse.set('error', error);
        }) as NextFunction;
    }

    static createControllerParams(params) {
        const expTestUtil = new ExpTestUtil();

        const req = expTestUtil.createExpRequest({
            ...(params.req || {}),
        });

        const res = expTestUtil.expResponse;

        const next = expTestUtil.createExpNextFunc();

        return { req, res, next };
    }
}

export default ExpTestUtil;
