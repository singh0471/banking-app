const jwt = require("jsonwebtoken");
const Logger = require("../utils/logger");
const InvalidError = require("../errors/invalidError");
const NotFoundError = require("../errors/notFoundError");
const UnauthorizedError = require("../errors/unauthorizedError");
const dotenv = require("dotenv");
dotenv.config();
const secretKey = process.env.SECRET_KEY;

class Payload{
    constructor(userId,isAdmin){
        this.userId=userId;
        this.isAdmin = isAdmin;
    }

    static newPayload(userId,isAdmin){
        try{
        return new Payload(userId,isAdmin);
        }
        catch(error){
            Logger.error(error);
        }
    }

    signPayload(){
        try{
            return `Bearer ${jwt.sign({userId:this.userId,isAdmin:this.isAdmin},secretKey,{expiresIn:"10hr"})}`;
        }
        catch(error){
            Logger.error(error);
        }
    }

    static verifyToken(token){
        try{
            const payload = jwt.verify(token,secretKey);
            return payload;
        }
        catch(error){
            Logger.error(error);
        }
    }


}

const verifyAdmin = (req,res,next) => {
    try{
        Logger.info("verifying admin");
        console.log(req.headers['auth'])
        if(!req.cookies["auth"] && !req.headers["auth"])
            throw new NotFoundError("cookie not found");

        const token = req.headers["auth"].split(" ")[1]; // here i have changed from 2 to 1.
        
        
        const payload = Payload.verifyToken(token);
       
        if(!payload.isAdmin)
            throw new UnauthorizedError("Admin verification failed");

        Logger.info("Admin verified");
        next();
    }
    catch(error){
        next(error);
    }
}

const verifyUser = (req,res,next) => {
    try{
        Logger.info("verifying user");

        if(!req.cookies["auth"] && !req.headers["auth"])
            throw new NotFoundError("cookie not found");

        const token = req.headers["auth"].split(" ")[1];  

        const payload = Payload.verifyToken(token);
        req.user = payload.userId;
        if(payload.isAdmin)
            throw new UnauthorizedError("user verification failed");

        Logger.info("user verified");
        next();
    }
    catch(error){
        next(error);
    }
}

const verifyUserID = (req,res,next) => {
    try{
        
        const {userId} = req.params;
        const user = req.user;
        if(userId != user)
            throw new UnauthorizedError("you cannot access someone elses accounts.");
        
        next();
    }
    catch(error){
        next(error);
    }
}


module.exports = {Payload,verifyAdmin,verifyUser,verifyUserID};
