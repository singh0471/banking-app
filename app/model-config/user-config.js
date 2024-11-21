const {Sequelize,Op} = require("sequelize");
const db = require("../../models");
const {validateUUID} = require("../utils/uuid");

class UserConfig{
    constructor(){

    this.fieldMapping = {
        id:"id",
        username:"username",
        email:"email",
        password:"password",
        firstName:"firstName",
        lastName:"lastName",
        dateOfBirth:"dateOfBirth",
        totalBalance : "totalBalance",
        isAdmin : "isAdmin",
        createdAt :"createdAt",
        updatedAt : "updatedAt",
        deletedAt : "deletedAt"
    }

    this.model = db.user
    this.modelName = db.user.name
    this.tableName = db.user.options.tableName

    this.columnMapping = {
        id : this.model.rawAttributes[this.fieldMapping.id].field,
        username : this.model.rawAttributes[this.fieldMapping.username].field,
        email : this.model.rawAttributes[this.fieldMapping.email].field,
        password : this.model.rawAttributes[this.fieldMapping.password].field,
        firstName : this.model.rawAttributes[this.fieldMapping.firstName].field,
        lastName : this.model.rawAttributes[this.fieldMapping.lastName].field,
        dateOfBirth : this.model.rawAttributes[this.fieldMapping.dateOfBirth].field,
        totalBalance : this.model.rawAttributes[this.fieldMapping.totalBalance].field,
        isAdmin : this.model.rawAttributes[this.fieldMapping.isAdmin].field,
        createdAt : this.model.rawAttributes[this.fieldMapping.createdAt].field,
        updatedAt : this.model.rawAttributes[this.fieldMapping.updatedAt].field,
        deletedAt : this.model.rawAttributes[this.fieldMapping.deletedAt].field
    }

    this.association = {
        accounts : "accounts",
        kyc:"kyc"
    }

    this.filters = {
        id : (val) => {
            validateUUID(val);
            return {
                [`${this.columnMapping.id}`]: {
                    [Op.eq] : val
                }
            }
        },
        username : (val) => {
            return {
                [`${this.columnMapping.username}`] : {
                    [Op.like] : `%${val}%`
                }
            }
        },
        email : (val) => {
            return {
                [`${this.columnMapping.email}`] : {
                    [Op.like] : `%${val}%`
                }
            }
        },
        firstName : (val) => {
            return {
                [`${this.columnMapping.firstName}`] : {
                    [Op.like] : `%${val}%`
                }
            }
        },
        lastName : (val) => {
            return {
                [`${this.columnMapping.lastName}`] : {
                    [Op.like] : `%${val}%`
                }
            }
        },
        totalBalance : (val) => {
            return {
                [`${this.columnMapping.totalBalance}`] : {
                    [Op.eq] : val
                }
            }
        },
        isAdmin : (val) => {
            return {
                [`${this.columnMapping.isAdmin}`] : {
                    [Op.eq] : val
                }
            }
        },

        dateOfBirthGreaterThan: (val) => {
            return {
                [`${this.columnMapping.dateOfBirth}`]: {
                    [Op.gt]: val, 
                },
            };
        },
        dateOfBirthLessThan: (val) => {
            return {
                [`${this.columnMapping.dateOfBirth}`]: {
                    [Op.lt]: val, 
                },
            };
        }
    }

}
}

const userConfig = new UserConfig();
module.exports = userConfig;