'use strict';

const request = require('request');
const promise = require('promise');
const cheerio = require('cheerio');
const moment = require('moment');
const phantom = require('phantom');

exports.process = function(req, res) {


const matchesArray = []; 
let sitepage = null;
let phInstance = null;

const urlLinks = ['1st', '2nd'];

 let pagesProcessed = 0;

 loadPage(pagesProcessed);

    function loadPage(pageProcessed) {
        phantom.create()
        .then(instance => {
            phInstance = instance;
            return instance.createPage();
        })
        .then(page => {
            sitepage = page;
            return page.open(`https://yorkshireccc.com/fixtures-and-results/fixtures/team/${urlLinks[pageProcessed]}-xi`);
        })
        .then(status => {
            // console.log(status);
            return sitepage.property('content');
        })
        .then(content => {
        processContent(content);
        sitepage.close();
            phInstance.exit();
        })
        .catch(error => {
            console.log('ERROR');
            console.log(error);
            phInstance.exit();
        });
    }



    function processContent(content) {

        const $ = cheerio.load(content);
        const fixtures = $('.grid__item--primary').children('.push-three--bottom');
        const tempMonths = $('.grid__item--primary').children('.block__blue');
        const months = [];
        let year = '';
        tempMonths.each((index, element) => {
            const month = $(element).text().replace(/\d+/g,'').trim();
            year = $(element).text().replace(/\D+/g,'').trim();
            months.push(month);
        });
        for (let i = 0; i < fixtures.length; i++) {
            const games = $(fixtures[i]).children('.tbody').children();
            games.each((index, element) => {
                const location = $(element).find('.matches__fixture-venue').children().text();
                const tempTeams = JSON.stringify($(element).find('.matches__fixture-venue').text().trim());
                const teams = tempTeams.slice(1, tempTeams.indexOf('\\n\\t'));
                const tempDate = JSON.stringify($(element).find('.match-date').text());
                let startDay = tempDate.slice(1, tempDate.indexOf('\\n')).replace(/\D+/g,'');
                let endDay = '';
                if (startDay.indexOf('-') > -1) {
                    const dayArray = startDay.split('-');
                    startDay = dayArray[0].replace(/\D+/g,'').trim();
                    endDay = dayArray[1].replace(/\D+/g,'').trim();
                }
                const month = months[i];
                const startDateFormat = moment().set({ 
                    year,
                    month,
                    date: startDay,
                }).format('YYYY-MM-D');

                const endDateFormat = moment().set({ 
                    year,
                    month,
                    date: endDay,
                }).format('YYYY-MM-D');

                matchesArray.push({
                    teams,
                    startDate: startDateFormat,
                    endDate: endDateFormat,
                    location,
                    source: 'Yorkshire Cricket',
                });


            })
        }

        pagesProcessed++;
        if (pagesProcessed === urlLinks.length) {
            res.json(matchesArray);
        } else {
            loadPage(pagesProcessed);
        }

    }

}
