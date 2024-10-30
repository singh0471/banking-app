const {Sequelize,Op} = require("sequelize");
const db = require("../../models");
const {validateUUID} = require("../utils/uuid");

class BankConfig{
    constructor(){

    this.fieldMapping = {
        id:"id",
        name:"name",
        abbreviation:"abbreviation",
        createdAt :"createdAt",
        updatedAt : "updatedAt",
        deletedAt : "deletedAt"
    }

    this.model = db.banks
    this.modelName = db.banks.name
    this.tableName = db.banks.options.tableName

    this.columnMapping = {
        id : this.model.rawAttributes[this.fieldMapping.id].field,
        name : this.model.rawAttributes[this.fieldMapping.name].field,
        abbreviation : this.model.rawAttributes[this.fieldMapping.abbreviation].field,
        createdAt : this.model.rawAttributes[this.fieldMapping.createdAt].field,
        updatedAt : this.model.rawAttributes[this.fieldMapping.updatedAt].field,
        deletedAt : this.model.rawAttributes[this.fieldMapping.deletedAt].field
    }

    this.association = {
        accounts : "accounts",
        ledgers : "ledgers"
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
        name : (val) => {
            return {
                [`${this.columnMapping.name}`] : {
                    [Op.like] : `%${val}%`
                }
            }
        },
        abbreviation : (val) => {
            return {
                [`${this.columnMapping.abbreviation}`] : {
                    [Op.like] : `%${val}%`
                }
            }
        }
    }

}
}

const bankConfig = new BankConfig();
module.exports = bankConfig;