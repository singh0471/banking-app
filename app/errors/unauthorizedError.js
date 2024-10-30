const BankAppError = require("./bankAppError");
const { StatusCodes } = require("http-status-codes");

class UnauthorizedError extends BankAppError {
    constructor(detailedMessage) {
        super(StatusCodes.UNAUTHORIZED, detailedMessage, "Unauthorized Error", "Unauthorized Request");
    }
}

module.exports = UnauthorizedError;