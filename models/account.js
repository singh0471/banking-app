'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class accounts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      accounts.belongsTo(models.users,{
        foreignKey:"userId",
        onDelete:"CASCADE",
        hooks:true
      })

      accounts.belongsTo(models.banks,{
        foreignKey:"bankId",
        onDelete:"CASCADE",
        hooks:true
      })

      accounts.hasMany(models.passbooks, {
        foreignKey:"account_number",
        onDelete:"CASCADE",
        hooks:true
      })

      
    }
  }
  accounts.init({
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
    modelName: 'accounts',
    underscored: true,
    paranoid:true
  });
  return accounts;
};