const request = require('request'); // npm i request -s
const config = require('./config.json');

request.get( config.yelp.businesses, {
    auth: {
      bearer: config.yelp.apiKey,
    },
  }, ( error, response, body, ) => {
    if (error) {
      return console.error( 'Upload failed:', error, );
    }
    // console.log( 'response', response, );
    console.log( 'body', body, );
  }
);