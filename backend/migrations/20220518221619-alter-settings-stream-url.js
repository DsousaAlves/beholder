'use strict';
const Sequelize = require('sequelize');

module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.addColumn('settings', 'streamUrl', {
      type: Sequelize.STRING
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('settings', 'streamUrl');
  }
};
