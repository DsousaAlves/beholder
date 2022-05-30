'use strict';
const { monitorType } = require('../src/repositories/monitorsRepository');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const seedSymbol = '*';
    const symbol = await queryInterface.rawSelect('monitors', { where: {symbol: seedSymbol} }, ['symbol']);
    if (!symbol) {
      return queryInterface.bulkInsert('monitors', [
        {
          type: monitorType.MINI_TICKER,
          broadcastLabel: 'miniTicker',
          symbol: '*',
          interval: null,
          isActive: true,
          isSystemMon: true,
          indexes: null,
          logs: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          type: monitorType.BOOK,
          broadcastLabel: 'book',
          symbol: '*',
          interval: null,
          isActive: true,
          isSystemMon: true,
          indexes: null,
          logs: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          type: monitorType.USER_DATA,
          broadcastLabel: 'balance,execution',
          symbol: '*',
          interval: null,
          isActive: true,
          isSystemMon: true,
          indexes: null,
          logs: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          type: monitorType.CANDLES,
          broadcastLabel: null,
          symbol: 'BTCUSDT',
          interval: '1m',
          isActive: true,
          isSystemMon: false,
          indexes: 'RSI,MACD',
          logs: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
    ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('monitors', null, {});
  }
};
