const sequelize = require('./config/database');

async function test() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao banco com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar:', error);
  }
}

test();