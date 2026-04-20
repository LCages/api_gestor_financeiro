const express = require('express');
const router = express.Router();
const Lancamentos = require('../models/lancamentos');
const Cartoes = require('../models/cartoes');
const { Op } = require('sequelize');


// 📌 CRIAR CARTÃO
router.post('/cartoes', async (req, res) => {
  try {
    const { nome, cor, moeda} = req.body;

    if (!nome) {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    const cartoes = await Cartoes.create({
      nome,
      cor,
      moeda
    });

    res.status(201).json(cartoes);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// 📌 LISTAR CARTÕES
router.get('/cartoes', async (req, res) => {
  try {
    const cartoes = await Cartoes.findAll({
      order: [['id', 'ASC']]
    });

    res.json(cartoes);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 DELETAR CARTÃO
router.delete('/cartoes/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // 🔥 impede deletar se tiver lançamentos vinculados
    const vinculos = await Lancamentos.count({
      where: { cartoesId: id }
    });

    if (vinculos > 0) {
      return res.status(400).json({
        error: "Não é possível excluir: existem lançamentos nesse cartão"
      });
    }

    const deletado = await Cartoes.destroy({
      where: { id }
    });

    if (!deletado) {
      return res.status(404).json({ error: "Cartão não encontrado" });
    }

    res.json({ message: "Cartão deletado com sucesso" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 📌 LISTAR lancamentos (COM FILTRO DE CARTÃO 🔥)
router.get('/lancamentos', async (req, res) => {
  try {
    const { cartoes } = req.query;

    let where = {};

    if (cartoes) {
      where.cartoesId = cartoes;
    }

    const dados = await Lancamentos.findAll({
      where,
      include: Cartoes,
      order: [['data', 'DESC']]
    });

    let receitas = 0;
    let despesas = 0;

    dados.forEach(item => {
      const valor = Number(item.valor) || 0;

      if (item.status === 'receita') receitas += valor;
      else despesas += valor;
    });

    res.json({
      total: dados.length,
      receitas,
      despesas,
      valor_total: receitas - despesas,
      dados
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 📌 CRIAR LANÇAMENTO
router.post('/lancamentos', async (req, res) => {
  try {
    const {
      data,
      categoria,
      descricao,
      valor,
      status,
      cartoesId
    } = req.body;

    // 🔥 validação melhor
    if (!descricao || !valor || !status || !cartoesId) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }

    // 🔥 garante data sempre preenchida
    const novaData = data ? data : new Date();

    const novo = await Lancamentos.create({
      data: novaData,
      categoria,
      descricao,
      valor,
      status,
      cartoesId
    });

    res.status(201).json(novo);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 DELETAR
router.delete('/lancamentos/:id', async (req, res) => {
  try {
    const deletado = await Lancamentos.destroy({
      where: { id: req.params.id }
    });

    if (!deletado) {
      return res.status(404).json({ message: 'Não encontrado' });
    }

    res.json({ message: 'Deletado com sucesso' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 📌 BUSCAR (COM CARTÃO 🔥)
router.get('/buscar', async (req, res) => {
  try {
    const busca = req.query.descricao || '';
    const cartoes = req.query.cartoes;

    let where = {
      descricao: {
        [Op.like]: `%${busca}%`
      }
    };

    if (cartoes) {
      where.cartoesId = cartoes;
    }

    const dados = await Lancamentos.findAll({
      where,
      include: Cartoes
    });

    let receitas = 0;
    let despesas = 0;

    dados.forEach(item => {
      const valor = Number(item.valor) || 0;

      if (item.status === 'receita') receitas += valor;
      else despesas += valor;
    });

    res.json({
      total: dados.length,
      receitas,
      despesas,
      valor_total: receitas - despesas,
      dados
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;