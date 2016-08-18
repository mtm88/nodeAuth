'use strict';


const request = require('request');
const _ = require('underscore');

const apiKey = 'ssHoTt9L696e8F84IOH2o4n52n89nxX78pq1dLs4uOkc7';


const url = `http://api.leedsinspired.co.uk/1.0/events.json?key=${apiKey}`;

exports.process = function(req, res) {

getEvents();

    function getEvents() {

        const eventsArray = [];

        request(url, (error, response) => {
            const responseJson = JSON.parse(response.body);
            const events = responseJson.objects;

            for (let i = 0; i < events.length; i++) {
                const event = events[i];

                let startDate = event.dates.start_date;
                let endDate = event.dates.end_date;

                // console.log(event);
                if (_.isArray(event.dates) && !_.isEmpty(event.dates)) {
                    startDate = event.dates[0].start_date;
                    endDate = event.dates[event.dates.length - 1].end_date;
                }

                eventsArray.push({
                    title: event.event_title,
                    description: event.description,
                    id: event.event_id,
                    location: event.place_title,
                    thumbnailImage: event.image_thumbnail,
                    image: event.image_original,
                    genre: event.categories,
                    startDate,
                    endDate,
                    source: 'Leeds Inspired',
                });
                // console.log(`status: ${i} / ${events.length - 1}`);
                if (i === events.length - 1) {
                    res.json(eventsArray);
                }
            }
        });
    }
}