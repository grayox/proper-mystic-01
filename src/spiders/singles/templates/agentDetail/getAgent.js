const getAgent = require('./detail');

// script name: getAgent.js

const config = {
  // go
  // source: 'yelp', url: 'https://www.yelp.com/biz/the-jenny-maraghy-team-richmond',
  // source: 'yellow', url: 'https://www.yellowpages.com/richmond-va/mip/atlantic-beacon-realty-llc-1508134?lid=1001780201283',
  // no go
  // source: 'realtor', url: 'example.com', // difficult
  // source: 'hud', url: 'example.com', // not needed because detail conteined in list inside table
  // todo
  // source: 'bpo', url: 'https://nabpop-member.com/members/publicProfile.php?user=2007246',
  source: 'homePath', url: 'https://www.homepath.com/listing/5713-ramada-dr-s-mobile-al-36693-46345257',
};

getAgent( config, )
  .then( result => console.log( 'result\n', result, ))
  .catch( console.error );