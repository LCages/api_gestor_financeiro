const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  (process.env.DATABASE || 'financeiro'),
  (process.env.DATABASE_USER || 'root'),
  (process.env.DATABASE_PASS || 'root'), {
  host: (process.env.DATABASE_HOST || 'localhost'),
  dialect: 'mysql'
});

module.exports = sequelize;