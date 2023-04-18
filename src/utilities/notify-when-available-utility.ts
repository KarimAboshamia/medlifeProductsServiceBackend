import NotifyWhenAvailableRequest from '../models/notify-when-available-request-model';

export const notifyWithProductNewAddedAmount = async (
    productId: string,
    pharmacyId: string
): Promise<void> => {
    try {
        const requests = await NotifyWhenAvailableRequest.find({
            $or: [
                {
                    productId,
                    pharmacyId,
                },
                {
                    productId,
                    pharmacyId: undefined,
                },
            ],
        });

        // for each request, send notification to the request patient and delete
        for (const req of requests) {
            // send notification
            console.log(req.toObject());

            await req.delete();
        }
    } catch (error) {
        throw error;
    }
};
