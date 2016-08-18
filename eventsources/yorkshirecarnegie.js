'use strict';

const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');

exports.process = function(req, res) {

    const matchesArray = [];
    const url = 'http://www.yorkshirecarnegie.com/rugby/fixtures_and_results_first_xv.php';


    request(url, (error, response, html) => {

        const $ = cheerio.load(html);

        const table = $('.fixtures').find('.match-fixture');
        
        table.each((index, element) => {

            const tempDate = $(element).children('.field_DateShort').text().split(' ');
            const time = $(element).children('.field_Time').text();
            const type = $(element).children('.field_CompStageAbbrev').text();
            const teams = `${$(element).children('.field_HomeDispName').text()} vs ${$(element).children('.field_AwayDispName').text()}`;
            const venue = $(element).children('.field_VenName').text();
            const ticketLink = `http://www.yorkshirecarnegie.com/${$(element).children('.field_More').children('a').attr('href')}`;
            
            let date = '';
            let month = '';

            if (tempDate.length === 2) {
                date = tempDate[0].slice(0, tempDate[0].indexOf('/'));
                month = tempDate[1];
            }   else {
                date = tempDate[1];
                month = tempDate[2];
            }

            const dateMoment = moment().set({ 
                year: new Date().getFullyear,
                month,
                date,
            }).format('YYYY-MM-D');

            matchesArray.push({
                teams,
                startDate: dateMoment,
                venue,
                source: 'Yorkshire Carnegie',
                ticketLink,
                type,
                time,
            });

            if (matchesArray.length === table.length) {
                res.json(matchesArray);
            }

        });

    });


}


