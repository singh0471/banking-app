const ledgerConfig = require("../../../model-config/ledger-config");
const Logger = require("../../../utils/logger");
const { parseSelectFields,parseLimitAndOffset,parseFilterQueries} = require("../../../utils/request");
const {rollBack,transaction,commit} = require("../../../utils/transaction");
const NotFoundError = require("../../../errors/notFoundError");
const InvalidError = require("../../../errors/invalidError");

class LedgerService{

    async viewLedger(bankId,query,t){
        if(!t){
          t = await transaction();
        }

        try{
          Logger.info("view ledger service started");
          let selectArray = parseSelectFields(query, ledgerConfig.fieldMapping);
            if (!selectArray) {
              selectArray = Object.values(ledgerConfig.fieldMapping);
            }

            const filterResults = parseFilterQueries(query, ledgerConfig.filters);

          
          const finalWhere = {
              ...filterResults.where,  
              bankId: bankId        
          };

          const arg = {
            attributes: selectArray,
            ...parseLimitAndOffset(query),
            transaction: t,
            where: finalWhere
          };

            const { count, rows } = await ledgerConfig.model.findAndCountAll(arg);
              await commit(t);

              Logger.info("view ledger service ended");
              return { count, rows };


        }
        catch(error){
          await rollBack(t);
          Logger.error(error);
        }
      }

      async viewLedgerByBankId(bankId,anotherBankId,query,t){
        if(!t){
          t = await transaction();
        }

        try{
          Logger.info("view ledger by id service started");
          let selectArray = parseSelectFields(query, ledgerConfig.fieldMapping);
            if (!selectArray) {
              selectArray = Object.values(ledgerConfig.fieldMapping);
            }

            const filterResults = parseFilterQueries(query, ledgerConfig.filters);

          
          const finalWhere = {
              ...filterResults.where,  
              bankId: bankId,
              anotherBankId:anotherBankId        
          };

          const arg = {
            attributes: selectArray,
            ...parseLimitAndOffset(query),
            transaction: t,
            where: finalWhere
          };
          const ledger = await ledgerConfig.model.findOne(arg);

          if(!ledger)
            throw new NotFoundError("ledger does not exists");
          await commit(t);
          Logger.info("view ledger by id service completed");
          return ledger;
        }
        catch(error){
          await rollBack(t);
          Logger.error(error);
        }
      }
}

module.exports = LedgerService;