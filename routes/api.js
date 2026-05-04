const express = require('express');
const router = express.Router();
const Lancamentos = require('../models/lancamentos');
const Cartoes = require('../models/cartoes');
const Usuarios = require('../models/usuarios');
const { Op } = require('sequelize');
const auth = require("../middleware/auth");
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

router.post("/register", async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Preencha todos os campos" });
  }

  try {
    const existe = await Usuarios.findOne({ where: { email } });

    if (existe) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = await Usuarios.create({
      nome,
      email,
      senha: senhaHash
    });

    res.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });

  } catch (err) {
    res.status(500).json({ error: "Erro no cadastro" });
  }
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Preencha email e senha" });
  }

  try {
    const usuario = await Usuarios.findOne({ where: { email } });

    if (!usuario) {
      return res.status(400).json({ error: "Usuário não encontrado" });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(400).json({ error: "Senha inválida" });
    }

    const token = jwt.sign(
      { id: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      },
      token
    });

  } catch (err) {
    res.status(500).json({ error: "Erro no login" });
  }
});

router.use(auth);

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
      moeda,
      usuarioId: req.usuarioId
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
      where: { usuarioId: req.usuarioId },
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
      where: { 
        cartoesId: id,
        usuarioId: req.usuarioId
      }
    });

    if (vinculos > 0) {
      return res.status(400).json({
        error: "Não é possível excluir: existem lançamentos nesse cartão"
      });
    }

    const deletado = await Cartoes.destroy({
      where: { 
        id, 
        usuarioId: req.usuarioId 
      }
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

    let where = {
      usuarioId: req.usuarioId
    };

    if (cartoes) {
      where.cartoesId = cartoes;
    }

    // 🔥 intervalo do mês atual
    const hoje = new Date();

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

    // 🔥 BUSCA TODOS (para tabela e saldo total)
    const dados = await Lancamentos.findAll({
      where,
      include: Cartoes,
      order: [['data', 'DESC']]
    });

    // 🔥 BUSCA SOMENTE DO MÊS (para receitas/despesas)
    const dadosMes = await Lancamentos.findAll({
      where: {
        ...where,
        data: {
          [Op.between]: [inicioMes, fimMes]
        }
      }
    });

    let receitas = 0;
    let despesas = 0;

    dadosMes.forEach(item => {
      const valor = Number(item.valor) || 0;

      if (item.status === 'receita') receitas += valor;
      else despesas += valor;
    });

    // 🔥 TOTAL GERAL (continua tudo)
    let totalReceitas = 0;
    let totalDespesas = 0;

    dados.forEach(item => {
      const valor = Number(item.valor) || 0;

      if (item.status === 'receita') totalReceitas += valor;
      else totalDespesas += valor;
    });

    res.json({
      total: dados.length,

      // 🔥 AGORA CORRETO
      receitas,          // só mês atual
      despesas,          // só mês atual

      valor_total: totalReceitas - totalDespesas, // 🔥 total geral

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
      cartoesId,
      usuarioId: req.usuarioId
    });

    res.status(201).json(novo);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 ATUALIZAR LANÇAMENTO
router.put('/lancamentos/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const {
      data,
      categoria,
      descricao,
      valor,
      status,
      cartoesId,
    } = req.body;

    const atualizado = await Lancamentos.update(
      {
        data,
        categoria,
        descricao,
        valor,
        status,
        cartoesId
      },
      { where: { 
        id, 
        usuarioId: req.usuarioId 
      } 
    });

    if (atualizado[0] === 0) {
      return res.status(404).json({ error: "Não encontrado" });
    }

    res.json({ message: "Atualizado com sucesso" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 DELETAR
router.delete('/lancamentos/:id', async (req, res) => {
  try {
    const deletado = await Lancamentos.destroy({
      where: { 
        id: req.params.id,
        usuarioId: req.usuarioId
      }
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
      usuarioId: req.usuarioId,
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

// 📌 ROTA DE CÂMBIO DINÂMICA
router.get('/cambio', async (req, res) => {
  try {
    let { from, to } = req.query;

    // 🔥 padrão se não vier nada
    if (!from || !to) {
      from = 'EUR';
      to = 'BRL';
    }

    const hoje = new Date();
    const passado = new Date();
    passado.setDate(hoje.getDate() - 30);

    const formatar = (d) =>
      new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];

    const url = `https://api.frankfurter.dev/v1/${formatar(passado)}..${formatar(hoje)}?from=${from}&to=${to}`;

    const response = await apiFetch(url);
    const data = await response.json();

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar câmbio" });
  }
});

module.exports = router;