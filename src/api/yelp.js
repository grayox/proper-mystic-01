const config = require('./config.json');
// const got = require('got'); // npm install request --save
const request = require('request'); // npm i request -s
// const req = require('request'); // npm i request -s
// const { promisfy } = require('util');
// const request = promisfy(req.get); 

const formatTerm = term => {
  const splitter = ' ';
  const joiner = '-';
  const lowered = term.toLowerCase();
  const out = lowered.split(splitter).join(joiner);
  return out;
}
// const t = formatTerm( 'Real Estate Agents' );
// t

const getUrl = ( city, state, term, ) => {
  // 'https://api.yelp.com/v3/businesses/search?location=richmond-va&term=real-estate-agents'
  // `https://api.yelp.com/v3/businesses/search?location=${city}-${state}&term=${term}`
  const formattedCity  = formatTerm( city , );
  const formattedState = formatTerm( state, );
  const formattedTerm  = formatTerm( term , );
  const out = `https://api.yelp.com/v3/businesses/search?location=${formattedCity}-${formattedState}&term=${formattedTerm}`
  return out;
};
// const url = getUrl( 'Greensboro', 'NC', 'Real Estate Agents', );
// url

module.exports = async ({ city, state, term, }) => {
  let out;
  const url = getUrl( city, state, term, );
  // request
  const options = {
    json: true,
    auth: {
      bearer: config.yelp.apiKey,
    },
  };
  // // got
  // const options = {
  //   bearer: config.yelp.apiKey,
  // };
  // request.get( config.yelp.businesses, {
  // await request.get( url, options,
  // const result = await request.get( url, options,
  const result = await new Promise(( resolve, reject, ) => {
    // const result = await got( url, options,
    request.get( url, options, ( error, response, body, ) => {
      if (error) {
        // return console.error( 'Upload failed:', error, );
        console.error( 'Upload failed:', error, );
        reject ( error );
      }
      // console.log( 'response', response, );
      // console.log( 'body', body, );
      // result = body;
      // return body;
      // out = JSON.parse(body);
      // return JSON.parse(body);
      resolve ( body );
    })
  });
  console.log( 'result', result, );
  console.log( 'typeof result', typeof result, );
  return result;
  // // console.log( 'out', out, );
  // return out;
}