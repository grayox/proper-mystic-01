const getAgents = require('./list');

// script name: getAgents.js

// CAPTCHA:
  // zillow
  // const config = { source: 'reo', zip: '36695', };

// // API: yelp
// const yelp = require('../api/yelp');
// yelp();

const config = {
  // source: 'bpo', zip: '36695',
  source: 'hud', state: 'NC', zip: '27406',
  // source: 'homePath', city: 'mobile', state: 'al',
  // source: 'realtor', city: 'high-point', state: 'nc',
  // source: 'yellow', city: 'richmond', state: 'va', term: 'real estate agents',
};

getAgents( config, )
  .then( result => console.log( 'result\n', result, ))
  .catch( console.error );