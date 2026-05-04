const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuarios = require('./usuarios');

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
    defaultValue: 'BRL'
  },
  usuarioId: {
  type: DataTypes.INTEGER,
  allowNull: false
}
});

///relação
Usuarios.hasMany(Cartoes, { foreignKey: 'usuarioId' });
Cartoes.belongsTo(Usuarios, { foreignKey: 'usuarioId' });

module.exports = Cartoes;