// puppeteer: https://github.com/GoogleChrome/puppeteer
// examples: https://github.com/GoogleChrome/puppeteer/tree/master/examples/
// live coding: https://www.youtube.com/watch?v=pixfH6yyqZk

// scrapes auction.com to send auction data to google sheets

const getLatLong = require('./lib/latlong');
const scrapeUrls = require('./util/scrapeUrls');
const processResults = require('./util/processResults');
const getLocationIndex = require('./util/locationIndex');
const write2db = require('./lib/db/write2firestore');
const isScheduled = require('./util/scheduler');

const scriptName = 'google';

// other utils
// 1. -X- find lat, long of city
// 2. -X- parse results, find domain, define sub urls
// 3. -X- post to firebase
// 4. --- crawl domain to search and find form
// 5. --- post to any arbitrary form

// nationwide offers:
// https://www.nationalhomeoffer.com/virginia, https://www.nationalhomeoffer.com/contact-us/,
// https://housecashnow.com/,
// https://www.homelight.com,
// https://www.nationwidehomesbuyer.com/, https://www.nationwidehomesbuyer.com/#uxi_gform-7, nationwidehomebuyers317@gmail.com,
// https://nhbig.com/we-buy
// http://www.experthomeoffers.com
// trustedcashquote.com
const config = {
  pageDepth: 5,
  city: 'richmond',
  state: 'virginia',
  country: 'us',
  searchStrings: [
    'we buy houses',
    'sell my house now',
    'sell my house fast',
    'sell my house for cash',
    'sell my house for quick cash',
    'sell my house quick for cash now',
  ],
};

const dbConfig = {
  source: 'google',
  domainList: {
    collection: 'markets',
    doc: getLocationIndex(config), // 'us-va-virginia-beach'
  },
  parsedUrls: {
    collection: 'domains',
    // docs: , // domainList (later)
  },
};
// return;

(async () => {
  // schedule it
  if(!isScheduled(scriptName)) return;

  // const value = 'value';
  // const enter = 'Enter';
  
  // const latitude = 37.5407;
  // const longitude = -77.4360;
  const latlong = await getLatLong( config, );
  const { latitude, longitude, } = latlong;
  // console.log( 'latlong:', latlong, );
  // console.log( 'latitude:', latitude, );
  // console.log( 'longitude:', longitude, );
  // return;

  const augmentedConfig = { ...config, latitude, longitude, };

  // search for client web site urls using:
  // google.com
  // https://www.whitepages.com/business/VA/Richmond/Sell-My-House-Now
  // https://www.yelp.com/search?find_desc=sell+my+house+for+cash&find_loc=richmond%2C+va&ns=1
  // https://www.yellowpages.com/search?search_terms=sell+my+house+for+cash&geo_location_terms=Richmond%2C+VA
  const results = await scrapeUrls(augmentedConfig);  
  const data = processResults(results); // { domainList, parsedUrls, }

  // console.log('dbConfig\n', dbConfig,);
  // console.log('data\n', data,);
  await write2db({ dbConfig, data, });
  return;
})();

// node google
// curl -L --data-binary @data/scrape.csv https://script.google.com/macros/s/AKfycbyRT8_eiROa8oCVEQV0nX2bQpxcA4b9Eq2zGpp2LNW0p4ue37_G/exec