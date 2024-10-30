'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class banks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      banks.hasMany(models.accounts,{
        foreignKey:"bankId",
        as : "account",
        onDelete:"CASCADE",
        hooks:true
      })

      banks.hasMany(models.ledgers,{
        foreignKey:"bankId",
        as : "ledger",
        onDelete:"CASCADE",
         hooks:true
      })
    }
  }
  banks.init({
    name: DataTypes.STRING,
    abbreviation: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'banks',
    underscored: true,
    paranoid:true
  });
  return banks;
};