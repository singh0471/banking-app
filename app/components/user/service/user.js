const { where, Op } = require("sequelize");
const userConfig = require("../../../model-config/user-config");
const kycConfig = require("../../../model-config/kyc-config");
const {transaction,rollBack,commit} = require("../../../utils/transaction");
const { parseSelectFields, parseLimitAndOffset, parseFilterQueries } = require("../../../utils/request");
const accountConfig = require("../../../model-config/account-config");
const Logger = require("../../../utils/logger");
const bcrypt = require("bcrypt");
const NotFoundError = require("../../../errors/notFoundError");
const InvalidError = require("../../../errors/invalidError");
const sendEmail = require("../../../utils/email");
const { createUUID } = require("../../../utils/uuid");
class UserService{

    #associationMap = {
        accounts : {
            model : accountConfig.model,
            required : true
        },
        kyc :{
            model:kycConfig.model,
            required:true
        }
    };

    #createAssociations(includeQuery){
        const associations = [];

        if(!Array.isArray(includeQuery)){
            includeQuery = [includeQuery];
        }

        if(includeQuery?.includes(userConfig.association.accounts)){
            associations.push(this.#associationMap.accounts);
        }
        if(includeQuery?.includes(userConfig.association.kyc)){
            associations.push(this.#associationMap.kyc);
        }
        return associations;
    }

    async getUserByUsername(username,t){
        if(!t){
            t = await transaction();
        }

        try{
            Logger.info("get user by user name service started");

            const user = await userConfig.model.findOne(
                {
                    where : {username},
                },
                {t}
            );

            

            await commit(t);

            Logger.info("get user by username service completed");
            return user;
        }
        catch(error){
            await rollBack(t);
            Logger.error(error);
        }
    }



    async createUser(id,username,email,password,firstName,lastName,dateOfBirth,isAdmin,t){
            if(!t){
                t = await transaction();
            }

            try{
                Logger.info("create user service started");
                const hashedPassword = await bcrypt.hash(password,10);
                let totalBalance = 0;
                console.log(hashedPassword);
                let response = await userConfig.model.create(
                    {
                        id, username,email,password:hashedPassword,firstName,lastName,dateOfBirth,isAdmin,totalBalance
                    },
                    {t}
                )
                console.log("hello word");
                if(!isAdmin){
                await kycConfig.model.create({id:createUUID(),userId:id},{transaction:t});}
                await commit(t);
                Logger.info("create user completed");
                
                await sendEmail(email,"Registration successful",`Hi ${firstName}! your registration has been successful. you username is - ${username} and password is - ${password}. please visit localhost:3000 to login.`)
                return response;

            }
            catch(error){
                await rollBack(t);
                Logger.error(error);
            }
    }

    async getAllUsers(query,t){
        if(!t){
            t= await transaction();
        }

        try{
            Logger.info("get all users function started");

            let selectArray = parseSelectFields(query,userConfig.fieldMapping);
            console.log(selectArray);
            if(!selectArray){
                selectArray = Object.values(userConfig.fieldMapping);
            }
            
            const includeQuery = query.include || [];
            let association = [];
            
            if(includeQuery){
                association = this.#createAssociations(includeQuery);
            }
            const filterResults = parseFilterQueries(query, userConfig.filters);
            const finalWhere = {
                ...filterResults.where,  
                isAdmin: false        
            };
            
            const arg = {
                attributes: selectArray,
                ...parseLimitAndOffset(query),
                transaction: t,
                where:finalWhere,
                include: association,
              };


              console.log(arg);
              
              const { count, rows } = await userConfig.model.findAndCountAll(arg);
              console.log("helllo");
              await commit(t);
              Logger.info("get all users service completed");
              return {count,rows};
        }
        catch(error){
            await rollBack(t);
            Logger.error(error);
        }
    }


    async getUserByUserId(userId,query,t){
        if(!t){
            t=await transaction();
        }

        try{
            Logger.info("getUserByUserId function started");

            let selectArray = parseSelectFields(query,userConfig.fieldMapping);
            if(!selectArray){
                selectArray = Object.values(userConfig.fieldMapping);
            }
           
            const includeQuery = query.include || [];
            let association = [];
            if (includeQuery) {
                association = this.#createAssociations(includeQuery);
                }

                const arg = {
                    attributes: selectArray,
                    where: {
                      id: userId,
                    },
                    transaction: t,
                    include: association,
                  };
                
            const response = await userConfig.model.findOne(arg);
            await commit(t);
            Logger.info("get user by id service completed");
            return response;  
        }
        catch(error){
            await rollBack(t);
            Logger.error(error);
        }
    }

    async updateUserByUserId(userId, updates, t) {
        if (!t) {
            t = await transaction();
        }
        try {
            Logger.info("update user by user id service started");
    
            const user = await userConfig.model.findByPk(userId, { transaction: t });
    
            if (!user) {
                throw new NotFoundError(`User with id ${userId} does not exist.`);
            }
    
            const updatedDetails = [];  
    
            for (const { parameter, value } of updates) {
                if (!Object.keys(userConfig.fieldMapping).includes(parameter)) {
                    throw new InvalidError(`Invalid parameter: ${parameter}`);
                }
    
                if (parameter === "username") {
                    const existingUser = await this.getUserByUsername(value);
                    if (existingUser) {
                        throw new InvalidError("Username already exists");
                    }
                }
    
                if (parameter === "password") {
                    user[parameter] = await bcrypt.hash(value, 10);
                } else {
                    user[parameter] = value;
                }
    
                 
                updatedDetails.push(`${parameter}: ${value}`);
            }
    
            await user.save({ transaction: t });
            commit(t);
    
           
            const emailMessage = `
                Hi ${user.firstName}, 
                
                Your account has been successfully updated. Here are the updated details:
    
                ${updatedDetails.join('\n')}
    
                Please visit localhost:3000 to view your account.
            `;
    
            
            await sendEmail(user.email, "Account Update Notification", emailMessage);
    
            Logger.info("update user by user id service completed");
            return user;
        } catch (error) {
            await rollBack(t);
            Logger.error(error);
            throw error;
        }
    }
    
    

    async deleteUserByUserId(userId, t) {
        if (!t) {
          t = await transaction(t);
        }
    
        try {
          Logger.info("delete user by userId service started");
    
          const accountCount = await accountConfig.model.count({
            where: { userId: userId },
            transaction: t
                });

          if(accountCount>0)
            throw new InvalidError("The bank cannot be deleted because it has accounts associated with it.");
        
          const user = await userConfig.model.findOne({
            where: {id:userId},
            transaction:t,
          });

          const email = user['email'];

          const isDeleted = await userConfig.model.destroy({
            where: { id: userId },
            transaction: t,
          });
    
          if (isDeleted === 0)
            throw new NotFoundError(`could not delete user`);
    
          await commit(t);
          Logger.info("delete user by id service completed");
          sendEmail(email,"Account Deleted",`Hi! ${user.firstName}! your Central Bank account has been deleted sucessfully`);
          return isDeleted;
        } catch (error) {
          await rollBack(t);
          Logger.error(error);
        }
      }
    


}

module.exports = UserService;