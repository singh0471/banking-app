const AccountService = require("../service/account");
const { createUUID, validateUUID } = require("../../../utils/uuid");
const Logger = require("../../../utils/logger");
const { HttpStatusCode } = require("axios");
const { setXTotalCountHeader } = require("../../../utils/response");
const accountConfig = require("../../../model-config/account-config");
const NotFoundError = require("../../../errors/notFoundError");
const InvalidError = require("../../../errors/invalidError");
const { isPositiveInteger, getUniqueNumber } = require("../../../utils/number");

class AccountController{
    constructor(){
        this.accountService = new AccountService();
    }

    async createAccount(req,res,next){
        try{
            Logger.info("create contact controller started");
            const {userId} = req.params;
            const {bankId} = req.body;

            if(!bankId || !validateUUID(bankId))
                throw InvalidError("invalid bank id");

            const response = await this.accountService.createAccount(createUUID(),userId,bankId);
            Logger.info("create account controller completed");
            res.status(HttpStatusCode.Created).json(response);
        }
        catch(error){
            next(error);
        }
    }

    async getAllAccounts(req, res, next) {
        try {
          Logger.info("get all accounts controller started");
          const { userId } = req.params;
          if (!validateUUID(userId)) {
            throw new Error("invalid user id entered");
          }
          const { count, rows } = await this.accountService.getAllAccounts(
            userId,
            req.query
          );
          setXTotalCountHeader(res, count);
          res.status(HttpStatusCode.Ok).json(rows);
        } catch (error) {
          next(error);
        }
      }

      async getAccountByAccountNumber(req, res, next) {
        try {
          Logger.info("get account by account number controller started");
          const { userId, accountNumber } = req.params;
          if (!validateUUID(userId)) {
            throw new Error("invalid user id");
          }
          if (!validateUUID(accountNumber)) {
            throw new Error("invalid account id");
          }
    
          const response = await this.accountService.getAccountByAccountNumber(
            userId,
            accountNumber,
            req.query
          );
          Logger.info("get account by account number controller completed");
          res.status(HttpStatusCode.Ok).json(response);
        } catch (error) {
          next(error);
        }
      }

      async deleteAccountByAccountNumber(req, res, next) {
        try {
          Logger.info("delete account by account number controller started");
          const { userId, accountNumber } = req.params;
          if (!validateUUID(userId)) {
            throw new Error("invalid user id");
          }
          if (!validateUUID(accountNumber)) {
            throw new Error("invalid account number");
          }
    
          const response = await this.accountService.deleteAccountByAccountNumber(userId,accountNumber);
          if (!response)
            throw new NotFoundError("could not delete account");
    
          Logger.info("delete account by account number controller deleted");
          res.status(HttpStatusCode.Ok).json({message: `Account with account number ${accountNumber} has been deleted successfully`});
        } catch (error) {
          next(error);
        }
      }

      async deposit(req,res,next){
        try{
          Logger.info("deposit controller started");
          const {userId,accountNumber} = req.params;

          if(!validateUUID(userId))
            throw new InvalidError("invalid user id")
          if(!validateUUID(accountNumber))
            throw new InvalidError("invalid account number");

          const {amount} = req.body;

          if(!isPositiveInteger(amount))
            throw InvalidError("invalid amount entered");

          const isDeposited = await this.accountService.deposit(userId,accountNumber,amount);

          if(!isDeposited)
            throw new NotFoundError("could not deposit the amount");

          res.status(HttpStatusCode.Ok).json({message:`amount ${amount} has been successfully deposited to account number ${accountNumber}`});
          Logger.info("deposit controller completed");
        }
        catch(error){
          next(error);
        }
      }


      async withdraw(req,res,next){
        try{
          Logger.info("withdraw controller started");
          const {userId,accountNumber} = req.params;

          if(!validateUUID(userId))
            throw new InvalidError("invalid user id")
          if(!validateUUID(accountNumber))
            throw new InvalidError("invalid account number");

          const {amount} = req.body;

          if(!isPositiveInteger(amount))
            throw InvalidError("invalid amount entered");

          const isWithdrawn = await this.accountService.withdraw(userId,accountNumber,amount);

          if(!isWithdrawn)
            throw new NotFoundError("could not withdraw the amount");

          res.status(HttpStatusCode.Ok).json({message:`amount ${amount} has been successfully withdrawn from account number ${accountNumber}`});
          Logger.info("withdraw controller completed");
        }
        catch(error){
          next(error);
        }
      }

      async transferMoney(req,res,next){
        try{
          Logger.info("transfer money controller started");
          const {userId,accountNumber} = req.params;

          if(!validateUUID(userId))
            throw new InvalidError("invalid user id")
          if(!validateUUID(accountNumber))
            throw new InvalidError("invalid account number");

          const {accountNo,amount} = req.body;

          if(!validateUUID(accountNo))
            throw new InvalidError("invalid account no");

          if(accountNumber===accountNo)
            throw new InvalidError("cannot transfer to same account");

          if(!isPositiveInteger(amount))
            throw new InvalidError("invalid amount entered");

          const isTransferred = await this.accountService.transferMoney(userId,accountNumber,accountNo,amount);
          console.log(isTransferred);
          if(!isTransferred)
            throw new Error("could not transfer the money");
          res.status(HttpStatusCode.Ok).json({message:`amount ${amount} has been successfully transferred.`});
          Logger.info("transfer money controller completed");
        }
        catch(error){
          next(error);
        }
      }
}

const accountController = new AccountController();
module.exports = accountController;