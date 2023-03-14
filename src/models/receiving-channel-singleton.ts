import amqp from 'amqplib';

class ReceivingChannelSingleton {
    static instance = null;
    private _channel: amqp.Channel | null;

    static getInstance() {
        if (ReceivingChannelSingleton.instance === null) {
            ReceivingChannelSingleton.instance = new ReceivingChannelSingleton();
        }

        return ReceivingChannelSingleton.instance;
    }

    private constructor() {
        this._channel = null;
    }

    //getters
    get channel() {
        return this._channel;
    }

    //setters
    set channel(channel: amqp.Channel | null) {
        this._channel = channel;
    }
}

export default ReceivingChannelSingleton;
