'use strict';

const express = require('express');
const app     = express();
const mongoose = require('mongoose');
const request = require('request');
const levenshtein = require('fast-levenshtein');
const _ = require('underscore');


const leedsList = require('./eventsources/leeds-list');
const theo2 = require('./eventsources/theo2');
const firstdirectarena = require('./eventsources/firstdirectarena');
const visitleeds = require('./eventsources/visitleeds');
const ticketarena = require('./eventsources/ticketarena');
// const skiddle = require('./eventsources/skiddle');

app.get('/leeds-list', leedsList.process);
app.get('/theo2', theo2.process);
app.get('/firstdirectarena', firstdirectarena.process);
app.get('/visitleeds', visitleeds.process);
app.get('/ticketarena', ticketarena.process);
// app.get('/skiddle', skiddle.process);


mongoose.connect('mongodb://localhost:27017');

mongoose.connection.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
});

mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open');
});

const eventModel = require('./models/eventmodel');
app.get('/process', processAll);


const results = [];

function processAll(req, res) {

let newEventsArray = [];

const sourcesArray = ['firstdirectarena', 'leeds-list', 'theo2', 'ticketarena']; // visitleeds
const sourcesCount = sourcesArray.length;
let actualSource = 0;

    for (let i = 0; i < sourcesArray.length; i++) {
        const url = `http://localhost:8081/${sourcesArray[i]}`;
        console.log(`processing ${url}`);

        request(url, (error, response, html) => {
            if (!error) {
                console.log('Source processed succesfully.')
                newEventsArray = newEventsArray.concat(JSON.parse(response.body));
                actualSource++;

                if (actualSource === sourcesCount) {
                    console.log('received data from all sources');
                    // res.json(eventsArray);
                    getDataFromDB(newEventsArray, analyzeEvents);
                    console.log(`New events count: ${newEventsArray.length}`);
                }


            } else if (error) {
                throw error;
            } else {
                console.log('no error but something went bad');
            }

        });
    }
}


function getDataFromDB(newEventsArray, callback) {
        eventModel.find({}, (error, resultsFromMongo) => {
            if (!error) {
                console.log(`Data from Mongo ready to analyse`);
                callback(newEventsArray, resultsFromMongo);
            }
            else {
                throw error;
            }
        })
}

function analyzeEvents(newEventsArray, resultsFromMongo) {

    for (let i = 0; i < newEventsArray.length; i++) {
        console.log(`analysing ${i} event`);
        checkSimilarity(newEventsArray[i], resultsFromMongo);
    }
    
}


function checkSimilarity(event, resultsFromMongo) {

        if (!_.isEmpty(resultsFromMongo)) {
            for (let i = 0; i < resultsFromMongo.length; i++) {
                if (event.title !== undefined && resultsFromMongo[i].title !== undefined) {

                    levenshtein.getAsync(event.title, resultsFromMongo[i].title, (error, distance) => {
                        console.log(distance);
                        // if it's definately a different event, push it
                        if (distance > 5) {
                            addToMongo(event);
                        }

                        if (distance < 3 && distance > 0) {
                            results.push({ firstTitle: event.title, secondTitle: resultsFromMongo[i].title });
                            if (i === resultsFromMongo.length -1) {
                                console.log(results);
                            }
                        }
                    }), {
                        progress: (percentComplete) => {
                            console.log(`${percentComplete}% completed so far...`);
                        }
                    }
                }
            }
        } else {
            addToMongo(event);
        }

}

function addToMongo(event) {

    const newEvent = new eventModel ({
        title: event.title,
        description: event.description,
        // summary: '',
        // thumbnailImage: '',
        image: event.image,
        startDate: event.startDate,
        endDate: event.endDate,
        // price: Number,
        // urls: [String],
        // type: String,
        location: event.location,
        // venue: String,
        // genre: String,
        // tags: [String],
    });

    newEvent.save(function(err) {
        if(err) throw err;

        if (!err) {
            // console.log(`saved ${eventsArray[i].title}`);
        }
    });
}
   
            



app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;




