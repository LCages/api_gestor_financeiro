const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('financeiro', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql' // ou postgres, sqlite, etc
});

module.exports = sequelize;