'use strict';

const moment = require('moment');
const promise = require('promise');
const request = require('request');
const cheerio = require('cheerio');
const _ = require('underscore');
const phantom = require('phantom');


exports.process = function(req, res) {


let pagesCount = 0;
let lastPage = 1;
let contentArray = [];


processEvents(pagesCount);

function processEvents(pagesCount) {
let sitepage = null;
let phInstance = null;
console.log(`processing page ${pagesCount}`);
phantom.create()
    .then(instance => {
        phInstance = instance;
        return instance.createPage();
    })
    .then(page => {
        sitepage = page;
        return page.open(`http://www.visitleeds.co.uk/thedms.aspx?dms=12#!page=${pagesCount}`);
    })
    .then(status => {
        // console.log(status);
        return sitepage.property('content');
    })
    .then(content => {
        const $ = cheerio.load(content);
        const tempPagesArray = [];
        const pagination = $('.thedmsBrowsePagination').first().children();
        pagination.each((index, element) => {
            tempPagesArray.push($(element).text());
        });
        const pagesArray = tempPagesArray.filter((n) => { return !isNaN(n) });
        lastPage = pagesArray[pagesArray.length - 1];
        // console.log(`setting last page to ${lastPage}`);

        const infoFrame = $('#thedmsMain').children('#thedmsListings').children('.thedmsBrowseRow');
        // console.log(`length of events: ${infoFrame.length}`);

        processResults(infoFrame)
            .then(() => {
                // console.log(`page ${pagesCount} completed`);
                pagesCount++;
                const lastEventDate = contentArray[contentArray.length - 1].startDate;
                const timeNow = moment().add(1, 'M');
                if (pagesCount === lastPage || lastPage === undefined) {
                    // console.log(`last page: ${pagesCount}`);
                    res.json(contentArray);
                } else if (moment(lastEventDate).isAfter()) {
                    // console.log('Event date is due next month, finishing.');
                    res.json(contentArray);
                } else {
                    processEvents(pagesCount);
                    }
            });

        sitepage.close();
        phInstance.exit();
    })
    .catch(error => {
        console.log('ERROR');
        console.log(error);
        phInstance.exit();
    });

}


function processResults(infoFrame) {

    const promise = new Promise((resolve) => {
    
        const $ = cheerio.load(infoFrame);
        if (infoFrame.length > 0) {
            infoFrame.each((index, element) => {

                const tempTitle = $(element).children('.dms1120').children('.thedmsContentHolder').children('.thedmsBrowseH2Background')
                .children('h2').children('a').text();
                const title = tempTitle.slice(0, tempTitle.indexOf('at'));
                const location = tempTitle.slice(tempTitle.indexOf('at') + 3);
                const eventLink = $(element).children('.dms1120').children('.thedmsContentHolder').children('.thedmsBrowseH2Background')
                .children('h2').children('a').attr('href');

                const tempDate = $(element).children('.dms1120').children('.thedmsBrowseDates').children('.thedmsEventDate')
                .children('strong').children('a').text();

                const tempDateArray = tempDate.split(' ');
                const dateYear = tempDateArray[tempDateArray.length - 1];

                    const startDate = tempDate.slice(0, tempDate.indexOf('-'));
                    const endDate = tempDate.slice(tempDate.indexOf('-') + 2);
                    const startDateArray = startDate.split(' ');
                    const endDateArray = endDate.split(' ');
                    // console.log(endDateArray);

                    const startDateFormat = moment().set({ 
                        year: dateYear,
                        month: startDateArray[2],
                        date: startDateArray[1],
                    }).format('YYYY-MM-D');

                    let endDateFormat = '';

                if (tempDate.indexOf('-') > -1) {
                    endDateFormat = moment().set({ 
                        year: dateYear,
                        month: endDateArray[2],
                        date: endDateArray[1],
                    }).format('YYYY-MM-D');

                }

                getDetails(eventLink)
                    .then((results) => {

                        const description = results.description;
                        const image = results.image;

                        contentArray.push({
                            title,
                            description,
                            image,
                            location,
                            startDate: startDateFormat,
                            endDate: endDateFormat,
                        });
                    resolve();
                    })
            });
        } else {
            // console.log('length was 0, resolving');
            resolve();
        }

    })
    return promise;

}




function getDetails(eventLink) {
    let sitepage = null;
    let phInstance = null;
    const promise = new Promise((resolve) => {
        phantom.create()
        .then(instance => {
            phInstance = instance;
            return instance.createPage();
        })
        .then(page => {
            sitepage = page;
            return page.open(`http://www.visitleeds.co.uk/${eventLink}`);
        })
        .then(status => {
            // console.log(status);
            return sitepage.property('content');
        })
        .then(content => {
            const $ = cheerio.load(content);
            const description = $('.dmsField-d1').children('p').text();
            const tempImage = $('.slides').children('.slide-item').find('img').attr('src');
            const image = `http:${tempImage}`;
            resolve({ description, image });
            sitepage.close();
            phInstance.exit();
        })
        .catch(error => {
            resolve();
            console.log(error);
            phInstance.exit();
        });
    });
    return promise;

}


    // function processResults(content) {

    //     const $ = cheerio.load(content);
        
    //     const infoFrame = $('#thedmsMain').children('#thedmsListings').children('.thedmsBrowseRow').text();
    //     console.log('infoFrame:');
    //     console.log(_.isEmpty(infoFrame));
        
    //     infoFrame.each((index, element) => {
    //         const title = $(element).children('.dms1120').children('.thedmsContentHolder')
    //         .children('.thedmsBrowseH2Background').children('h2').children('a').text();
    //         console.log(title);
    //     })

    // }



}
