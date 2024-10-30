'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class passbooks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      passbooks.belongsTo(models.accounts, {
        foreignKey:"account_number",
        onDelete:"CASCADE",
        hooks:true
      })
    }
  }
  passbooks.init({
    accountNumber: DataTypes.UUID,
    anotherAccountNumber: DataTypes.UUID,
    transactionType : DataTypes.STRING,
    amount: DataTypes.INTEGER,
    date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'passbooks',
    underscored: true,
    paranoid:true
  });
  return passbooks;
};