const express = require('express');
const router = express.Router();
const Financeiro = require('../models/financeiro.js');

router.get('/', async function(req, res, next) {
  try {
    const dados = await Financeiro.findAll();

    let receitas = 0;
    let despesas = 0;

    dados.forEach(item => {
      if (item.status === 1) {
        receitas += item.valor;
      } else {
        despesas += item.valor;
      }
    });

    const valor_total = receitas - despesas;

    res.render('index', {
      title: 'Gerenciador de Finanças',
      dados,
      receitas,
      despesas,
      valor_total,
      busca: ''
    });

  } catch (erro) {
    console.error(erro);
    res.send('Erro ao carregar dados');
  }
});

router.get('/deletar/:id', async function(req, res, next) {
  try {
    const id = req.params.id;

    await Financeiro.destroy({
      where: { id: id }
    });

    res.redirect('/'); // volta para a página principal

  } catch (erro) {
    console.error(erro);
    res.send('Erro ao excluir registro');
  }
});

router.get('/adicionar', function(req, res, next) {
  res.render('adicionar', { title: 'Adicionar lançamento' });
});

router.post('/cadastrar', async function(req, res, next) {
  try {
    const { tipo, valor, status } = req.body;

    await Financeiro.create({
      tipo: tipo,
      valor: valor,
      status: status
    });

    res.redirect('/'); // volta pra home

  } catch (erro) {
    console.error(erro);
    res.send('Erro ao cadastrar');
  }
});

const { Op } = require('sequelize');

router.get('/buscar', async function(req, res, next) {
  try {
    const busca = req.query.tipo || '';

    const dados = await Financeiro.findAll({
      where: {
        tipo: {
          [Op.like]: `%${busca}%`
        }
      }
    });

    let receitas = 0;
    let despesas = 0;

    dados.forEach(item => {
      if (item.status === 1) {
        receitas += item.valor;
      } else {
        despesas += item.valor;
      }
    });

    const valor_total = receitas - despesas;

    res.render('index', {
      title: 'Resultado da busca',
      dados,
      receitas,
      despesas,
      valor_total,
      busca
    });

  } catch (erro) {
    console.error(erro);
    res.send('Erro ao buscar');
  }
});

module.exports = router;