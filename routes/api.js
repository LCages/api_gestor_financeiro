const express = require('express');
const router = express.Router();
const Financeiro = require('../models/financeiro.js');
const { Op } = require('sequelize');


// 📌 GET - listar todos
router.get('/financeiro', async (req, res) => {
  try {
    const dados = await Financeiro.findAll();

    let receitas = 0;
    let despesas = 0;

    dados.forEach(item => {
      if (item.status === 1) receitas += item.valor;
      else despesas += item.valor;
    });

    const valor_total = receitas - despesas;

    res.status(200).json({
      success: true,
      total: dados.length,
      receitas,
      despesas,
      valor_total,
      dados
    });

  } catch (erro) {
    res.status(500).json({
      success: false,
      error: erro.message
    });
  }
});


// 📌 POST - criar lançamento
router.post('/financeiro', async (req, res) => {
  try {
    const { tipo, valor, status } = req.body;

    const novo = await Financeiro.create({
      tipo,
      valor,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Lançamento criado',
      data: novo
    });

  } catch (erro) {
    res.status(400).json({
      success: false,
      error: erro.message
    });
  }
});


// 📌 DELETE - excluir
router.delete('/financeiro/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const deletado = await Financeiro.destroy({
      where: { id }
    });

    if (!deletado) {
      return res.status(404).json({
        success: false,
        message: 'Registro não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Registro deletado com sucesso'
    });

  } catch (erro) {
    res.status(500).json({
      success: false,
      error: erro.message
    });
  }
});


// 📌 GET - buscar
router.get('/buscar', async (req, res) => {
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
      if (item.status === 1) receitas += item.valor;
      else despesas += item.valor;
    });

    const valor_total = receitas - despesas;

    res.status(200).json({
      success: true,
      busca,
      total: dados.length,
      receitas,
      despesas,
      valor_total,
      dados
    });

  } catch (erro) {
    res.status(500).json({
      success: false,
      error: erro.message
    });
  }
});

module.exports = router;