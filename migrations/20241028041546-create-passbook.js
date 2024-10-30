'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('passbooks', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      account_number: {
        type: Sequelize.UUID,
        allowNull:false,
        references : {
          model:"accounts",
          key:"account_number"
        },
        onDelete:"CASCADE"
      },
      another_account_number: {
        type: Sequelize.UUID,
        allowNull:true
      },
      transaction_type:{
        type:Sequelize.STRING,
        allowNull:false
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      date: {
        type: Sequelize.DATE,
        allowNull:false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('passbooks');
  }
};