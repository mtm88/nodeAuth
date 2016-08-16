'use strict';

const request = require('request');


exports.process = function(req, res) {

let pageCount = 0;
const eventsArray = [];

getPageCount()
    .then((result) => {
        getData(result)
            .then((resolvedData) => {
                for (let i = 0; i < resolvedData.length; i++) {
                    const tempVar = resolvedData[i];
                    const thumbnailImage = tempVar.logo !== null ? tempVar.logo.url : undefined;
                    eventsArray.push({
                        title: tempVar.name.text,
                        description: tempVar.description.text,
                        id: tempVar.id,
                        ticketLink: tempVar.url,
                        startDate: tempVar.start.local,
                        endDate: tempVar.end.local,
                        thumbnailImage,
                        location: 'Leeds' // temporary?
                    });
                    console.log(`${i} / ${resolvedData.length - 1}`);
                    if (i === resolvedData.length - 1) {
                        res.json(eventsArray);
                    }
                }
            })
            .catch((error) => {
                console.log('error catched at getData');
                console.log(`error: ${error}`);
            });
    })
    .catch((error) => {
        console.log('error catched at getPageCount');
        console.log(`error: ${error}`);
    });

}



function getData(pageCount) {
    const promise = new Promise((resolve, reject) => {
        let tempEventArray = [];
        let pagesAnalysed = 0;
        for (let i = 1; i <= pageCount; i++) {

            const queryParams = {
            url: `https://www.eventbriteapi.com/v3/events/search?location.address=leeds&page=${i}`,
            headers: {
                Authorization: 'Bearer DKE4C5HES6OFOUPBFWE7',
                }
            }

            request(queryParams, (error, response) => {

                if (!error) {
                    tempEventArray = tempEventArray.concat(JSON.parse(response.body).events);
                    pagesAnalysed++;
                    console.log(`on page ${i}`);
                    if (pagesAnalysed === pageCount) {
                        resolve(tempEventArray);
                    }
                } else if (error) reject(`error page ${i}: ${error}`);
                else {
                    reject('no error but also no results in getData');
                }

            });

        }
    });
    return promise;
}




function getPageCount() {
    const promise = new Promise((resolve, reject) => {
        const queryParams = {
        url: 'https://www.eventbriteapi.com/v3/events/search?location.address=leeds',
        headers: {
            Authorization: 'Bearer DKE4C5HES6OFOUPBFWE7',
            }
        }

        request(queryParams, (error, response) => {
            if (!error) {
                const pageCount = JSON.parse(response.body).pagination.page_count;
                console.log(`pageCount: ${pageCount}`);
                resolve(pageCount);
            } else if (error) reject(`error: ${error}`);
            else {
                reject('no error but also no results in getPageCount');
            }
        });
    });
    return promise;
}



