  const { DataTypes } = require('sequelize');
  const sequelize = require('../config/database');
  const Cartoes = require('./cartoes');
  const Usuarios = require('./usuarios');

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
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('receita', 'despesa'),
      allowNull: false
    },
    usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

// RELAÇÃO
Cartoes.hasMany(Lancamentos, { foreignKey: 'cartoesId' });
Lancamentos.belongsTo(Cartoes, { foreignKey: 'cartoesId' });
Usuarios.hasMany(Lancamentos, { foreignKey: 'usuarioId' });
Lancamentos.belongsTo(Usuarios, { foreignKey: 'usuarioId' });

module.exports = Lancamentos;