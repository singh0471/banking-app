const {Sequelize,Op} = require("sequelize");
const db = require("../../models");
const {validateUUID} = require("../utils/uuid");


class AccountConfig{
    constructor(){

    this.fieldMapping = {
        accountNumber:"accountNumber",
        accountBalance:"accountBalance",
        userId:"userId",
        bankId : "bankId",
        createdAt :"createdAt",
        updatedAt : "updatedAt",
        deletedAt : "deletedAt"
    }

    this.model = db.accounts
    this.modelName = db.accounts.name
    this.tableName = db.accounts.options.tableName
   
    this.columnMapping = {
        accountNumber : this.model.rawAttributes[this.fieldMapping.accountNumber].field,
        accountBalance : this.model.rawAttributes[this.fieldMapping.accountBalance].field,
        userId : this.model.rawAttributes[this.fieldMapping.userId].field,
        bankId : this.model.rawAttributes[this.fieldMapping.bankId].field,
        createdAt : this.model.rawAttributes[this.fieldMapping.createdAt].field,
        updatedAt : this.model.rawAttributes[this.fieldMapping.updatedAt].field,
        deletedAt : this.model.rawAttributes[this.fieldMapping.deletedAt].field
    }

    this.association = {
        users : "users",
        banks : "banks",
        passbooks : "passbooks"
    }

    this.filters = {
        accountNumber : (val) => {
            validateUUID(val);
            return {
                [`${this.columnMapping.accountNumber}`]: {
                    [Op.eq] : val
                }
            }
        },
        accountBalance : (val) => {
            
            return {
                [`${this.columnMapping.accountBalance}`]: {
                    [Op.eq] : val
                }
            }
        },
        userId : (val) => {
            validateUUID(val);
            return {
                [`${this.columnMapping.userId}`]: {
                    [Op.eq] : val
                }
            }
        },
        bankId : (val) => {
            validateUUID(val);
            return {
                [`${this.columnMapping.bankId}`]: {
                    [Op.eq] : val
                }
            }
        }
    }

}
}

const accountConfig = new AccountConfig();
module.exports = accountConfig;