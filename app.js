'use strict';

var express = require('express');
var app     = express();

const leedsList = require('./eventsources/leeds-list');
const theo2 = require('./eventsources/theo2');
const firstdirectarena = require('./eventsources/firstdirectarena');

app.get('/leeds-list', leedsList.process);
app.get('/theo2', theo2.process);
app.get('/firstdirectarena', firstdirectarena.process);

app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;