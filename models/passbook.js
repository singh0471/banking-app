'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class passbook extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      passbook.belongsTo(models.account, {
        foreignKey:"account_number",
        onDelete:"CASCADE",
        hooks:true
      })
    }
  }
  passbook.init({
    accountNumber: DataTypes.UUID,
    anotherAccountNumber: DataTypes.UUID,
    transactionType : DataTypes.STRING,
    amount: DataTypes.INTEGER,
    date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'passbook',
    underscored: true,
    paranoid:true
  });
  return passbook;
};