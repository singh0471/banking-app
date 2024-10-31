const PassbookService = require("../service/passbook");
const { createUUID, validateUUID } = require("../../../utils/uuid");
const Logger = require("../../../utils/logger");
const { HttpStatusCode } = require("axios");
const { setXTotalCountHeader } = require("../../../utils/response");
const accountConfig = require("../../../model-config/account-config");
const NotFoundError = require("../../../errors/notFoundError");
const InvalidError = require("../../../errors/invalidError");
const { isPositiveInteger, getUniqueNumber } = require("../../../utils/number");


class PassbookController{
    constructor(){
        this.passbookService = new PassbookService();
    }

    async viewPassbook(req,res,next){
        try{
          
              Logger.info("view passbook controller started");
              const {userId,accountNumber} = req.params;
              
              if(!userId || !validateUUID(userId))
                throw new InvalidError("invalid user id");
              
              if(!accountNumber || !validateUUID(accountNumber))
                throw new InvalidError("invalid account number");
              const { count, rows } = await this.passbookService.viewPassbook(userId,accountNumber,req.query);
              setXTotalCountHeader(res, count);
              res.status(HttpStatusCode.Ok).json(rows);
              Logger.info("view passbook controller completed");

            }
            
        catch(error){
          next(error);
        }
      }

      async getTransactionDetailByTransactionId(req,res,next){
        try{
          
              Logger.info("get transaction details by transaction id controller started");
              const {userId,accountNumber,transactionId} = req.params;
              
              if(!userId || !validateUUID(userId))
                throw new InvalidError("invalid user id"); 
              if(!accountNumber || !validateUUID(accountNumber))
                throw new InvalidError("invalid account number");
              if(!transactionId || !validateUUID(transactionId))
                throw new InvalidError("invalid transaction id");
              const transaction = await this.passbookService.getTransactionDetailByTransactionId(userId,accountNumber,transactionId,req.query);
              res.status(HttpStatusCode.Ok).json(transaction);
              Logger.info("get transaction details by transaction id controller completed");
            }
            
        catch(error){
          next(error);
        }
      }
}

const passbookController = new PassbookController();
module.exports = passbookController;