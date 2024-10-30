const accountConfig = require("../../../model-config/account-config");
const passbookConfig = require("../../../model-config/passbook-config");
const bankConfig = require("../../../model-config/bank-config");
const ledgerConfig = require("../../../model-config/ledger-config");
const { transaction, rollBack, commit } = require("../../../utils/transaction");
const {parseSelectFields,parseLimitAndOffset,parseFilterQueries} = require("../../../utils/request");
const Logger = require("../../../utils/logger");
const NotFoundError = require("../../../errors/notFoundError");
const InvalidError = require("../../../errors/invalidError");
const userConfig = require("../../../model-config/user-config");
const {createUUID} = require("../../../utils/uuid");
class AccountService{
    #associationMap = {
        passbook:{
            model:passbookConfig.model,
            require:true
        }
    }

    #createAssociations(includeQuery){
        const associations = [];

        if(!Array.isArray(includeQuery))
            includeQuery = [includeQuery];

        if(includeQuery?.includes(accountConfig.association.passbook)){
            associations.push(this.#associationMap.passbook);
        }
        return associations;
    }

    async #updateTotalBalance(userId,t){
        // if(!t){
        //     t = await transaction();
        // }
        try{
            Logger.info("update total balance started");

            const totalBalance = await accountConfig.model.sum("accountBalance",{where:{userId:userId}});

            console.log(totalBalance);

            //const isUpdated = await userConfig.model.update({totalBalance:totalBalance},{where:{userId}});

            //console.log(isUpdated);

            const user = await userConfig.model.findByPk(userId,{transaction:t});

            if(!user)
                throw new NotFoundError("user does not exists");

            user["totalBalance"] = totalBalance;

            await user.save({transaction:t});

            Logger.info("total balance updated");
            //await commit(t);
        }
        catch(error){
            Logger.error(error);
        }
    }

    async createAccount(accountNumber,userId,bankId,t){
        if(!t){
            t = await transaction();
        }

        try{
            Logger.info("create account service started");
            // validating bank with id.
            const bank = await bankConfig.model.findOne(
                {
                    where:{
                        id:bankId
                    }
                }
            )
            if(!bank)
                throw NotFoundError("bank does not exist");

            const accountBalance = 1000;

            const account = await accountConfig.model.create(
                {
                    accountNumber,accountBalance,userId,bankId
                },{t}
            );
            this.#updateTotalBalance(userId,t);
            await commit(t);
            
            Logger.info("create account service completed");
            return account;
        }
        catch(error){
            await rollBack(t);
            Logger.error(error);
        }
    }

    async getAllAccounts(userId, query, t) {
        if (!t) {
          t = await transaction();
        }
    
        try {
          Logger.info("get all accounts service started");
          let selectArray = parseSelectFields(query, accountConfig.fieldMapping);
          if (!selectArray) {
            selectArray = Object.values(accountConfig.fieldMapping);
          }
    
          const includeQuery = query.include || [];
          let association = [];
          if (includeQuery) {
            association = this.#createAssociations(includeQuery);
          }

          const filterResults = parseFilterQueries(query, accountConfig.filters);

          
          const finalWhere = {
              ...filterResults.where,  
              userId: userId           
          };
    
          const arg = {
            attributes: selectArray,
            ...parseLimitAndOffset(query),
            transaction: t,
            where: finalWhere,
            
            include: association,
          };
    
          const { count, rows } = await accountConfig.model.findAndCountAll(arg);
          commit(t);
          Logger.info("get all accounts service completed");
          return { count, rows };
        } catch (error) {
          await rollBack(t);
          Logger.error(error);
        }
      }


      async getAccountByAccountNumber(userId, accountNumber, query, t) {
        if (!t) {
          t = await transaction();
        }
    
        try {
          Logger.info("get account by account number service started");
          let selectArray = parseSelectFields(query, accountConfig.fieldMapping);
          if (!selectArray) {
            selectArray = Object.values(accountConfig.fieldMapping);
          }
    
          const includeQuery = query.include || [];
          let association = [];
          if (includeQuery) {
            association = this.#createAssociations(includeQuery);
          }
    
          const arg = {
            attributes: selectArray,
            where: {
              accountNumber: accountNumber,
            },
            transaction: t,
            include: association,
          };
    
          const response = await accountConfig.model.findOne(arg);
          await commit(t);
          Logger.info("get account by account number service completed");
          return response;
        } catch (error) {
          await rollBack(t);
          Logger.error(error);
        }
      }

      async deleteAccountByAccountNumber(userId, accountNumber, t) {
        if (!t) {
          t = await transaction();
        }
    
        try {
          Logger.info("delete account by account number service started");
          const account = await accountConfig.model.findByPk(accountNumber, { transaction: t });
    
          if (!account) {
            throw new NotFoundError(`account with account number ${accountNumber} does not exists`);
          }
          
          const accountBalance = account["accountBalance"];
          console.log(accountBalance);

          if(accountBalance!==0)
            throw new InvalidError("transfer your account money before deleting");
    
          const isDeleted = await accountConfig.model.destroy(
            {
              where: { accountNumber: accountNumber },
            },
            { transaction: t }
          );
          
          
          if (isDeleted === 0)
            throw new NotFoundError(`could not delete Account with account number ${accountNumber} `);
          this.#updateTotalBalance(userId,t);
          await commit(t);
          Logger.info("delete account by id service completed");
          
          return isDeleted;
        } catch (error) {
          await rollBack(t);
          Logger.error(error);
        }
      }

      async #createPassbookEntry(accountNumber,anotherAccountNumber,transactionType,amount,t){
        try{
            Logger.info("create passbook entry service started");
            const id = createUUID();
            const date = new Date();
            const passbookEntry = await passbookConfig.model.create({
                id,accountNumber,anotherAccountNumber,transactionType,amount,date},{transaction:t});

            Logger.info("create passbook entry service ended");
            return true;    
        }
        catch(error){
             
            Logger.error(error);
        }
  }


      async deposit(userId,accountNumber,amount,t){
            if(!t){
                t = await transaction();
            }

            try{
                Logger.info("deposit service started");
                const account = await accountConfig.model.findByPk(accountNumber, { transaction: t });
                if(!account)
                    throw new InvalidError("account does not exist");

                account.accountBalance += amount;
                const deposited = await account.save({transaction:t});
                
                const transactionType = "deposit";
                const anotherAccountNumber = null;
                
                
                const passbookEntry = await this.#createPassbookEntry(accountNumber,anotherAccountNumber,transactionType,amount,t);
            
                if(!passbookEntry)
                    throw new NotFoundError("could not enter the details in passbook");
                
                await this.#updateTotalBalance(userId,t);
                await commit(t);

                Logger.info("deposit service completed");
                return true;

            }
            catch(error){
                await rollBack(t);
                Logger.error(error);
            }
      }


      async withdraw(userId,accountNumber,amount,t){
        if(!t){
            t = await transaction();
        }

        try{
            Logger.info("deposit service started");
            const account = await accountConfig.model.findByPk(accountNumber, { transaction: t });
            if(!account)
                throw new InvalidError("account does not exist");
            const currentBalance = account.accountBalance;
            if(currentBalance<amount)
                throw new InvalidError("insufficient balance in your account");

            account.accountBalance -= amount;
            const withdrawn = await account.save({transaction:t});

            const transactionType = "withdraw";
            const anotherAccountNumber = null;
            
            const passbookEntry = await this.#createPassbookEntry(accountNumber,anotherAccountNumber,transactionType,amount,t);
            
            if(!passbookEntry)
                throw new NotFoundError("could not enter the details in passbook");

                await this.#updateTotalBalance(userId,t);
                await commit(t);

                Logger.info("withdraw service completed");
                return true;
        }
        catch(error){
            await rollBack(t);
            Logger.error(error);
        }
      }

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

      async #updateLedger(debitBankId,creditBankId,amount,t){
        try{
            const debitLedgerEntry = await ledgerConfig.model.findOne({
                where: {
                  bankId: debitBankId,
                  anotherBankId: creditBankId
                },
                transaction: t
              });
              
              if (debitLedgerEntry) {
                debitLedgerEntry.netBalance -= amount;
                await debitLedgerEntry.save({ transaction: t });
              }

              const creditLedgerEntry = await ledgerConfig.model.findOne({
                where: {
                  bankId: creditBankId,
                  anotherBankId: debitBankId
                },
                transaction: t
              });
              
              if (creditLedgerEntry) {
                creditLedgerEntry.netBalance += amount;
                await creditLedgerEntry.save({ transaction: t });
              }
        }
        catch(error){
            Logger.error(error);
        }
      }
      
      async transferMoney(userId,debitAccountNumber, creditAccountNumber,amount,t){
        if(!t){
            t=await transaction();
        }

        try{
            const debitAccount = await accountConfig.model.findByPk(debitAccountNumber,{transaction:t});
            const creditAccount = await accountConfig.model.findByPk(creditAccountNumber,{transaction:t});

            console.log("debit account",debitAccount);
            console.log("credit account",creditAccount);

            if(!debitAccount)
                throw new NotFoundError("debit account does not exists");
            if(!creditAccount)
                throw new NotFoundError("credit account does not exists");

            await this.#verifyUserAccount(userId,debitAccountNumber,t);

            console.log("user verified");

            const debitAccountBalance = debitAccount.accountBalance;

            console.log("debit account balance",debitAccountBalance);
            console.log("credit account balance",creditAccount.accountBalance);

            if(debitAccountBalance<amount)
                throw new InvalidError("insufficient balance");

            debitAccount.accountBalance -= amount;
            creditAccount.accountBalance += amount;

            console.log("debit account balance",debitAccount.accountBalance);
            console.log("credit account balance",creditAccount.accountBalance);

            const debitUserId = debitAccount.userId;
            const creditUserId = creditAccount.userId;
            const debitBankId = debitAccount.bankId;
            const creditBankId = creditAccount.bankId;

            await debitAccount.save({ transaction: t });
            await creditAccount.save({transaction:t});

            await this.#createPassbookEntry(debitAccountNumber,creditAccountNumber,"debit",amount,t);
            await this.#createPassbookEntry(creditAccountNumber,debitAccountNumber,"credit",amount,t);

            if(debitBankId!==creditBankId){
                await this.#updateLedger(debitBankId,creditBankId,amount,t);
            }
            await commit(t);
            await this.#updateTotalBalance(debitUserId);
            await this.#updateTotalBalance(creditUserId);

            
            
            Logger.info("transfer money service completed");
            return true;
        }
        catch(error){
            await rollBack(t);
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


}

module.exports = AccountService;

