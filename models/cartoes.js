const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cartoes = sequelize.define('Cartoes', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cor: {
    type: DataTypes.STRING,
    allowNull: false
  },
  moeda: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'R$'
  }
});

module.exports = Cartoes;