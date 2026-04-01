const sequelize = require('./config/database.js');
const Financeiro = require('./models/financeiro.js');

sequelize.sync()
  .then(() => console.log('Tabela criada com sucesso'))
  .catch(err => console.error('Erro:', err));