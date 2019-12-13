const getParseUrlList = require('./parseUrlList');
const _ = require('lodash');

const omitStrings = [
  'w3.org', 'schema.org', 'gstatic.com',
  'google.com', 'googleusercontent.com', 'googleadservices.com',
  'youtube.com', 'craigslist.org', 'craigslist.com',
  'realtor.com', 'trulia.com', 'redfin.com', 'zillow.com',
  'yelp.com', 'yellowpages.com', 'whitepages.com', 'superpages.com',
];

const comma = ',';
const newLine = '\n';
// const singleSpace = ' ';
const emptyString = '';
// const response = 'response';

module.exports = s => {
  const resultsArray = s.split(comma);

  // console.log( 'resultsArray: ', resultsArray, ); //
  // console.log( 'resultsArray type: ', typeof resultsArray, ); // object
  // console.log( 'resultsArray length: ', resultsArray.length, ); //

  // const parsedResults = resultsArray[15].split(newLine)[1];
  const parsedResults = resultsArray.map( r => r.split(newLine)[1] ); // [0] reflects search string

  // console.log( 'parsedResults\n', parsedResults, ); // success
  // console.log( 'parsedResults type: ', typeof parsedResults, ); // object
  // console.log( 'parsedResults length: ', parsedResults.length, );

  // filter results > remove: w3.org, schema.org, google.com, googleadservices.com, googleusercontent.com, gstatic.com, 
  let filteredResults = _.pullAllWith( parsedResults, omitStrings, _.includes);
  filteredResults = _.pullAllWith( filteredResults, [ undefined, emptyString, ], _.equals);

  // // console.log( 'filteredResults\n', filteredResults[15], ); // success
  // // console.log( 'filteredResults type: ', typeof filteredResults[15], ); // object
  // // console.log( 'filteredResults length: ', filteredResults[15].length, ); //

  // console.log( 'filteredResults\n', filteredResults, ); // success
  // console.log( 'filteredResults type: ', typeof filteredResults, ); // object
  // console.log( 'filteredResults length: ', filteredResults.length, );
  
  const parsedUrls = getParseUrlList(filteredResults);
  const domainList = Object.keys(parsedUrls);
  // console.log( 'parsedUrls\n', parsedUrls, );
  // console.log( 'domainList\n', domainList, );
  // console.log( 'parsedUrls keys length: ', keys.length, );
  // return;

  const out = { domainList, parsedUrls, }

  return out;
}