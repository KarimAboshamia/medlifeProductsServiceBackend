import Product from '../models/admin-product-model';
import NotifyWhenAvailableRequest from '../models/notify-when-available-request-model';
import PharmacyProduct from '../models/pharmacy-product-model';
import { ResponseMsgAndCode } from '../models/response-msg-code';
import { getError, returnBrokerResponse } from '../utilities/response-utility';

const createNotifyWhenAvailableRequest = async (data: {
    productId: string;
    pharmacyId: string;
    patientId: string;
}) => {
    try {
        //^ find an admin product with the entered "data.productId" and throw an error if not exists
        let isValidAdminProduct = !!(await Product.findById(data.productId).exec());

        if (!isValidAdminProduct) {
            throw getError(ResponseMsgAndCode.ERROR_NO_PRODUCT_WITH_ID);
        }

        //^ find a pharmacy product with "data.pharmacyId" that already has enough amount, if exists throw an error
        const isThereEnoughAmountAlready = !!(await PharmacyProduct.findOne({
            product: data.productId,
            pharmacy: {
                $regex: new RegExp(data.pharmacyId || '^'),
            },
            amount: {
                $gt: 0,
            },
        }).lean());

        if (isThereEnoughAmountAlready) {
            throw getError(
                data.pharmacyId
                    ? ResponseMsgAndCode.ERROR_PHARMACY_HAS_ENOUGH_PRODUCT_AMOUNT_ALREADY
                    : ResponseMsgAndCode.ERROR_PHARMACIES_HAVE_ENOUGH_PRODUCT_AMOUNT_ALREADY
            );
        }

        //^ find a "NotifyWhenAvailableRequest" with the entered productId and patientId
        let request = await NotifyWhenAvailableRequest.findOne({
            productId: data.productId,
            patientId: data.patientId,
        });

        //^ create a new request if not exists
        if (!request) {
            request = new NotifyWhenAvailableRequest({
                productId: data.productId,
                patientId: data.patientId,
            });
        }

        request.pharmacyId = data.pharmacyId;

        await request.save();

        //^ send a response back
        return returnBrokerResponse(ResponseMsgAndCode.SUCCESS_NOTIFY_WHEN_AVAILABLE_CREATION, {});
    } catch (error) {
        throw error;
    }
};

const productBroker = {
    createNotifyWhenAvailableRequest,
};

export default productBroker;
