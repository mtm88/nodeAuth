'use strict';

var express = require('express');
var app     = express();

const leedsList = require('./eventsources/leeds-list');
const theo2 = require('./eventsources/theo2');
const firstdirectarena = require('./eventsources/firstdirectarena');
const visitleeds = require('./eventsources/visitleeds');
const ticketarena = require('./eventsources/ticketarena');

app.get('/leeds-list', leedsList.process);
app.get('/theo2', theo2.process);
app.get('/firstdirectarena', firstdirectarena.process);
app.get('/visitleeds', visitleeds.process);
app.get('/ticketarena', ticketarena.process);



app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;