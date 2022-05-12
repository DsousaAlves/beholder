'use strict';
require('dotenv').config();
const crypto = require('../src/utils/crypto');

module.exports = {
  async up (queryInterface, Sequelize) {
    const settingId = await queryInterface.rawSelect('settings', {where: {}, limit: 1}, ['id']);
    if (!settingId) {
      return await queryInterface.bulkInsert('settings', [{
        email: 'davidsousaalves@gmail.com',
        password: '$2a$12$pRJNLtnJMufrWa01oeYE5uirutvE4ayOCuMXoNnKuu5bl0VlulTTm',
        apiUrl: 'https://testnet.binance.vision/api',
        accessKey: 'ZLiyUVWCWbxVuwuW2NjNUANdiRmqzAuGqHtdPzto0qG0Olcu6IbJjjqS8VMcN2YO',
        secretKey: crypto.encrypt('pcengcDHiPOf7p9KakJbNcyDP8xAWNXQ65BMNunEbllrU5mNIZc2lfk9R51EWIQm'),
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});
    }
  },

  async down (queryInterface, Sequelize) {
     return await queryInterface.bulkDelete('settings', null, {});

  }
};
