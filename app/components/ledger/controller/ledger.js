const {HttpStatusCode} = require("axios");
const Logger = require("../../../utils/logger");
const {createUUID,validateUUID} = require("../../../utils/uuid");
const LedgerService = require("../service/ledger");
const { setXTotalCountHeader } = require("../../../utils/response");
const NotFoundError = require("../../../errors/notFoundError");
const InvalidError = require("../../../errors/invalidError");

class LedgerController{
    constructor(){
        this.ledgerService = new LedgerService();
    }

    async viewLedger(req,res,next){
        try{
          
              Logger.info("view ledger controller started");
              const {bankId} = req.params;

              if(!bankId || !validateUUID(bankId))
                throw new InvalidError("invalid user id");
            
              const { count, rows } = await this.ledgerService.viewLedger(bankId,req.query);
              setXTotalCountHeader(res, count);
              res.status(HttpStatusCode.Ok).json(rows);
              Logger.info("view ledger controller completed");

            }
            
        catch(error){
          next(error);
        }
      }

      async viewLedgerByBankId(req,res,next){
        try{
          
              Logger.info("view ledger by bank id controller started");
              const {bankId,anotherBankId} = req.params;

              if(!bankId || !validateUUID(bankId))
                throw new InvalidError("invalid bank id");
              if(!bankId || !validateUUID(bankId))
                throw new InvalidError("invalid another bank id");
            
              const ledger = await this.ledgerService.viewLedgerByBankId(bankId,anotherBankId,req.query);
              res.status(HttpStatusCode.Ok).json(ledger);
              Logger.info("view ledger by bank id controller completed");

            }
            
        catch(error){
          next(error);
        }
      }
}

const ledgerController = new LedgerController();
module.exports = ledgerController;