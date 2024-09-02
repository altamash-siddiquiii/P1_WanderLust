// My Custom Express Error Class 

class MyExpressErr extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}

module.exports = MyExpressErr;