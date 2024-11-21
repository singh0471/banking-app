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
        bankName : "bankName",
        createdAt :"createdAt",
        updatedAt : "updatedAt",
        deletedAt : "deletedAt"
    }

    this.model = db.account
    this.modelName = db.account.name
    this.tableName = db.account.options.tableName
   
    this.columnMapping = {
        accountNumber : this.model.rawAttributes[this.fieldMapping.accountNumber].field,
        accountBalance : this.model.rawAttributes[this.fieldMapping.accountBalance].field,
        userId : this.model.rawAttributes[this.fieldMapping.userId].field,
        bankId : this.model.rawAttributes[this.fieldMapping.bankId].field,
        bankName : this.model.rawAttributes[this.fieldMapping.bankName].field,
        createdAt : this.model.rawAttributes[this.fieldMapping.createdAt].field,
        updatedAt : this.model.rawAttributes[this.fieldMapping.updatedAt].field,
        deletedAt : this.model.rawAttributes[this.fieldMapping.deletedAt].field
    }

    this.association = {
        user : "user",
        bank : "bank",
        passbook : "passbook"
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
        },
        bankName : (val) => {
            return {
                [`${this.columnMapping.bankName}`] : {
                    [Op.like] : `%${val}%`
                }
            }
        }}
    }


}

const accountConfig = new AccountConfig();
module.exports = accountConfig;