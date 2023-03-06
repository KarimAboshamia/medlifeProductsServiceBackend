import { createChannelAndQueue } from "../utilities/message-broker-utility";
import MySingleton from "../utilities/singleton-comm-utility";

export const initSender = async () => {
    try {
        const mySingletonInstance = MySingleton.getInstance();
        const { channel, queue } = await createChannelAndQueue();

        mySingletonInstance.channel = channel;
        mySingletonInstance.queue = queue;
    } catch (e) {
        console.log(e);
    }
};
