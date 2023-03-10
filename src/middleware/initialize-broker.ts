import { createChannelAndQueue } from "../utilities/message-broker-utility";
import MySingleton from "../utilities/singleton-comm-utility";

export const initSender = async () => {
    try {
        const mySingletonInstance = MySingleton.getInstance();
        await createChannelAndQueue();
    } catch (e) {
        throw e;
    }
};
