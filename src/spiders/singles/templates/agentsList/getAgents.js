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

// const processResult = result => {
//   result = {
//     // businesses: (28)[],
//     total: 28,
//     region: {
//       center: { longitude: -72.27973937988281, latitude: 42.2858989072091 },
//     },
//     config: {
//       term: 'real estate agents',
//       city: 'Ware',
//       state: 'MA',
//       zip: '01082',
//       county: 'Hampshire County',
//       source: 'yelp',
//     },
//   }
// }

// const getAgents = async ({ page, data: config, }) => {
const getAgents = async config => {
  // console.log('config', config,); // return;
  if ( config.source === 'yelp' ) {
    // const yelp = await getYelp({ city: 'Greensboro', state: 'NC', term: 'Real Estate Agents', });
    // console.log('config-yelp', config,);
    const yelp = await getYelp( config, );
    // console.log( 'yelp', yelp, );
    const out = { ...yelp, config, };
    // console.log( 'out', out, );
    // const keys = Object.keys(out);
    // console.log( 'keys-yelp', keys, );
    // const keysLength = keys.length;
    // console.log( 'keysLength-yelp', keysLength, );
  } else {
    // console.log('config-other', config,);
    getLists( config, )
      .then( result => {
        // console.log( 'result', result, );
        const out =  { ...result, config, }
        // console.log( 'out', out, );
        // const keys = Object.keys(out);
        // const keysLength = keys.length;
        // console.log( 'keysLength-lists', keysLength, );
      })
      .catch( console.error );
  }
}

module.exports = getAgents;