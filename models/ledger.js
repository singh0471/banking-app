'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ledgers extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ledgers.belongsTo(models.banks, {
        foreignKey:"bankId",
        as :"bank",
        onDelete:"CASCADE",
        hooks:true
      })
    }
  }
  ledgers.init({
    bankId: {
      type: DataTypes.UUID,
      primaryKey: true
    },

    anotherBankId: {
      type: DataTypes.UUID,
      primaryKey: true
    },
    netBalance: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ledgers',
    underscored: true,
    paranoid:true,
    
  });
  return ledgers;
};