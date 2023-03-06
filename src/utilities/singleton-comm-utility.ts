import amqp from 'amqplib';

interface Queue {
    queue: string;
}
class MySingleton {
    static instance = null;
    private _channel: amqp.Channel | null;
    private _queue: Queue | null;

    static getInstance() {
        if (MySingleton.instance === null) {
            MySingleton.instance = new MySingleton();
        }
        return MySingleton.instance;
    }

    private constructor() {
        this._channel = null;
        this._queue = null;
    }

    //getters
    get channel() {
        return this._channel;
    }

    get queue() {
        return this._queue;
    }

    //setters
    set channel(channel: amqp.Channel | null) {
        this._channel = channel;
    }

    set queue(queue: Queue | null) {
        this._queue = queue;
    }
}

export default MySingleton;