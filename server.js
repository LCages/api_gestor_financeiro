const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  iniciarKeepAlive();
});

// 🔥 KEEP-ALIVE — Ativo das 08h às 23h (horário de Brasília)
function estaNoHorarioAtivo() {
  const agora = new Date();

  // Brasília = UTC-3
  const horaBrasilia = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  const hora = horaBrasilia.getHours();

  // Ativo entre 08:00 e 22:59
  return hora >= 8 && hora < 23;
}

function iniciarKeepAlive() {
  const URL_API = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  const INTERVALO = 2 * 60 * 1000; // 2 minutos

  setInterval(async () => {
    if (!estaNoHorarioAtivo()) {
      console.log(`[keep-alive] fora do horário — pulando ping`);
      return;
    }

    try {
      const res = await fetch(`${URL_API}/ping`);
      const data = await res.json();
      console.log(`[keep-alive] ping ok — ${data.timestamp}`);
    } catch (err) {
      console.error(`[keep-alive] falha:`, err.message);
    }
  }, INTERVALO);

  console.log(`[keep-alive] iniciado — ativo das 08h às 23h (Brasília)`);
}