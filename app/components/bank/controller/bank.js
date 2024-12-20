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

    // async createBank(req,res,next){
    //     try{
    //         Logger.info("create bank controller started");
    //         const { name, abbreviation } = req.body;
            
    //         if(!name || typeof name !== "string")
    //             throw new InvalidError("invalid bank name");
    //         if(!abbreviation || typeof abbreviation!=="string")
    //             throw new InvalidError("invalid abbreviation");

    //         const response = await this.bankService.createBank(createUUID(),name,abbreviation);
    //           Logger.info("create bank controller completed");
              
    //           res.status(HttpStatusCode.Created).json(response);
    //     }
    //     catch(error){
    //         next(error);
    //     }
    // }

    async createBank(req, res, next) {
      try {
          Logger.info("create bank controller started");
          const { name, abbreviation } = req.body;
  
          if (!name || typeof name !== "string") {
              throw new InvalidError("Invalid bank name");
          }
          if (!abbreviation || typeof abbreviation !== "string") {
              throw new InvalidError("Invalid abbreviation");
          }
  
          const response = await this.bankService.createBank(createUUID(), name, abbreviation);
          Logger.info("create bank controller completed");
  
          res.status(HttpStatusCode.Created).json(response);
      } catch (error) {
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

      async getAllBanksForUsers(req, res, next) {
        try {
          Logger.info("get all banks controller started");
          const { count, rows } = await this.bankService.getAllBanksForUsers(req.query);
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
            const updates = req.body;  
    
            if (!validateUUID(bankId)) {
                throw new InvalidError("Invalid bank id entered");
            }
    
            if (!Array.isArray(updates) || updates.length === 0) {
                throw new InvalidError("Invalid updates format");
            }
    
             
            updates.forEach(({ parameter, value }) => {
                if (!parameter || typeof parameter !== "string") {
                    throw new InvalidError(`Invalid parameter: ${parameter}`);
                }
                if (value === undefined || value === null) {
                    throw new InvalidError(`Invalid value for parameter: ${parameter}`);
                }
            });
    
            const response = await this.bankService.updateBankByBankId(bankId, updates);
    
            if (!response) {
                throw new NotFoundError("Could not update the bank.");
            }
    
            res.status(HttpStatusCode.Ok).json({
                message: `Bank with id ${bankId} has been updated successfully`,
            });
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
}

const bankController = new BankController();
module.exports = bankController;