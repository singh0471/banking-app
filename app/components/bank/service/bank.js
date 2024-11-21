const bankConfig = require("../../../model-config/bank-config");
const accountConfig = require("../../../model-config/account-config");
const ledgerConfig = require("../../../model-config/ledger-config");
const Logger = require("../../../utils/logger");

const { parseSelectFields,parseLimitAndOffset,parseFilterQueries} = require("../../../utils/request");
const {rollBack,transaction,commit} = require("../../../utils/transaction");
const NotFoundError = require("../../../errors/notFoundError");
const InvalidError = require("../../../errors/invalidError");
const { where } = require("sequelize");

class BankService{
    #associationMap = {
        accounts : {
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

        if(includeQuery?.includes(bankConfig.association.accounts)){
            association.push(this.#associationMap.accounts);
        }
        if(includeQuery?.includes(bankConfig.association.ledger)){
            association.push(this.#associationMap.ledger);
        }
        return association;

    }

    async #createLedger(id,name,t){
        try{
          Logger.info("create ledger service started");
          const existingBanks = await bankConfig.model.findAll({
            attributes:["id",'name'],
            transaction:t
          })


          for(let bank of existingBanks){
            const existingBankId = bank.id;
            const existingBankName = bank.name;
            if (id === existingBankId) {
              continue; 
              }

            await ledgerConfig.model.create({
              bankId:id,
              bankName:name,
              anotherBankId:existingBankId,
              anotherBankName: existingBankName,
              netBalance:0
            },{transaction:t})


            await ledgerConfig.model.create({
              bankId:existingBankId,
              bankName : existingBankName,
              anotherBankId:id,
              anotherBankName:name,
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


    


    // async createBank(id,name,abbreviation,t){
    //     if(!t){
    //         t = await transaction();
    //     }

    //     try{
    //         Logger.info("create bank service started");
            

    //         const response = await bankConfig.model.create({id,name,abbreviation},{t});

    //         const createLedger = await this.#createLedger(id,name,t);
    //         if(!createLedger)
    //           throw new NotFoundError("could not create ledger");
    //         await commit(t);
    //         Logger.info("create bank service completed");
    //         return response;
    //     }
    //     catch(error){
    //         await rollBack(t);
    //         Logger.error(error);
    //     }
    // }

    async createBank(id, name, abbreviation, t) {
      if (!t) {
          t = await transaction();
      }
  
      try {
          Logger.info("create bank service started");
  
          const response = await bankConfig.model.create(
              { id, name, abbreviation },
              { transaction: t }  
          );
  
          const createLedger = await this.#createLedger(id, name, t);
          if (!createLedger) throw new NotFoundError("Could not create ledger");
  
          await commit(t);
          Logger.info("create bank service completed");
          return response;
      } catch (error) {
          await rollBack(t);
          Logger.error(error);
  
          
          if (error.name === "SequelizeUniqueConstraintError") {
              throw new InvalidError("Bank name or abbreviation already exists.");
          }
  
           
          throw error;
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

    async getAllBanksForUsers(query,t){
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

    async updateBankByBankId(bankId, updates, t) {
      if (!t) {
          t = await transaction();
      }
  
      try {
          Logger.info("update bank by id service started");
          const bank = await bankConfig.model.findByPk(bankId, { transaction: t });
  
          if (!bank) {
              throw new NotFoundError(`Could not find bank with id ${bankId}`);
          }
  
           
          for (const { parameter, value } of updates) {
              if (!parameter || typeof parameter !== "string") {
                  throw new InvalidError(`Invalid parameter: ${parameter}`);
              }
              if (value === undefined || value === null) {
                  throw new InvalidError(`Invalid value for parameter: ${parameter}`);
              }
  
               
              if (parameter === 'name') {
                  const existingBanks = await bankConfig.model.findAll({
                      where: { name: value },
                      transaction: t,
                  });
  
                  if (existingBanks.length > 0) {
                      throw new InvalidError("Bank Name already exists");
                  }
              }
  
              
              if (parameter === 'abbreviation') {
                  const existingAbbreviations = await bankConfig.model.findAll({
                      where: { abbreviation: value },
                      transaction: t,
                  });
  
                  if (existingAbbreviations.length > 0) {
                      throw new InvalidError("Bank Abbreviation already exists");
                  }
              }
  
               
              bank[parameter] = value;
          }
  
           
          await bank.save({ transaction: t });
          await commit(t);
  
          Logger.info("update bank by id service completed");
          return bank;
      } catch (error) {
          await rollBack(t);
          Logger.error(error);
          throw error;
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
            throw new InvalidError("The bank cannot be deleted because it has accounts associated with it.");
    
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
    
          await ledgerConfig.model.destroy(
            {
              where: {
                bankId:bankId
              },
            },
            {transaction:t,}
          );

          await ledgerConfig.model.destroy(
            {
              where: {
                anotherBankId:bankId
              },
            },
            {transaction:t,}
          );
         
          await commit(t);
          Logger.info("delete bank service completed");
          return isDeleted;

        } catch (error) {
            await rollBack(t);
            Logger.error(error);
        }
      }

}

module.exports = BankService;