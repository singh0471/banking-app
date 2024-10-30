const Logger = require("../utils/logger");

class BankAppError extends Error {
    constructor(httpStatusCode, detailedMessage, type, message) {
        super(detailedMessage);   
        this.httpStatusCode = httpStatusCode;
        this.type = type;       
        this.message = message;   
    }
}

module.exports = BankAppError;