import PharmacyProduct from '../models/pharmacy-product-model';
import { ResponseMsgAndCode } from '../models/response-msg-code';
import { returnBrokerResponse } from '../utilities/response-utility';

const deletePharmacyProducts = async (pharmacyId: string) => {
    try {
        await PharmacyProduct.deleteMany({ pharmacy: pharmacyId }).exec();

        return returnBrokerResponse(ResponseMsgAndCode.SUCCESS_PHARMACY_PRODUCTS_DELETION);
    } catch (error) {
        throw error;
    }
};

const pharmacyProductBroker = {
    deletePharmacyProducts,
};

export default pharmacyProductBroker;
