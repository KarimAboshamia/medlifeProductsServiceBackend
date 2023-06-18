import NotifyWhenAvailableRequest from '../models/notify-when-available-request-model';
import notificationUtil from './notification-utility';

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
            try {
                notificationUtil.sendNotification({
                    userId: req.patientId,
                    notificationTitle: ' A Product is Available',
                    notificationBody: 'A product you had searched is available now, hurry up to get it!',
                    notificationType: 'NOTIFY_WHEN_AVAL',
                    extraData: req.toObject(),
                });
            } catch (error) {}

            await req.delete();
        }
    } catch (error) {
        throw error;
    }
};
