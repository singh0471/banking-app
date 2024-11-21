const {HttpStatusCode} = require("axios");
const UserService = require("../service/user");
const {createUUID,validateUUID} = require("../../../utils/uuid");
const {setXTotalCountHeader} = require("../../../utils/response");
const Logger = require("../../../utils/logger");
const bcrypt = require("bcrypt");
const InvalidError = require("../../../errors/invalidError");
const NotFoundError = require("../../../errors/notFoundError");
const UnauthorizedError = require("../../../errors/unauthorizedError");
const {Payload} = require("../../../middleware/authentication");
const sendEmail = require("../../../utils/email");


class UserController{
    constructor(){
        this.userService = new UserService();
    }

    async login(req,res,next)  {
        try{
            Logger.info("login method started");

            const {username,password} = req.body;

            if(!username || typeof username !== "string"){
                throw new InvalidError("invalid username");
            }
            if(!password || typeof password !== "string"){
                throw new InvalidError("invalid password");
            }

            const user = await this.userService.getUserByUsername(username);
            
            if(!user){
                throw new NotFoundError("user does not exists");
            }
            
            if(await bcrypt.compare(password,user.password)){
               const payload = new Payload(user.id,user.isAdmin);
                let token = payload.signPayload();
                res.cookie("auth", `Bearer ${token}`);

                res.set("auth", `Bearer ${token}`);
                res.status(200).send(token);
            }else{
                res.status(403).json({
                    message: "incorrect password entered"});
            }
            Logger.info("login completed");

        }
        catch(error){
            next(error);
        }
    }

    async createAdmin(req,res,next){
        try{
            Logger.info("create admin started");
            const {username,password,email,firstName,lastName,dateOfBirth} = req.body;

            if(!username || typeof username !== "string")
                throw new InvalidError("invalid username");
            if(!email || typeof email !== "string")
              throw new InvalidError("invalid email id");  
            if(!password || typeof password !== "string")
                throw new InvalidError("invalid password");
            if(!firstName || typeof firstName !== "string")
                throw new InvalidError("invalid first name");
            if(!lastName || typeof lastName !== "string")
                throw new InvalidError("invalid last name");
            if(!dateOfBirth)
              throw new InvalidError("invalid date of birth");  

            const user = await this.userService.getUserByUsername(username);
            if(user){
                res.status(HttpStatusCode.BadRequest).send("username already taken");
            }

            const response = await this.userService.createUser(createUUID(),username,email,password,firstName,lastName,dateOfBirth,true);
            Logger.info("create admin ended");
            res.status(HttpStatusCode.Created).json(response);
        }
        catch(error){
            next(error);
        }
    }

    async createUser(req,res,next){
        try{
            Logger.info("create user started");
            const {username,password,email,firstName,lastName,dateOfBirth} = req.body;

            if(!username || typeof username !== "string")
              throw new InvalidError("invalid username");
          if(!email || typeof email !== "string")
            throw new InvalidError("invalid email id");  
          if(!password || typeof password !== "string")
              throw new InvalidError("invalid password");
          if(!firstName || typeof firstName !== "string")
              throw new InvalidError("invalid first name");
          if(!lastName || typeof lastName !== "string")
              throw new InvalidError("invalid last name");
          if(!dateOfBirth)
            throw new InvalidError("invalid date of birth"); 

            const user = await this.userService.getUserByUsername(username);
            if(user){
                res.status(HttpStatusCode.BadRequest).send("username already taken");
            }

            const response = await this.userService.createUser(createUUID(),username,email,password,firstName,lastName,dateOfBirth,false);
            Logger.info("create user ended");
           
            res.status(HttpStatusCode.Created).json(response);
        }
        catch(error){
            next(error);
        }
    }

    async getAllUsers(req, res, next) {
        try {
          Logger.info("getAll users controller started");
          const { count, rows } = await this.userService.getAllUsers(req.query);
          setXTotalCountHeader(res, count);
          res.status(HttpStatusCode.Ok).json(rows);
          Logger.info("getAll users controller ended");
        } catch (error) {
          next(error);
        }
      }

      async getUserByUserId(req, res, next) {
        try {
          Logger.info("get user by id controller started");
          const { userId } = req.params;
          if (!validateUUID(userId)) {
            throw new Error("invalid user id");
          }
    
          const response = await this.userService.getUserByUserId(userId, req.query);
          Logger.info("get user by id controller completed");
          
          res.status(HttpStatusCode.Ok).json(response);
        } catch (error) {
          next(error);
        }
      }


      async updateUserByUserId(req, res, next) {
        try {
            Logger.info("update user by user id controller started");
            const { userId } = req.params;
            const updates = req.body;  
    
            if (!validateUUID(userId)) {
                throw new InvalidError("Invalid user ID entered");
            }
    
             
            if (!Array.isArray(updates) || updates.length === 0) {
                throw new InvalidError("Invalid updates format");
            }
    
             
            updates.forEach(({ parameter, value }) => {
                if (typeof parameter !== "string") throw new InvalidError("Invalid parameter");
                if (typeof value !== "string") throw new InvalidError("Invalid value");
            });
    
            const response = await this.userService.updateUserByUserId(userId, updates);
    
            if (!response) throw new NotFoundError("Could not update user");
    
            Logger.info("update user by user id completed");
            res
                .status(HttpStatusCode.Ok)
                .json({ message: `User with id ${userId} has been updated successfully` });
        } catch (error) {
            next(error);
        }
    }
    

      async deleteUserByUserId(req, res, next) {
        try {
          Logger.info("delete user by userId controller started");
          const { userId } = req.params;
          if (!validateUUID(userId)) {
            throw new Error("invalid user id");
          }
    
          const response = await this.userService.deleteUserByUserId(userId);
          if (!response)
            throw new NotFoundError("user not found or deletion failed...");
          res.status(HttpStatusCode.Ok).json({ message: `User with id ${userId} has been deleted successfully` });
          
        } catch (error) {
          next(error);
        }
      }
}

const userController = new UserController();
module.exports = userController;