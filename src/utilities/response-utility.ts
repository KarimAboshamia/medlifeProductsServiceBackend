import { Response } from 'express';

import ResponseError from '../models/response-error';
import { ResponseMsgAndCode } from '../models/response-msg-code';

export const getError = (errMsgAndCode: ResponseMsgAndCode, extraData: any = undefined) => {
    const [msg, code] = errMsgAndCode.split('##').map((part) => part.trim());

    return new ResponseError(msg, +code, extraData);
};

export const returnResponse = (expResponse: Response, responseMsg: ResponseMsgAndCode, responseBody: any) => {
    const [msg, code] = responseMsg.split('##').map((part) => part.trim());

    return expResponse.status(+code).json({
        ...responseBody,
        message: msg,
    });
};

export const returnBrokerResponse = (responseMsg: ResponseMsgAndCode, responseBody: any = {}) => {
    const [msg, code] = responseMsg.split('##').map((part) => part.trim());
    
    return {
        ...responseBody,
        message: msg,
        statusCode: code,
    };
};