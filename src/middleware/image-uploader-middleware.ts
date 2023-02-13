import multer from 'multer';

import ResponseError from '../models/response-error';

export const imageUploader = multer({
    storage: multer.memoryStorage(),
    fileFilter(_req, file, callback) {
        const fileType = file.mimetype;

        if (fileType.match(/png|jpg|jpeg/i)) {
            return callback(null, true);
        }

        callback(new ResponseError('invalid image, only png, jpg, and jpeg images are accepted!', 422));
    },
});
