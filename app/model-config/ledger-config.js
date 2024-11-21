const {Sequelize,Op} = require("sequelize");
const db = require("../../models");
const {validateUUID} = require("../utils/uuid");

class LedgerConfig{
    constructor(){

    this.fieldMapping = {
        bankId:"bankId",
        bankName:"bankName",
        anotherBankId:"anotherBankId",
        anotherBankName : "anotherBankName",
        netBalance:"netBalance",
        createdAt :"createdAt",
        updatedAt : "updatedAt",
        deletedAt : "deletedAt"
    }

    this.model = db.ledger
    this.modelName = db.ledger.name
    this.tableName = db.ledger.options.tableName
    
    this.columnMapping = {
        bankId : this.model.rawAttributes[this.fieldMapping.bankId].field,
        bankName : this.model.rawAttributes[this.fieldMapping.bankName].field,
        anotherBankId : this.model.rawAttributes[this.fieldMapping.anotherBankId].field,
        anotherBankName : this.model.rawAttributes[this.fieldMapping.anotherBankName].field,
        netBalance : this.model.rawAttributes[this.fieldMapping.netBalance].field,
        createdAt : this.model.rawAttributes[this.fieldMapping.createdAt].field,
        updatedAt : this.model.rawAttributes[this.fieldMapping.updatedAt].field,
        deletedAt : this.model.rawAttributes[this.fieldMapping.deletedAt].field
    }

    this.association = {
        bank : "bank"
    }

    this.filters = {
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
        },
        anotherBankId : (val) => {
            validateUUID(val);
            return {
                [`${this.columnMapping.anotherBankId}`]: {
                    [Op.eq] : val
                }
            }
        },
        anotherBankName : (val) => {
            return {
                [`${this.columnMapping.anotherBankName}`] : {
                    [Op.like] : `%${val}%`
                }
            }
        },
        netBalance : (val) => {
            
            return {
                [`${this.columnMapping.netBalance}`]: {
                    [Op.eq] : val
                }
            }
        }
    }

}
}

const ledgerConfig = new LedgerConfig();
module.exports = ledgerConfig;