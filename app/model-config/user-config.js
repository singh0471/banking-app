const {Sequelize,Op} = require("sequelize");
const db = require("../../models");
const {validateUUID} = require("../utils/uuid");

class UserConfig{
    constructor(){

    this.fieldMapping = {
        id:"id",
        username:"username",
        password:"password",
        firstName:"firstName",
        lastName:"lastName",
        totalBalance : "totalBalance",
        isAdmin : "isAdmin",
        createdAt :"createdAt",
        updatedAt : "updatedAt",
        deletedAt : "deletedAt"
    }

    this.model = db.users
    this.modelName = db.users.name
    this.tableName = db.users.options.tableName

    this.columnMapping = {
        id : this.model.rawAttributes[this.fieldMapping.id].field,
        username : this.model.rawAttributes[this.fieldMapping.username].field,
        password : this.model.rawAttributes[this.fieldMapping.password].field,
        firstName : this.model.rawAttributes[this.fieldMapping.firstName].field,
        lastName : this.model.rawAttributes[this.fieldMapping.lastName].field,
        totalBalance : this.model.rawAttributes[this.fieldMapping.totalBalance].field,
        isAdmin : this.model.rawAttributes[this.fieldMapping.isAdmin].field,
        createdAt : this.model.rawAttributes[this.fieldMapping.createdAt].field,
        updatedAt : this.model.rawAttributes[this.fieldMapping.updatedAt].field,
        deletedAt : this.model.rawAttributes[this.fieldMapping.deletedAt].field
    }

    this.association = {
        accounts : "accounts"
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
        }
    }

}
}

const userConfig = new UserConfig();
module.exports = userConfig;