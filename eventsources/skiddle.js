'use strict';

const request = require('request');
const promise = require('promise');


const apiKey = '47d05504089f3978e462695701729b49';


exports.process = function(req, res) {

    const eventsArray = [];

    getTotalCount()
        .then(processEvents, throwError);


    function processEvents(eventsCount) {
        
        let offset = 0;
        const queryCountCalc = eventsCount % 100;
        let queryCount;
        if (queryCountCalc > 0) {
            queryCount = parseInt(eventsCount / 100 + 1);
        }   else {
            queryCount = eventsCount / 100;
        }

        for (let i = 0; i <= queryCount; i++) {
            // console.log(`offset set to ${offset}`);
            // console.log(`Processing ${i} / ${queryCount} page`);
            const url = `http://www.skiddle.com/api/v1/events/?latitude=53.801&longitude=-1.548&radius=10&api_key=${apiKey}&limit=100&offset=${offset}`;

            request(url, (error, response) => {
                if (!error) {
                    const responseJson = JSON.parse(response.body);
                    const eventsOnPage = responseJson.results;
                    for (let i = 0; i < eventsOnPage.length; i++) {
                        const event = eventsOnPage[i];
                        eventsArray.push({
                            id: event.id === undefined ? '' : event.id,
                            title: event.eventname,
                            description: event.description,
                            venue: event.venue.address,
                            location: event.venue,
                            source: 'Skiddle',
                            thumbnailImage: event.imageurl,
                            image: event.imageurl,
                            ticketLink: event.link,
                            startDate: event.date,
                            genre: event.genres,
                        });
                        // console.log(`status: ${eventsArray.length} / ${eventsCount}`);
                        if (eventsArray.length >= eventsCount) {
                            // console.log('finished, sending response');
                            res.json(eventsArray);
                        }
                    }
                } else if (error) console.log((`error in getTotalCount: ${error}`));
                else console.log(`error exists but its empty in getTotalCount`);
            });

        offset += 100;
        }
    }

    function getTotalCount() {
        const promise = new Promise((resolve, reject) => {

            const url = `http://www.skiddle.com/api/v1/events/?latitude=53.801&longitude=-1.548&radius=10&api_key=${apiKey}&limit=1`;

            request(url, (error, response) => {
                if (!error) {
                const responseJson = JSON.parse(response.body);
                resolve(responseJson.totalcount);
                } else if (error) reject(`error in getTotalCount: ${error}`);
                else reject(`error exists but its empty in getTotalCount`);
            });
        });
        return promise;
    }

    function throwError(error) {
        res.json(`promise rejected, details: ${error}`);
    }




}