'use strict';

const moment = require('moment');
const promise = require('promise');
const request = require('request');
var cheerio = require('cheerio');


exports.process = function(req, res) {

    const url = 'http://leeds-list.com/whats-on/when/all/';

    request(url, (error, response, html) => {
        if(!error) {
            const $ = cheerio.load(html);
            const pageString = $('.item-surround').find('ul').children().text();
            const pagesCount = pageString.slice(pageString.lastIndexOf('123') + 4, pageString.indexOf('Next'));
            console.log(`Number of pages to process: ${pagesCount}`);

            getResults(pagesCount)
                .then((results) => {
                    console.log(`Total amount of events: ${results.length}`);
                    results.unshift({ eventsCount: results.length });
                    res.json(results);
                })
            
        }
    });

    function getResults(pagesCount) {
        const contentArray = [];
        const promise = new Promise((resolve, reject) => {
            let processedPages = 1;
            for (let i = 1; i < pagesCount; i++) {
                const url = `http://leeds-list.com/whats-on/when/all/page/${i}`;
                request(url, function(error, response, html){
                    if(!error){
                        console.log(`processing page ${i}`);
                        const $ = cheerio.load(html);

                        // const feature_item = $('.item-surround').children('.feature-item').text();
                        $('.item-surround').find('ol > li').each((index, element) => {
                            const title = $(element).find('.feature-inner > h2').text();
                            const description = $(element).find('.feature-inner').children().last().text();
                            const location = $(element).find('.feature-inner > .date > .location').text();
                            const date = $(element).find('.feature-inner > .date').text();
                            const image = $(element).find('img').attr('src');
                            const tempDateMarker = date.lastIndexOf(' at ');
                            const tempDateFormat = date.slice(0, tempDateMarker);
                            // console.log(tempDateFormat);
                            const dateArray = tempDateFormat.split(' ');
                            const dayFromDate = dateArray[1].replace(/\D/g,'');
                            const timeFromDate = dateArray[4];
                            const defineMornEvening = timeFromDate.replace(/[0-9]|:/g, '').toUpperCase();
                            const hourFromTimeIndex = timeFromDate.indexOf(':');
                            const hourFromTime = timeFromDate.slice(0, hourFromTimeIndex).replace(/\D/g,'');
                            let minutesFromTime = 0;
                            if (hourFromTimeIndex > -1) {
                                minutesFromTime = timeFromDate.slice(hourFromTimeIndex + 1).replace(/\D/g,'');
                            }

                            // console.log(hourFromTime); 
                            const dateMoment = moment().set({ 
                                year: dateArray[3],
                                month: dateArray[2],
                                date: dayFromDate,
                                hour: hourFromTime,
                                minute: minutesFromTime,
                            }).format();
                            // console.log(dateMoment);

                            contentArray.push({
                                title,
                                description,
                                image,
                                location,
                                date: dateMoment,
                                time: defineMornEvening
                            });
                            // console.log(`pushing ${title}`);
                        });  
                        console.log(`processed page: ${processedPages}`);
                        processedPages++;
                        if (processedPages == pagesCount) {
                            resolve(contentArray);
                        }
                        
                    } else if (error) {
                        reject(error);
                    }
                });
        }
    });
    return promise;
    }

}