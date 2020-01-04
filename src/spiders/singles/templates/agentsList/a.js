const getAgents = require('./list');

// script name: getAgents.js

// CAPTCHA:
  // zillow
  // const config = { source: 'reo', zip: '36695', };

// // API: yelp
// const yelp = require('../api/yelp');
// yelp();

// const config = { source: 'bpo', zip: '36695', };
// const config = { source: 'homePath', city: 'mobile', state: 'al', };
// const config = { source: 'yellow', city: 'richmond', state: 'va', term: 'real estate agents', };
// const config = { source: 'realtor', city: 'high-point', state: 'nc', };
const config = { source: 'hud', state: 'NC', zip: '27406', };

getAgents(config)
  .then( result => console.log( 'result\n', result, ))
  .catch(console.error);