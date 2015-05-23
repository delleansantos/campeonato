var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken');
var config = require('./config');
var User   = require('./app/models/usuario'); 
var apiRoutes = require('./app/routes/api')(express, app, User, jwt);
var apiSite = require('./app/routes/site')(express);


//CONFIGIRAÇÕES
var port = process.env.PORT || 8080;
mongoose.connect(config.database);
app.set('superSecret', config.secret);

//SETA A VIEW DE TEMPLATE
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

//PEGAR OS PARÂMETROS VIA POST
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//LOGAR OS REQUESTS NO CONSOLE
app.use(morgan('dev'));

/*
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});*/

app.use('/api', apiRoutes);
app.use('/', apiSite);

app.listen(port);
console.log('Server rodando -> http://localhost:' + port);