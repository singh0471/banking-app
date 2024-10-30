'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accounts', {
      account_number: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      account_balance: {
        type: Sequelize.INTEGER,
        allowNull:false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull:false,
        references : {
          model: "users",
          key:"id",
        },
        onDelete:"CASCADE"
      },
      bank_id: {
        type: Sequelize.UUID,
        allowNull:false,
        references : {
          model:"banks",
          key:"id"
        },
        onDelete:"CASCADE"
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
    await queryInterface.dropTable('accounts');
  }
};