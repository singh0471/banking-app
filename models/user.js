'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      users.hasMany(models.accounts,{
        foreignKey:"userId",
        onDelete:"CASCADE",
        hooks:true
      })
    }
  }
  users.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    isAdmin : DataTypes.BOOLEAN,
    totalBalance: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'users',
    underscored: true,
    paranoid:true
  });
  return users;
};