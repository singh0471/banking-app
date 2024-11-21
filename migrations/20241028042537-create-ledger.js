'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ledgers', {
      bank_id: {
        type: Sequelize.UUID,
        allowNull:false,
        primaryKey:true,
        references : {
          model:"banks",
          key:"id"
        },
        onDelete:"CASCADE"
      },
      bank_name : {
        type:Sequelize.STRING,
        allowNull:false
      },
      another_bank_id: {
        type: Sequelize.UUID,
        allowNull:false,
        primaryKey:true
      },
      another_bank_name : {
        type:Sequelize.STRING,
        allowNull:false
      },
      net_balance: {
        type: Sequelize.INTEGER,
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
      deleted_at:{
        allowNull:true,
        type:Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ledgers');
  }
};