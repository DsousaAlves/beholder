'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('monitors', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      symbol: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: '*'
      },
      type: {
          type: Sequelize.STRING,
          allowNull: false
      },
      broadcastLabel: Sequelize.STRING,
      interval: Sequelize.STRING,
      indexes: Sequelize.STRING,
      isActive: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
      },
      isSystemMon: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
      },
      logs: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    await queryInterface.addIndex('monitors', ['type', 'interval', 'symbol'], {
      name: 'monitors_type_interval_symbol_index',
      unique: true
    })

    await queryInterface.addIndex('monitors', ['symbol'], { name: 'monitors_symbol_index' });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('monitors', 'monitors_symbol_index');
    await queryInterface.removeIndex('monitors', 'monitors_type_interval_symbol_index');
    await queryInterface.dropTable('monitors');
  }
};
