const states = require('./states.json');

const getStatesProperties = property => {
  const { asArray, } = states;
  const out = [];
  asArray.forEach( state => {
    if( state.variant === 'state' ) out.push(state[ property ]);
  });
  return out;
}

module.exports = getStatesProperties;

// const stateAbbreviations = getStatesProperties('abbreviation');
// stateAbbreviations
// const stateNames = getStatesProperties('name');
// stateNames

// // use:
// const getStatesList = require('../../lib/geoData/getStatesList.js');
// const stateAbbreviations = getStatesList('abbreviation');
// const stateNames = getStatesList('name');
