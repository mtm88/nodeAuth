'use strict';

const request = require('request');
const promise = require('promise');
const cheerio = require('cheerio');
const moment = require('moment');
const phantom = require('phantom');

exports.process = function(req, res) {

let sitepage = null;
let phInstance = null;

const urlLinks = ['1st', '2nd'];

    for (let i = 0; i < 2; i++) {
        phantom.create()
        .then(instance => {
            phInstance = instance;
            return instance.createPage();
        })
        .then(page => {
            sitepage = page;
            return page.open(`https://yorkshireccc.com/fixtures-and-results/fixtures/team/${urlLinks[i]}-xi`);
        })
        .then(status => {
            console.log(status);
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
        console.log(fixtures.length);
    }

}
