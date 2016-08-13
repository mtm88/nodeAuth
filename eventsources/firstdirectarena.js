'use strict';

const moment = require('moment');
const promise = require('promise');
const request = require('request');
var cheerio = require('cheerio');


exports.process = function(req, res) {

    const url = 'http://www.firstdirectarena.com/events/';

    request(url, (error, response, html) => {

        if (!error) {
            const contentArray = [];
            const $ = cheerio.load(html);

            const events = $('.contentpadd').children('.event-list');
            const eventsLength = events.length;
            let processedEvents = 0;

            events.each((index, element) => {

                const rightPanel = $(element).children('.event-list-right');
                const eventLink = rightPanel.children('.event-list-title').children('.event-title').children('h2').find('a').attr('href');
                const image = $(element).children('.event-list-img').find('a').attr('href');
                const title = rightPanel.children('.event-list-title').children('.event-title').children('h2').text().replace(/ /g,'').slice(2);
                const description = rightPanel.children('.event-list-desc').children('.event-list-desc-padd').find('p').text();
                const date = rightPanel.children('.event-list-base').children('.event-list-base-dates').children('.dates').text().trim().split(' ');
                const filteredDate = date.filter((n) => { return n != '' }).slice(0, 3);
                filteredDate[2] = filteredDate[2].replace(/\D/g,'');

                const dateMoment = moment().set({ 
                    year: filteredDate[2],
                    month: filteredDate[1],
                    date: filteredDate[0],
                }).format('YYYY-MM-D');

                contentArray.push({
                    title,
                    description,
                    image,
                    eventLink,
                    location: 'First Direct Arena',
                    date: dateMoment,
                });

                processedEvents++;

                if (processedEvents === eventsLength) {
                    contentArray.unshift({ eventsCount: processedEvents });
                    res.json(contentArray);
                }

            });
        }
    });
}
