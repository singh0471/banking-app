const accountConfig = require("../../../model-config/account-config");
const passbookConfig = require("../../../model-config/passbook-config");
const bankConfig = require("../../../model-config/bank-config");
const ledgerConfig = require("../../../model-config/ledger-config");
const { transaction, rollBack, commit } = require("../../../utils/transaction");
const {parseSelectFields,parseLimitAndOffset,parseFilterQueries} = require("../../../utils/request");
const Logger = require("../../../utils/logger");
const NotFoundError = require("../../../errors/notFoundError");
const InvalidError = require("../../../errors/invalidError");
const UnauthorizedError = require("../../../errors/unauthorizedError");
const userConfig = require("../../../model-config/user-config");
const kycConfig = require("../../../model-config/kyc-config");
const {createUUID} = require("../../../utils/uuid");
const sendEmail = require("../../../utils/email");

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
       
        try{
            Logger.info("update total balance started");

            const totalBalance = await accountConfig.model.sum("accountBalance",{where:{userId:userId}});

            console.log(totalBalance);

            const user = await userConfig.model.findByPk(userId,{transaction:t});

            if(!user)
                throw new NotFoundError("user does not exists");

            user["totalBalance"] = totalBalance;

            await user.save({transaction:t});

            Logger.info("total balance updated");
            
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
             
            const bank = await bankConfig.model.findByPk(bankId,{transaction:t});
            if(!bank)
                throw NotFoundError("bank does not exist");

            const accountBalance = 1000;

            const kyc = await kycConfig.model.findOne({
              where: { userId: userId },
              transaction: t,
          });

            if(kyc.status!=='approved'){
              throw new UnauthorizedError("You cannot create account because your KYC is not completed");
            }
            const bankName = bank.name;
            const account = await accountConfig.model.create(
                {
                    accountNumber,accountBalance,userId,bankId,bankName
                },{t}
            );
            this.#updateTotalBalance(userId,t);
            const userObj = await userConfig.model.findByPk(userId, {transaction:t});
             await this.#createPassbookEntry(accountNumber,null,'deposit',1000,t);
            await commit(t);
            
            Logger.info("create account service completed");
            await sendEmail(userObj.email,"Account Created", `Hi! ${userObj.firstName}! Your account has been successfully created in ${bank.name}. your account number is - ${accountNumber}`)
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
          const user = await userConfig.model.findByPk(userId, {transaction:t});
          await sendEmail(user.email,"Account Deleted" , `Hi ${user.firstName}! you account number ${accountNumber} has been deleted successfully`);
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
                const user = await userConfig.model.findByPk(userId,{transaction:t});
                await commit(t);
                await sendEmail(user.email,"Amount Deposited", `Hi ${user.firstName}! RS. ${amount} has been successfully deposited in your account number ${accountNumber}.`);
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
                const user = await userConfig.model.findByPk(userId,{transaction:t});
                await commit(t);
                await sendEmail(user.email,"Amount Withdrawn", `Hi ${user.firstName}! RS. ${amount} has been successfully withdrawn in your account number ${accountNumber}.`);
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
           
            await this.#updateTotalBalance(debitUserId);
            await this.#updateTotalBalance(creditUserId);
            
            const debitUser = await userConfig.model.findByPk(debitUserId,{transaction:t});
            const creditUser = await userConfig.model.findByPk(creditUserId,{transaction:t});

            await sendEmail(debitUser.email,"Amount Debited",`Hi ${debitUser.firstName}! RS ${amount} has been debited from you account number ${debitAccountNumber}.`);
            await sendEmail(debitUser.email,"Amount Credited",`Hi ${creditUser.firstName}! RS ${amount} has been credited from you account number ${creditAccountNumber}.`);
            await commit(t);
            Logger.info("transfer money service completed");
            return true;
        }
        catch(error){
            await rollBack(t);
            Logger.error(error);
        }
      }

}

module.exports = AccountService;

