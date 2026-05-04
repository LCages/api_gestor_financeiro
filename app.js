const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const apiRouter = require('./routes/api');

const app = express();

// 🔥 CORS (React acessar API)
app.use(cors());

// 🔥 middlewares básicos
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// (opcional) arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// 🔥 ROTAS
app.use('/api', apiRouter);

// 🔥 sua conexão com banco (ajusta se necessário)
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 🔐 segredo do token (coloca no .env depois)
const JWT_SECRET = "seu_segredo_super_secreto";


// 🔥 404 JSON (agora API, não HTML)
app.use((req, res, next) => {
  next(createError(404, 'Rota não encontrada'));
});

// 🔥 erro padrão em JSON
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message
  });
});

module.exports = app;