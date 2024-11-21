const NotFoundError = require("../errors/notFoundError");
const {checkJwtHS256} = require("../middleware/authService");

const {
  Payload,
  verifyAdmin,
  verifyUser,
  verifyUserID,
} = require("../middleware/authentication");
const Logger = require("../utils/logger"); 

class RouteConfig {
  constructor() {}

  loadRouteConfig() {
    let config;

    try {
      config = require("./route.config.json");
      if (!config.routes) {
        throw new NotFoundError("routes not defined");
      }
    } catch (error) {
      throw new NotFoundError(`Unable to parse "app/configs/route.config.json": ${error}`);
    }
    return config;
  }

  loadController(routeItem) {
    if (!routeItem || !routeItem.controller) {
      throw new NotFoundError(
        'Undefined "controller" property in "app/configs/route.config.json"'
      );
    }

    try {
      
      const controller = require(routeItem.controller);
      
      
      
      
      Logger.info("controller>>>>>", controller);
      return controller;
    } catch (error) {
      throw new NotFoundError(`Unable to load ${routeItem.controller}: ${error}`);
    }
  }

  getRoute(routeItem) {
    if (!routeItem || !routeItem.route || routeItem.route.length === 0) {
      throw new NotFoundError(
        'Undefined or empty "route" property in "app/configs/route.config.json"'
      );
    }
    return routeItem.route;
  }

  getMethod(routeItem) {
    if (!routeItem || !routeItem.method || routeItem.method.length === 0) {
      throw new NotFoundError(
        'Undefined or empty "method" property in "app/configs/route.config.json"'
      );
    }

    const method = routeItem.method.toLowerCase();

    switch (method) {
      case "get":
      case "put":
      case "post":
      case "delete":
      case "patch":
        return method;
      default:
        throw new NotFoundError(
          `Invalid REST "method" property in "app/configs/route.config.json": ${method}`
        );
    }
  }

  getAction(routeItem) {
    if (!routeItem || !routeItem.action || routeItem.action.length === 0) {
      return this.getMethod(routeItem);
    }
    return routeItem.action;
  }

  getSecured(routeItem) {
    return !!(routeItem?.secured ?? true);
  }

  getIsAdmin(routeItem) {
    return routeItem.isAdmin;
  }

  getIsUser(routeItem) {
    return routeItem.isUser;
  }

  getVerifyUserId(routeItem) {
    return routeItem.verifyUserId;
  }

  registerRoute(
    application,
    controller,
    route,
    method,
    action,
    secured,
    isUser,
    isAdmin,
    verifyUserId
  ) {
    const routeHandler = (req, res, next) => {
      controller[action](req, res, next);
    };

    if (secured) {
      application.route(route)[method]((req, res, next) => {
        checkJwtHS256(req, res, next);
      });
    }

   

    if (isAdmin) {
      application.route(route)[method]((req, res, next) => {
        verifyAdmin(req, res, next);
      });
    }

    if (isUser) {
      application.route(route)[method]((req, res, next) => {
        verifyUser(req, res, next);
      });
    }

    if (verifyUserId) {
      application.route(route)[method]((req, res, next) => {
        verifyUserID(req, res, next);
      });
    }

    application.route(route)[method](routeHandler);
    
    
  }

  createConfigRoute(application, settingsConfig) {
    application.route("/config").get((req, res) => {
      res.status(200).json(settingsConfig.settings);
    });
  }

  registerRoutes(application) {
    const config = this.loadRouteConfig();
    
    
    for (let i = 0; i < config.routes.length; i++) {
      const routeItem = config.routes[i];
      
      const controller = this.loadController(routeItem);
      const route = this.getRoute(routeItem);
      const method = this.getMethod(routeItem);
      const action = this.getAction(routeItem);
      const secured = this.getSecured(routeItem);
      const isUser = this.getIsUser(routeItem);
      const isAdmin = this.getIsAdmin(routeItem);
      const verifyUserId = this.getVerifyUserId(routeItem);

      this.registerRoute(
        application,
        controller,
        route,
        method,
        action,
        secured,
        isUser,
        isAdmin,
        verifyUserId
      );
    }
  }
}

const routeConfig = new RouteConfig();
module.exports = routeConfig;
