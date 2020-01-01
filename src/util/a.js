const getAgents = require('../spiders/singles/templates/list');

// const yelp = require('../api/yelp');
// yelp();

// script name: getAgents.js

// const config = { source: 'bpo', zip: '36695', };
// const config = { source: 'homePath', city: 'mobile', state: 'al', };
// const config = { source: 'yellow', city: 'richmond', state: 'va', term: 'real estate agents', };
// const config = { source: 'realtor', city: 'high-point', state: 'nc', };
const config = { source: 'zillow', city: 'high-point', state: 'nc', };

getAgents(config)
  .then( result => console.log( 'result\n', result, ))
  .catch(console.error);