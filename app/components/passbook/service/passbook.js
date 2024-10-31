const accountConfig = require("../../../model-config/account-config");
const passbookConfig = require("../../../model-config/passbook-config");
const { transaction, rollBack, commit } = require("../../../utils/transaction");
const {parseSelectFields,parseLimitAndOffset,parseFilterQueries} = require("../../../utils/request");
const Logger = require("../../../utils/logger");
const NotFoundError = require("../../../errors/notFoundError");
const InvalidError = require("../../../errors/invalidError");
const {createUUID} = require("../../../utils/uuid");

class PassbookService{

    async #verifyUserAccount(userId,accountNumber,t){
        try{
            Logger.info("verify user account service started");
            const account = await accountConfig.model.findByPk(accountNumber,{transaction:t});

            if(!account)
                throw new NotFoundError("account does not exists");

            const id = account.userId;

            if(id!==userId)
                throw new InvalidError(`user does not have account with account number ${accountNumber}`);

            Logger.info("verify user account service ended");
            return true;
        }
        catch(error){
            
            Logger.error(error);
        }
      }

    async viewPassbook(userId,accountNumber,query,t){
        if(!t){
            t = await transaction();
        }

        try{
            Logger.info("view passbook service started");
            await this.#verifyUserAccount(userId,accountNumber,t);

            let selectArray = parseSelectFields(query, passbookConfig.fieldMapping);
            if (!selectArray) {
              selectArray = Object.values(passbookConfig.fieldMapping);
            }


            const filterResults = parseFilterQueries(query, passbookConfig.filters);

          
          const finalWhere = {
              ...filterResults.where,  
              accountNumber: accountNumber        
          };
    
          const arg = {
            attributes: selectArray,
            ...parseLimitAndOffset(query),
            transaction: t,
            where: finalWhere
          };

              const { count, rows } = await passbookConfig.model.findAndCountAll(arg);
              await commit(t);
              Logger.info("view passbook service ended");
              return { count, rows };

        }
        catch(error){
            await rollBack(t);
            Logger.error(error);
        }
      }

      async getTransactionDetailByTransactionId(userId,accountNumber,transactionId,query,t){
        if(!t){
            t = await transaction();
        }

        try{
            Logger.info("get transaction details by transaction id  service started");
            await this.#verifyUserAccount(userId,accountNumber,t);

            let selectArray = parseSelectFields(query, passbookConfig.fieldMapping);
            if (!selectArray) {
              selectArray = Object.values(passbookConfig.fieldMapping);
            }


            const filterResults = parseFilterQueries(query, passbookConfig.filters);

          
          const finalWhere = {
              ...filterResults.where,
              id: transactionId,
              accountNumber: accountNumber,        
          };
    
          const arg = {
            attributes: selectArray,
            ...parseLimitAndOffset(query),
            transaction: t,
            where: finalWhere
          };

              const transaction = await passbookConfig.model.findOne(arg);
              if(!transaction)
                throw new NotFoundError("could not found the transaction");
              await commit(t);
              Logger.info("get transaction details by transaction id service completed");
              return transaction;

        }
        catch(error){
            await rollBack(t);
            Logger.error(error);
        }
      }
}

module.exports = PassbookService;