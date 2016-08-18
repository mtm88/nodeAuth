'use strict';

const request = require('request');
const promise = require('promise');
const cheerio = require('cheerio');
const moment = require('moment');

exports.process = function(req, res) {

    const matchesArray = [];
    const url = 'http://www.skysports.com/leeds-united-fixtures';


    request(url, (error, response, html) => {

        if (!error) {
            const $ = cheerio.load(html);

            const dateDetails = $('.matches-block__match-list').children('.matches__group-header');
            const matchesDetails = $('.matches__group');


            for (let i = 0; i < matchesDetails.length; i++) {

                const tempDate = $(dateDetails[i]).text().split(' ');
                const dateNow = new Date();
                const year = dateNow.getFullYear();
                const day = tempDate[1].replace(/\D/g,'');
                const matchTime = $(matchesDetails[i]).find('.matches__date').text().trim();
                const teams = $(matchesDetails[i]).find('.swap-text__target');
                const title = `${$(teams[0]).text()} vs ${$(teams[1]).text()}`;

                const dateMoment = moment().set({ 
                    year: year,
                    month: tempDate[2],
                    date: day,
                }).format('YYYY-MM-D');

                matchesArray.push({
                    title,
                    startDate: dateMoment,
                    matchTime,
                    teams,
                    source: 'LUFC',
                });
            }

            res.json(matchesArray);


        } else if (error) throw error;
        else {
            console.log('no error in requesting the source but something is wrong');
        }

    })




}



