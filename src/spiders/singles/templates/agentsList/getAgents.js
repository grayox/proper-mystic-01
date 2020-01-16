const getLists = require('./getLists');
// API: yelp
const getYelp = require('../../../../api/yelp');
// const yelp = getYelp({ city: 'Greensboro', state: 'NC', term: 'Real Estate Agents', });
// console.log('yelp', yelp,);

// node getAgents
// script name: getAgents.js

// CAPTCHA:
  // zillow
  // const config = { source: 'reo', zip: '36695', };

// const config = {
//   // source: 'bpo', zip: '36695',
//   // source: 'hud', state: 'NC', zip: '27406',
//   // source: 'homePath', city: 'mobile', state: 'al',
//   // source: 'realtor', city: 'high-point', state: 'nc',
//   // source: 'yellow', city: 'richmond', state: 'va', term: 'real estate agents',
// };

const getAgents = async ({ page, data: config, }) => {
  // console.log('config', config,); return;
  if ( config.source === 'yelp' ) {
    // const yelp = await getYelp({ city: 'Greensboro', state: 'NC', term: 'Real Estate Agents', });
    // console.log('config-yelp', config,);
    const yelp = await getYelp( config, );
    // console.log('yelp', yelp,);
  } else {
    // console.log('config-other', config,);
    getLists( config, )
      .then( result => console.log( 'result\n', result, ))
      .catch( console.error );
  }
}

module.exports = getAgents;