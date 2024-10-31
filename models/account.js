'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      account.belongsTo(models.user,{
        foreignKey:"userId",
        onDelete:"CASCADE",
        hooks:true
      })

      account.belongsTo(models.bank,{
        foreignKey:"bankId",
        onDelete:"CASCADE",
        hooks:true
      })

      account.hasMany(models.passbook, {
        foreignKey:"account_number",
        onDelete:"CASCADE",
        hooks:true
      })

      
    }
  }
  account.init({
    accountNumber: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,  
  },
    accountBalance: DataTypes.INTEGER,
    userId: DataTypes.UUID,
    bankId: DataTypes.UUID
  }, {
    sequelize,
    modelName: 'account',
    underscored: true,
    paranoid:true
  });
  return account;
};