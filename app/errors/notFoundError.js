const BankAppError = require("./bankAppError");
const { StatusCodes } = require("http-status-codes");

class NotFoundError extends BankAppError {
    constructor(detailedMessage) {
        super(StatusCodes.NOT_FOUND, detailedMessage, "Not Found Error", "Not Found Request");
    }
}

module.exports = NotFoundError;