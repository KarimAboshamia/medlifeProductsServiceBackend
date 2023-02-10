class ResponseError extends Error {
    constructor(private msg: string, private status: number, private extra: any = undefined) {
        super(msg);
    }

    get message() {
        return this.msg;
    }

    get statusCode() {
        return this.status;
    }

    get extraData() {
        return this.extra;
    }
}

export default ResponseError;
