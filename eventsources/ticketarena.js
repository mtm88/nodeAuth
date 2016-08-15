'use strict';

const moment = require('moment');
const promise = require('promise');
const request = require('request');
var cheerio = require('cheerio');


exports.process = function(req, res) {

    
    const url = 'http://www.ticketarena.co.uk/places/leeds/index.html?page=1';
    request(url, (error, response, html) => {
        if(!error) {
            const $ = cheerio.load(html);
            const lastPage = $('.goright').children('.last').attr('href').replace(/\D/g,'');
            console.log(`Number of pages to process: ${lastPage}`);
            getResults(lastPage)
            .then((results) => {
                console.log(results);
                res.json(results);
            });
        }

    });

}


function getResults(lastPage) {
    const contentArray = [];
    const promise = new Promise((resolve) => {
        const url = 'http://www.ticketarena.co.uk/places/leeds/index.html?page=1';
        
        request(url, (error, response, html) => {
            if(!error) {
            const $ = cheerio.load(html);

            const events = $('.eventresults').children('.itemwrap');
            const eventsLength = events.length;
            events.each((index, element) => {

                const title = $(element).children('.event-block').children('.event-text-container')
                .find('h3').text();
                const eventLink = $(element).children('.event-block').children('.event-text-container')
                .find('a').attr('href');
                const tempLocation = $(element).children('.event-block').children('.event-text-container')
                .children('p').children().text().trim();
                const location = tempLocation.slice(0, tempLocation.indexOf(','));

                const detailsUrl = `${eventLink}`;
                    request(detailsUrl, (error, response, html) => {
                        if(!error) {
                        const $ = cheerio.load(html);

                            const description = $('.eventinfo').children('.layout--rev').children().last().
                            children('div').text();
                            const image = $('.layout__item').children('.event-header__image').attr('href');
                            const startDate = $('.event-header__date').children().first().attr('content');
                            const endDate = $('.event-header__date').children().last().attr('content');

                            contentArray.push({
                                title,
                                description,
                                image,
                                location,
                                startDate,
                                endDate,
                            });
                            if (contentArray.length === eventsLength) {
                                resolve(contentArray);
                            }
                        }
                    });
            });
            }
        
        });
    });
    return promise;
}
