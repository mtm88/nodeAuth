'use strict';

const express = require('express');
const app     = express();
const mongoose = require('mongoose');
const textSearch = require('mongoose-text-search');
const request = require('request');
const levenshtein = require('fast-levenshtein');
const _ = require('underscore');

// EVENTS
const leedsList = require('./eventsources/leeds-list');
const theo2 = require('./eventsources/theo2');
const firstdirectarena = require('./eventsources/firstdirectarena');
const visitleeds = require('./eventsources/visitleeds');
const ticketarena = require('./eventsources/ticketarena');
const eventbrite = require('./eventsources/eventbrite');
const leedsinspired = require('./eventsources/leedsinspired');
const skiddle = require('./eventsources/skiddle');

// SPORTS
const lufc = require('./eventsources/lufc');
const yorkshirecricket = require('./eventsources/yorkshirecricket');
const yorkshirecarnegie = require('./eventsources/yorkshirecarnegie');
const rabbithole = require('./eventsources/rabbithole');

app.get('/leeds-list', leedsList.process);
app.get('/theo2', theo2.process);
app.get('/firstdirectarena', firstdirectarena.process);
app.get('/visitleeds', visitleeds.process);
app.get('/ticketarena', ticketarena.process);
app.get('/eventbrite', eventbrite.process);
app.get('/lufc', lufc.process);
app.get('/yorkshirecricket', yorkshirecricket.process);
app.get('/leedsinspired', leedsinspired.process);
app.get('/skiddle', skiddle.process);
app.get('/yorkshirecarnegie', yorkshirecarnegie.process);
app.get('/rabbithole', rabbithole.process);


mongoose.connect('mongodb://localhost:27017');

mongoose.connection.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
});

mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open');
});

const eventModel = require('./models/eventmodel');
app.get('/process', processAll);


function processAll(req, res) {

let newEventsArray = [];

const sourcesArray = [
    'firstdirectarena',
    'theo2',
    'ticketarena',
    // 'eventbrite',
    'visitleeds', 
    'yorkshirecricket',
    'leedsinspired',
    'skiddle',
    'yorkshirecarnegie',
    ];
const sourcesCount = sourcesArray.length;
let actualSource = 0;

    processSource(actualSource);

    function processSource(actualSource) {
        const url = `http://localhost:8081/${sourcesArray[actualSource]}`;
        console.log(`processing ${url}`);

        request(url, (error, response) => {
            if (!error) {
                console.log(`${sourcesArray[actualSource]} processed succesfully.`)
                newEventsArray = newEventsArray.concat(JSON.parse(response.body));
                actualSource++;
                console.log(`Status: ${actualSource} / ${sourcesCount}`);
                if (actualSource === sourcesCount) {
                    console.log('received data from all sources');
                    // res.json(eventsArray);
                    analyzeEvents(newEventsArray);
                    console.log(`New events count: ${newEventsArray.length}`);
                }   else processSource(actualSource);


            } else if (error) {
                throw error;
            } else {
                console.log('no error but something went bad');
            }

        });
    }
}


function analyzeEvents(newEventsArray) {

    for (let i = 0; i < newEventsArray.length; i++) {
        if (newEventsArray[i].title !== undefined) {
            checkSimilarity(newEventsArray[i]);
        }
    }
    
}


function checkSimilarity(event) {


eventModel.aggregate([
    { 
        "$match": { 
               "$text": { 
                     "$search": `${event.title}`
                } 
         } 
    },
    { 
         "$project": { 
               "_id": 0, 
               "score": { 
                     "$meta": "textScore", 
                },
                "title": 1,
                "startDate": 1, 
                "source": 1,
          } 
     },
     { 
          "$match": { 
                "score": { "$gt": 1.4 } 
           } 
     }
]).exec((err, results) => {

    if (err) {
        console.log(err);
    } else {
        // console.log(`was looking for ${event.title} ${event.source}`);
        // console.log('RESULTS FROM SINGLE SEARCH: ');
        const filteredByDate = results.filter((n) => { return n.startDate === event.startDate });
            if (filteredByDate.length > 1) {
                console.log(filteredByDate);
            }
    }


})




    // eventModel.find(
    // { $text:
    //      { $search: event.title }
    // },
    // { score: 
    //     { $meta: 'textScore' }
    // }
    // ).sort(
    // { score:
    //      { $meta: "textScore" }
    // }).exec(function(err, results) {
        // if (err) {
        //     console.log(err);
        // } else if (_.isEmpty(results)) {
        //     console.log('found none, adding');
        //     addToMongo(event);
        // } else {
        //     if (results.length > 1) {
        //             console.log(`was looking for ${event.title}`);
        //             console.log('RESULTS FROM SINGLE SEARCH: ');
        //             results.forEach((result) => {
        //                 console.log(result.score);
        //                 console.log(result.location);
        //             });
        //         }
        // }
    // });
    

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
        source: event.source,
        id: event.id,
        ticketLink: event.ticketLink,
        teams: event.teams,
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




