'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ledger extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ledger.belongsTo(models.bank, {
        foreignKey:"bankId",
        onDelete:"CASCADE",
        hooks:true
      })

    }
    
  }
  ledger.init({
    bankId: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    bankName:DataTypes.STRING,
    

    anotherBankId: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    anotherBankName: DataTypes.STRING,
    netBalance: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ledger',
    underscored: true,
    paranoid:true,
    
  });
  return ledger;
};