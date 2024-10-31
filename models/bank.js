'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class bank extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      bank.hasMany(models.account,{
        foreignKey:"bankId",
        onDelete:"CASCADE",
        hooks:true
      })

      bank.hasMany(models.ledger,{
        foreignKey:"bankId",
        onDelete:"CASCADE",
         hooks:true
      })
    }
  }
  bank.init({
    name: DataTypes.STRING,
    abbreviation: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'bank',
    underscored: true,
    paranoid:true
  });
  return bank;
};