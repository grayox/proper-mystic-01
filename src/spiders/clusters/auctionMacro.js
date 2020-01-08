// https://github.com/thomasdondorf/puppeteer-cluster
// https://stackoverflow.com/a/51989560
// https://stackoverflow.com/a/50049555

// example:
// https://github.com/thomasdondorf/puppeteer-cluster/blob/master/examples/alexa-1m.js

// You need to download the Alexa 1M from http://s3.amazonaws.com/alexa-static/top-1m.csv.zip
// and unzip it into this directory

// const puppeteer = require('puppeteer'); // npm i puppeteer -s
const { Cluster } = require('puppeteer-cluster');
const _ = require('lodash');

const auctionList = require('./auctionList');
const getStatesList = require('../../lib/geoData/getStatesList.js');
// const isScheduled = require('../../util/scheduler');

const getDb = require('../../lib/db/getDb');
const todayDate = require('../../util/todayDate');

// start here
const scriptName = 'auctionMacro'; // node auctionMacro
// calls auctionList.js

const MAX_STATES_PER_RUN = 1;
const MAX_PAGES_PER_STATE_PER_RUN = 5; // 1;
const MAX_CONCURRENCY = 5;
// const options = { 
//   slowMo: 1000,
//   // headless: false,
// };
const stateInitObject = {
  latestPage: 0,
  isActive: true, // all states not yet scraped today
  isCurrent: false, // current state to scrape
};

// do not change
const PAGE_INCREMENT = 1;

const db = getDb();
const { formattedDate, } = todayDate;
const stateAbbreviations = getStatesList('abbreviation');
const getStatesInit = () => {
  const out = {};
  stateAbbreviations.forEach( state => out[state] = stateInitObject );
  return out;
};

const addNewCurrentState = states => {
  const keys = Object.keys(states);
  const keysLength = keys.length;
  const keysAvail = keysLength - 1;
  const targetKey = _.random( keysAvail );
  states[targetKey].isCurrent = true;
  return states;
}

const runCluster = async statesInQueue => {
  // // ref: https://github.com/GoogleChrome/puppeteer
  // // cheatsheet: https://nitayneeman.com/posts/getting-to-know-puppeteer-using-practical-examples/
  // // forms: https://stackoverflow.com/questions/45778181/puppeteer-how-to-submit-a-form
  // const browser = await puppeteer.launch(options);

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: MAX_CONCURRENCY,
    monitor: true,
    // timeout: 30000, // 30000 default
    // puppeteerOptions: slowDown,
  });

  // In case of problems, log them
  cluster.on('taskerror', ( err, data, ) => {
    console.log(`Error crawling ${data}: ${err.message}`);
  });
  
  const keys = Object.keys(statesInQueue);
  let i = MAX_STATES_PER_RUN; while(i--) {
    const state = 'WV'; // 'NY'; // keys[i]; // 
    const pageNumber = statesInQueue[state].latestPage + PAGE_INCREMENT;
    const jMax = pageNumber + MAX_PAGES_PER_STATE_PER_RUN;
    for( j = pageNumber; j < jMax; j++ ) {
      const item = { state, pageNumber: j, };
      // ref: https://github.com/thomasdondorf/puppeteer-cluster/blob/master/examples/function-queuing-complex.js
      cluster.queue( item, auctionList, );
    }
  }

  await cluster.idle();
  await cluster.close();
}

( async () => {
  // schedule it
  // if(!isScheduled(scriptName)) return;

  const statsRef = db.collection('stats').doc(formattedDate);
  const initDoc = () => {
    const statesInit = getStatesInit();
    statsRef.set(statesInit);
    // // set queue: list of states not yet scraped
    // // console.log( 'stateAbbreviations', stateAbbreviations, );
    // statsRef.set({ inQueue: stateAbbreviations, });
  }
  
  db.runTransaction( t => {
    return t.get( statsRef )
      .then( doc => {
        // // Add one person to the city population.
        // // Note: this could be done without a transaction
        // //       by updating the population using FieldValue.increment()
        // let newPopulation = doc.data().population + 1;
        // t.update(statsRef, {population: newPopulation});
        // node auctionMacro
        const data = doc.data();
        console.log( 'data', data, );
        // if( !(data && ( 'AL' in data ))) initDoc();
        if( data === undefined ) initDoc();
        else {
          // determine which states need to be run
          // const statesInQueue = data;
          const statesInQueue = _.pickBy( data, 'isActive', );
          // const statesActive = _.pickBy( data, 'isActive', );
          // if(_.isEmpty(statesActive)) return;
          // let statesInQueue = _.pickBy( statesActive, 'isCurrent', );
          // if(_.isEmpty(statesInQueue)) addNewCurrentState(statesActive);
          // // run those states
          runCluster( statesInQueue );
        }
      });
  }).then( result => {
    console.log('Transaction success!');
  }).catch( err => {
    console.log('Transaction failure:', err);
  });
  
})();