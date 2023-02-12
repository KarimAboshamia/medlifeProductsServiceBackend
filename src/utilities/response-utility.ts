import { AxiosResponse } from 'axios';
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

export const getAxiosResponse = (
    expResponse: Response,
    axiosResponse: AxiosResponse,
    extraData = {},
    ignoreResponseData = false
) => {
    return expResponse.status(axiosResponse.status).json({
        ...(!ignoreResponseData && axiosResponse.data),
        ...extraData,
    });
};

export const getAxiosError = (error) => {
    const msg =
        error?.response?.data?.message || (typeof error?.response?.data === 'string' && error.response.data);

    const err = !!msg
        ? new ResponseError(msg, error.response.status, error?.response?.data?.extraData)
        : error;

    return err;
};
