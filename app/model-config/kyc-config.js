const {Sequelize,Op} = require("sequelize");
const db = require("../../models");
const {validateUUID} = require("../utils/uuid");

class KycConfig{
    constructor(){

    this.fieldMapping = {
        id:"id",
        userId:"userId",
        document:"document",
        status:"status",
        adminNote:"adminNote",
        createdAt :"createdAt",
        updatedAt : "updatedAt",
        deletedAt : "deletedAt"
    }

    this.model = db.kyc
    this.modelName = db.kyc.name
    this.tableName = db.kyc.options.tableName
    
    this.columnMapping = {
        id : this.model.rawAttributes[this.fieldMapping.id].field,
        userId : this.model.rawAttributes[this.fieldMapping.userId].field,
        document : this.model.rawAttributes[this.fieldMapping.document].field,
        status : this.model.rawAttributes[this.fieldMapping.status].field,
        adminNote : this.model.rawAttributes[this.fieldMapping.adminNote].field,
        createdAt : this.model.rawAttributes[this.fieldMapping.createdAt].field,
        updatedAt : this.model.rawAttributes[this.fieldMapping.updatedAt].field,
        deletedAt : this.model.rawAttributes[this.fieldMapping.deletedAt].field
    }

    this.association = {
        user : "user"
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
        userId : (val) => {
            validateUUID(val);
            return {
                [`${this.columnMapping.userId}`]: {
                    [Op.eq] : val
                }
            }
        },
        document : (val) => {
            return {
                [`${this.columnMapping.document}`] : {
                    [Op.like] : `%${val}%`
                }
            }
        },
        status : (val) => {
            return {
                [`${this.columnMapping.status}`] : {
                    [Op.like] : `%${val}%`
                }
            }
        },
        adminNote : (val) => {
            return {
                [`${this.columnMapping.adminNote}`] : {
                    [Op.like] : `%${val}%`
                }
            }
        }
    }

}
}

const kycConfig = new KycConfig();
module.exports = kycConfig;