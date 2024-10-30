const {HttpStatusCode} = require("axios");
const Logger = require("../../../utils/logger");
const {createUUID,validateUUID} = require("../../../utils/uuid");
const BankService = require("../service/bank");
const { setXTotalCountHeader } = require("../../../utils/response");
const NotFoundError = require("../../../errors/notFoundError");
const InvalidError = require("../../../errors/invalidError");


class BankController{
    constructor(){
        this.bankService = new BankService();
    }

    async createBank(req,res,next){
        try{
            Logger.info("create bank controller started");
            const { name, abbreviation } = req.body;
            
            if(!name || typeof name !== "string")
                throw new InvalidError("invalid bank name");
            if(!abbreviation || typeof abbreviation!=="string")
                throw new InvalidError("invalid abbreviation");

            const response = await this.bankService.createBank(createUUID(),name,abbreviation);
              Logger.info("create bank controller completed");
              res.status(HttpStatusCode.Created).json(response);
        }
        catch(error){
            next(error);
        }
    }

    async getAllBanks(req, res, next) {
        try {
          Logger.info("get all banks controller started");
          const { count, rows } = await this.bankService.getAllBanks(req.query);
          setXTotalCountHeader(res, count);
          Logger.info("get all banks controller completed");
          res.status(HttpStatusCode.Ok).json(rows);
        } catch (error) {
          next(error);
        }
      }

      async getBankByBankId(req, res, next) {
        try {
          Logger.info("get bank by id controller started");
          const { bankId } = req.params;
          if (!validateUUID(bankId)) {
            throw new Error("invalid bank id entered");
          }
    
          const response = await this.bankService.getBankByBankId(bankId, req.query);
          Logger.info("get bank by id controller completed");
          res.status(HttpStatusCode.Ok).json(response);
        } catch (error) {
          next(error);
        }
      }

      async updateBankByBankId(req, res, next) {
        try {
          Logger.info("update bank by id controller started");
          const { bankId } = req.params;
          const { parameter, value } = req.body;

          if (!validateUUID(bankId)) 
            throw new InvalidError("invalid bank id entered");
    
          if (!parameter || typeof parameter != "string")
            throw new InvalidError("invalid parameter");

          if(!value)
            throw new InvalidError("invalid value");
          
          
    
          const response = await this.bankService.updateBankByBankId(bankId,parameter,value);

          if (!response)
            throw new NotFoundError("could not update the bank.");
          res.status(HttpStatusCode.Ok).json({ message: `Bank with id ${bankId} has been updated successfully` });
        } catch (error) {
          next(error);
        }
      }

      async deleteBankByBankId(req, res, next) {
        try {
          Logger.info("delete bank by id controller started");
          const { bankId } = req.params;
          if (!validateUUID(bankId)) {
            throw new InvalidError("invalid bank id");
          }
          const response = await this.bankService.deleteBankByBankId(bankId);

          if (!response)
            throw new NotFoundError("could not delete bank");
    
          res.status(HttpStatusCode.Ok).json({message: `bank with id ${bankId} has been deleted successfully`});
          Logger.info("delete bank by id controller completed");
        } catch (error) {
          next(error);
        }
      }

      async viewLedger(req,res,next){
        try{
          
              Logger.info("view ledger controller started");
              const {bankId} = req.params;

              if(!bankId || !validateUUID(bankId))
                throw new InvalidError("invalid user id");
            
              const { count, rows } = await this.bankService.viewLedger(bankId,req.query);
              setXTotalCountHeader(res, count);
              res.status(HttpStatusCode.Ok).json(rows);
              Logger.info("view ledger controller completed");

            }
            
        catch(error){
          next(error);
        }
      }
}

const bankController = new BankController();
module.exports = bankController;