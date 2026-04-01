const { DataTypes } = require('sequelize');
const sequelize = require('../config/database.js'); // ajuste o caminho se necessário

const Financeiro = sequelize.define('Financeiro', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  tipo: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  valor: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'financeiro',
  timestamps: false // muda pra true se quiser createdAt e updatedAt
});

module.exports = Financeiro;