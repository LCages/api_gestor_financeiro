const sequelize = require('./config/database');

require('./models/cartoes');
require('./models/lancamentos');

//sequelize.sync({ force: true });

sequelize.sync({ alter: true })
  .then(() => console.log('Banco sincronizado'))
  .catch(err => console.error('Erro:', err));