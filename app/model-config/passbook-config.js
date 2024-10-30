const {Sequelize,Op} = require("sequelize");
const db = require("../../models");
const {validateUUID} = require("../utils/uuid");


class PassbookConfig{
    constructor(){

    this.fieldMapping = {
        id:"id",
        accountNumber:"accountNumber",
        anotherAccountNumber:"anotherAccountNumber",
        transactionType:"transactionType",
        amount : "amount",
        date: "date",
        createdAt :"createdAt",
        updatedAt : "updatedAt",
        deletedAt : "deletedAt"
    }
    
    this.model = db.passbooks
    this.modelName = db.passbooks.name
    this.tableName = db.passbooks.options.tableName
    
    this.columnMapping = {
        id:this.model.rawAttributes[this.fieldMapping.id].field,
        accountNumber : this.model.rawAttributes[this.fieldMapping.accountNumber].field,
        anotherAccountNumber : this.model.rawAttributes[this.fieldMapping.anotherAccountNumber].field,
        transactionType : this.model.rawAttributes[this.fieldMapping.transactionType].field,
        amount : this.model.rawAttributes[this.fieldMapping.amount].field,
        date : this.model.rawAttributes[this.fieldMapping.date].field,
        createdAt : this.model.rawAttributes[this.fieldMapping.createdAt].field,
        updatedAt : this.model.rawAttributes[this.fieldMapping.updatedAt].field,
        deletedAt : this.model.rawAttributes[this.fieldMapping.deletedAt].field
    }

    this.association = {
        account : "account"
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
        anotherAccountNumber : (val) => {
            validateUUID(val);
            return {
                [`${this.columnMapping.anotherAccountNumber}`]: {
                    [Op.eq] : val
                }
            }
        },
        transactionType : (val) => {
            
            return {
                [`${this.columnMapping.transactionType}`]: {
                    [Op.like] : `%${val}%`
                }
            }
        },
        amount : (val) => {
            return {
                [`${this.columnMapping.amount}`] : {
                    [Op.eq] : val
                }
            }
        },
        date : (val) => {
            return {
                [`${this.columnMapping.date}`] : {
                    [Op.eq] :val
                }
            }
        }
    }

}
}

const passbookConfig = new PassbookConfig();
module.exports = passbookConfig;