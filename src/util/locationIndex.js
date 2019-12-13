// sample return value
// 'us-va-virginia-beach'

const states = require('../lib/geoData/states.json');

const joiner = '-';

module.exports = ({ country, state, city, }) => {
  const stateAbbr = states.full2abbr[state];
  const joined = [ country, stateAbbr, city, ].join(joiner);
  const out = joined.toLowerCase();
  // console.log('location index:', out);
  return out;
}