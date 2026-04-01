const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const cors = require('cors');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

const app = express();

app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views')); // 👈 importante
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.set('layout', 'layout');

app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
  try {
    const Financeiro = require('./models/financeiro');

    const dados = await Financeiro.findAll();

    let receitas = 0;
    let despesas = 0;

    dados.forEach(item => {
      if (item.status === 1) receitas += item.valor;
      else despesas += item.valor;
    });

    res.locals.dados = dados; // 🔥 AQUI
    res.locals.valor_total = receitas - despesas;
    res.locals.receitas = receitas;
    res.locals.despesas = despesas;
    res.locals.title = 'Gerenciador de Finanças';

    next();

  } catch (erro) {
    console.error(erro);

    res.locals.dados = [];
    res.locals.valor_total = 0;
    res.locals.receitas = 0;
    res.locals.despesas = 0;
    res.locals.title = 'Gerenciador de Finanças';

    next();
  }
});

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;