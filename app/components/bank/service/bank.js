const bankConfig = require("../../../model-config/bank-config");
const accountConfig = require("../../../model-config/account-config");
const ledgerConfig = require("../../../model-config/ledger-config");
const Logger = require("../../../utils/logger");

const { parseSelectFields,parseLimitAndOffset,parseFilterQueries} = require("../../../utils/request");
const {rollBack,transaction,commit} = require("../../../utils/transaction");
const NotFoundError = require("../../../errors/notFoundError");
const InvalidError = require("../../../errors/invalidError");

class BankService{
    #associationMap = {
        account : {
            model : accountConfig.model,
            required : true
        },
        ledger : {
            model:ledgerConfig.model,
            required:true
        },
    };


    #createAssociations(includeQuery){
        const association = [];

        if(!Array.isArray(includeQuery)){
            includeQuery = [includeQuery];
        }

        if(includeQuery?.includes(bankConfig.association.account)){
            association.push(this.#associationMap.account);
        }
        if(includeQuery?.includes(bankConfig.association.ledger)){
            association.push(this.#associationMap.ledger);
        }
        return association;

    }

    async #createLedger(id,t){
        try{
          Logger.info("create ledger service started");
          const existingBanks = await bankConfig.model.findAll({
            attributes:["id"],
            transaction:t
          })


          for(let bank of existingBanks){
            const existingBankId = bank.id;
            
            if (id === existingBankId) {
              continue; 
              }

            await ledgerConfig.model.create({
              bankId:id,
              anotherBankId:existingBankId,
              netBalance:0
            },{transaction:t})


            await ledgerConfig.model.create({
              bankId:existingBankId,
              anotherBankId:id,
              netBalance:0
            },{transaction:t})

          }
          Logger.info("create ledger service ended");
          return true;
        }
        catch(error){
          Logger.error(error);
        }
    }


    


    async createBank(id,name,abbreviation,t){
        if(!t){
            t = await transaction();
        }

        try{
            Logger.info("create bank service started");
            

            const response = await bankConfig.model.create({id,name,abbreviation},{t});

            const createLedger = await this.#createLedger(id,t);
            if(!createLedger)
              throw new NotFoundError("could not create ledger");
            await commit(t);
            Logger.info("create bank service completed");
            return response;
        }
        catch(error){
            await rollBack(t);
            Logger.error(error);
        }
    }


    async getAllBanks(query,t){
        if(!t){
            t = await transaction();
        }

        try{

        Logger.info("get all banks service started");

        let selectArray = parseSelectFields(query, bankConfig.fieldMapping);
        if (!selectArray) {
          selectArray = Object.values(bankConfig.fieldMapping);
        }
  
        const includeQuery = query.include || [];
        let association = [];
        if (includeQuery) {
          association = this.#createAssociations(includeQuery);
        }
  
        const arg = {
          attributes: selectArray,
          ...parseLimitAndOffset(query),
          transaction: t,
          ...parseFilterQueries(query, bankConfig.filters),
          include: association,
        };
  
        const { count, rows } = await bankConfig.model.findAndCountAll(arg);
        await commit(t);
        Logger.info("get all banks service completed");
        return { count, rows };}
        catch(error){
            await rollBack(t);
            Logger.error(error);
        }
    }

    async getBankByBankId(bankId,query,t){
        if(!t){
            t = await transaction();
        }
        try{
            Logger.info("get bank by bank id service started");
            let selectArray = parseSelectFields(query, bankConfig.fieldMapping);
            if (!selectArray) {
                selectArray = Object.values(bankConfig.fieldMapping);
                }

            const includeQuery = query.include || [];
            let association = [];
            if (includeQuery) {
                association = this.#createAssociations(includeQuery);
                    }

            const arg = {
                attributes: selectArray,
                where: {
                    id: bankId,
                    },
                transaction: t,
                include: association,
                };

            const response = await bankConfig.model.findOne(arg);
            await commit(t);
            
            Logger.info("get bank by service completed");
            return response;
        }
        catch(error){
            await rollBack(t);
            Logger.error(error);
        }
    }

    async updateBankByBankId(bankId, parameter, value, t) {
        if (!t) {
          t = await transaction();
        }
    
        try {
          Logger.info("update bank by id service started");
          const bank = await bankConfig.model.findByPk(bankId, { transaction: t });
          if (!bank)
            throw new NotFoundError(`could not found bank with bank id ${bankId}`);
    
          bank[parameter] = value;
          await bank.save({ transaction: t });
    
          await commit(t);
          Logger.info("update bank by id service completed");
          return bank;
        } catch (error) {
            await rollBack(t);
          Logger.error(error);
        }
      }

      async deleteBankByBankId(bankId, t) {
        if (!t) {
          t = await transaction();
        }
    
        try {
          Logger.info("delete bank service started");
    
          const accountCount = await accountConfig.model.count(
            {
              where: {
                bankId: bankId,
              },
            },
            {
              transaction: t,
            }
          );
          if (accountCount > 0)
            throw new InvalidError("Cannot delete bank since there exists accounts in this bank...");
    
          const isDeleted = await bankConfig.model.destroy(
            {
              where: {
                id: bankId,
              },
            },
            {
              transaction: t,
            }
          );
          console.log("isdeleted",isDeleted); 
          if (isDeleted === 0)
            throw new NotFoundError(`Bank with id ${bankId} does not exist`);
    
         
          await commit(t);
          Logger.info("delete bank service completed");
          return isDeleted;

        } catch (error) {
            await rollBack(t);
            Logger.error(error);
        }
      }

      async viewLedger(bankId,query,t){
        if(!t){
          t = await transaction();
        }

        try{
          Logger.info("view passbook service started");
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
}

module.exports = BankService;