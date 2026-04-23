const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cartoes = require('./cartoes');

const Lancamentos = sequelize.define('Lancamentos', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  data: {
    type: DataTypes.DATE,
    allowNull: false
  },
  categoria: {
    type: DataTypes.ENUM(
      'Moradia',
      'Mercado',
      'Restaurante',
      'Transporte',
      'Saúde',
      'Assinaturas',
      'Compras',
      'Passeio',
      'Salário',
      'Outros'
    ),
    allowNull: false
  },
  descricao: {
    type: DataTypes.STRING,
    allowNull: false
  },
  valor: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('receita', 'despesa'),
    allowNull: false
  }
});

// RELAÇÃO
Cartoes.hasMany(Lancamentos, { foreignKey: 'cartoesId' });
Lancamentos.belongsTo(Cartoes, { foreignKey: 'cartoesId' });

module.exports = Lancamentos;