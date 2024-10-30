const express = require("express");
const application = express();
const dotenv = require("dotenv");
dotenv.config();
const { StatusCodes } = require('http-status-codes');
const PORT = process.env.PORT;
const cors = require("cors");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const routeConfig = require("./app/config/route-config");
const NotFoundError = require("./app/errors/notFoundError");
function configureApplication(app){
    app.use(cors());
    app.use((req,res,next)=> {
        res.set("Access-Control-Allow-Origin","*");
        res.set("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
        next();
    })
    app.use(cookieParser());
    app.use(express.json());
}

function configureRoutes(app){
    routeConfig.registerRoutes(app);
}

function configureErrorHandler(app) {
    function configureErrorHandler(app) {
      
        app.use((req, res, next) => {
            const error = new NotFoundError("API Not Found");
            error.statusCode = StatusCodes.NOT_FOUND;
            next(error);
        });
    
        
        app.use((err, req, res, next) => {
            console.log('Error for Request');
            console.log(`Requested API: ${req.url}`);
            console.log(`Method: ${req.method}`);
            console.log(`Request Authorization header: ${req.get('Authorization')}`);
            console.log('Error stack');
            console.log(err);
    
            
            const errorStatusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
            
             
            const errorJson = {
                message: err.message,
                stack: err.stack  
            };
            
            res.status(errorStatusCode).json(errorJson);
        });
    }
    
    
  }

  function startServer(app) {
    app.listen(PORT, ()=>{
     console.log(`started at ${PORT}`)
    })
   }
   function configureWorker(app) {
     configureApplication(app);
     configureRoutes(app);
     configureErrorHandler(app);
     startServer(app);
   }
   
   configureWorker(application);




