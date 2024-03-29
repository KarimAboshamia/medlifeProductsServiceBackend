import express, { Request as ExpRequest, Response as ExpResponse, NextFunction as ExpNextFun } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

// --------------------------------------------------------
import ResponseError from './models/response-error';
import apiRouter from './routes/api-route';

import { initSender } from './utilities/sending-message-broker-utility';
import { callReceiver } from './utilities/receiving-message-broker-utility';

// --------------------------------------------------------

const app = express();

initSender();
callReceiver();

//? parsing coming request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//? setting access-control-allow headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', String(process.env.ACCESS_CONTROL_ALLOW_ORIGIN));
    res.setHeader('Access-Control-Allow-Methods', String(process.env.ACCESS_CONTROL_ALLOW_METHODS));
    res.setHeader('Access-Control-Allow-Headers', String(process.env.ACCESS_CONTROL_ALLOW_HEADERS));

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

app.use('/product', apiRouter);

//^ not found route
app.use((req: ExpRequest, _res, _next: ExpNextFun) => {
    throw new ResponseError(`sorry, it seems that the URL '${req.url}' is not provided!`, 404);
});

//^ a global error middleware (a middleware that catches any error)
app.use((error: any, _req: ExpRequest, res: ExpResponse, _next: ExpNextFun) => {
    const message = error.message || 'an unknown error have been occurred!';
    const statusCode = error.statusCode || 500;
    const extraData = error.extraData;

    res.status(statusCode).json({
        message,
        extraData,
    });
});

//^ database connection
mongoose.set('strictQuery', true);

mongoose
    .connect(String(process.env.DB_URI), {
        user: process.env.DB_USERNAME,
        pass: process.env.DB_PASSWORD,
        autoIndex: Boolean(process.env.DB_AUTO_INDEX),
    })
    .then(() => {
        app.listen(process.env.PORT || 8084);
    })
    .catch(console.log);
