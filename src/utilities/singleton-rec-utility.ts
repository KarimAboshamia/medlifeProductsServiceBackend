import amqp from 'amqplib';

class ChannelMySingleton {
    static instance = null;
    private _channel: amqp.Channel | null;

    static getInstance() {
        if (ChannelMySingleton.instance === null) {
            ChannelMySingleton.instance = new ChannelMySingleton();
        }
        return ChannelMySingleton.instance;
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

export default ChannelMySingleton;
