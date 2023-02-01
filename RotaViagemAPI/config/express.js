var express = require('express')
    ,app = express()
    ,rotaRoutes = require('../app/routes')
    ,bodyParser = require('body-parser')
    ,cors = require('cors');

app.use(cors())

app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

rotaRoutes(app);

module.exports = app;