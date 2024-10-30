const BankAppError = require("./bankAppError");
const { StatusCodes } = require("http-status-codes");

class InvalidError extends BankAppError {
    constructor(detailedMessage) {
        super(StatusCodes.BAD_REQUEST, detailedMessage, "Invalid Error", "Invalid Request");
    }
}

module.exports = InvalidError;