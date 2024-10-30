const { where, Op } = require("sequelize");
const userConfig = require("../../../model-config/user-config");
const {transaction,rollBack,commit} = require("../../../utils/transaction");
const { parseSelectFields, parseLimitAndOffset, parseFilterQueries } = require("../../../utils/request");
const accountConfig = require("../../../model-config/account-config");
const Logger = require("../../../utils/logger");
const bcrypt = require("bcrypt");
const NotFoundError = require("../../../errors/notFoundError");
const InvalidError = require("../../../errors/invalidError");
class UserService{

    #associationMap = {
        account : {
            model : accountConfig.model,
            required : true
        },
    };

    #createAssociations(includeQuery){
        const associations = [];

        if(!Array.isArray(includeQuery)){
            includeQuery = [includeQuery];
        }

        if(includeQuery?.includes(userConfig.association.account)){
            associations.push(this.#associationMap.account);
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



    async createUser(id,username,password,firstName,lastName,isAdmin,t){
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
                        id, username,password:hashedPassword,firstName,lastName,isAdmin,totalBalance
                    },
                    {t}
                )
                

                await commit(t);
                Logger.info("create user completed");
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

        
            
            const arg = {
                attributes: selectArray,
                ...parseLimitAndOffset(query),
                transaction: t,
                ...parseFilterQueries(query, userConfig.filters),
                
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

    async updateUserByUserId(userId, parameter, value, t) {
        if (!t) {
          t = await transaction();
        }
        try {
          Logger.info("update user by user id service started");

          if (!Object.keys(userConfig.fieldMapping).includes(parameter)) {
            throw new InvalidError("invalid parameter entered");
        }

          if(parameter==="username"){
            const user = await this.getUserByUsername(value);
            if(user){
                throw new InvalidError("username already exists");
            }
          }
    
          const user = await userConfig.model.findByPk(userId, { transaction: t });
    
          if (!user) {
            throw new NotFoundError(`User with id ${userId} does not exist.`);
          }
    
          user[parameter] = value;
    
          await user.save({ transaction: t });
    
          commit(t);
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
    
          const isDeleted = await userConfig.model.destroy({
            where: { id: userId },
            transaction: t,
          });
    
          if (isDeleted === 0)
            throw new NotFoundError(`could not delete user`);
    
          await commit(t);
          Logger.info("delete user by id service ended...");
          return isDeleted;
        } catch (error) {
          await rollBack(t);
          Logger.error(error);
        }
      }
    


}

module.exports = UserService;