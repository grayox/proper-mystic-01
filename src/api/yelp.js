const config = require('./config.json');
const request = require('request'); // npm i request -s

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
  const url = getUrl( city, state, term, );
  const options = {
    json: true,
    auth: {
      bearer: config.yelp.apiKey,
    },
  };
  const result = await new Promise(( resolve, reject, ) => {
    request.get( url, options, ( error, response, body, ) => {
      if( error ) {
        console.error( 'Query failed:', error, );
        reject( error );
      }
      resolve( body );
    });
  });
  // console.log( 'result', result, );
  // console.log( 'typeof result', typeof result, );
  return result;
}