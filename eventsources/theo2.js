'use strict';

const moment = require('moment');
const promise = require('promise');
const request = require('request');
var cheerio = require('cheerio');


exports.process = function(req, res) {

    
    const url = 'http://www.theo2.co.uk/events/';

    request(url, (error, response, html) => {
        if(!error) {
            const $ = cheerio.load(html);
            const pageString = $('.record').text();
            const tempIndex = pageString.indexOf('of');
            const lastPage = parseInt(pageString.slice(tempIndex + 2).replace(/ /g,'')); 
            getResults(lastPage)
                .then((results) => {
                    // console.log(`Total amount of events: ${results.length}`);
                    results.unshift({ eventsCount: results.length });
                    res.json(results);
                });
        }
    });


    function getResults(lastPage) {
    let contentArray = [];
    let processedPages = 0;
    let pageLinkToProcess = 1;
    const promise = new Promise((resolve) => {
    for (let i = 1; i <= lastPage; i++) {
        //pages on this website switch on adding 24 each page -> /index/0, /index/24, /index/48
        // console.log(`processing page: ${i}`);
        // console.log(`pageLinkToProcess ${pageLinkToProcess}`);
        const url = `http://www.theo2.co.uk/events/index/${pageLinkToProcess}`;
        request(url, (error, response, html) => {

            if (!error) {

                processEvents(html)
                    .then((processedEvents) => {
                        // console.log(`events for page ${i} completed`);
                        contentArray = contentArray.concat(processedEvents);
                        processedPages++;
                        // console.log(`processed pages: ${processedPages}`);
                        if (processedPages === lastPage) {
                            // console.log('all done, sending response');
                            resolve(contentArray);
                        }
                    });

            } else if (error) {
                resolve(contentArray);
            }
        });
        pageLinkToProcess = i * 24;
    }
    }); //promise
    return promise;   
    }
}




function processEvents(html) {
    const $ = cheerio.load(html);
    const events = $('.span6 > #list').children('.col3-span1');
    let processedEvent = 0;
    const eventsPromise = new Promise((resolveEvents) => {
        const tempArray = [];
        // console.log('in eventsPromise, length: ' + events.length);
        events.each((index, element) => {
            const info = $(element).find('.info > .date_title');
            const date = $(info).children('.date').children().first().attr('content');
            const title = $(info).children('h3').text();
            const eventLink = $(info).children('h3').children('a').attr('href');
            const tempLocation = $(info).children('.location').text();
            const location = tempLocation.slice(0, tempLocation.indexOf('\n'));
            const image = $(element).find('.thumb-list').children('a').first().attr('href');
            let description = '';
            request(eventLink, (error, response, html) => {
                if (!error) {
                const $ = cheerio.load(html);
                description = $('.description').children('p').first().text();

                } else if (error) {
                    description = 'error while aquiring descrition';
                }

                tempArray.push({
                    title,
                    description,
                    image,
                    location,
                    startDate: date,
                    source: 'the o2',
                });

                processedEvent++;
                if (processedEvent === events.length - 1) {
                    resolveEvents(tempArray);
                }

            });
        });
    });
    return eventsPromise;
}