'use strict';


const request = require('request');



exports.process = function(req, res) {


    const url = 'http://rabbitholelab.co.uk/welcometoleeds/wp-json/wp/v2/event';


    request(url, (error, response) => {
        if (!error) {
            const content = JSON.parse(response.body);
            console.log(`events availble in Rabbit Hole API: ${content.length}`);

            for (let i = 0; i < content.length; i++) {

                const event = content[i];

                console.log(event.title.rendered);

            }



        }   else if (error) throw error;
        else console.log('empty error object in rabbithole');

    })

}