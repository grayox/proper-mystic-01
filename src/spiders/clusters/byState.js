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
const write2db = require('../../lib/db/write2firestore');

// increment counters
// ref: https://firebase.google.com/docs/firestore/manage-data/add-data#increment_a_numeric_value
// ref: https://fireship.io/snippets/firestore-increment-tips/
const admin = require('firebase-admin');
const incrementer = admin.firestore.FieldValue;

// start here
// const scriptName = 'byState'; // node byState
// calls auctionList.js

const MAX_STATES_PER_RUN = 1;
const MAX_PAGES_PER_STATE_PER_RUN = 5; // 1;
const MAX_CONCURRENCY = 5;
const puppeteerOptions = { 
  // slowMo: 1000,
  // headless: false,
  args: [
    // support Heroku dynos // ref: https://stackoverflow.com/a/55090914
    '--no-sandbox',
    '--disable-setuid-sandbox',
  ],
};
const stateInitObject = {
  isActive: true, // all states not yet scraped today
  isCurrent: false, // current state to scrape
  pagesAttempted: 0, // total pages attempted to be scraped
  pagesCount: 0, // total count of pages with data we successfully captured
  itemsCount: 0, // total number of items captured from pages with data
  currentItems: 0, // total number of captured items that are current
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

const dbConfig = {
  source: 'auction',
  stats: {
    collection: 'stats',
    doc: formattedDate,
  },
  states: {
    collection: 'states',
    doc: formattedDate,
  },
};

const getRandomState = subsetOfStates => {
  const keys = Object.keys( subsetOfStates );
  const keysLength = keys.length;
  const keysAvail = keysLength - 1;
  const targetKey = _.random( keysAvail );
  const out = keys[ targetKey ];
  return out; // 'WV'
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
    puppeteerOptions, // support Heroku dynos
  });

  // In case of problems, log them
  cluster.on('taskerror', ( err, data, ) => {
    console.log(`Error crawling ${data}: ${err.message}`);
  });
  
  const keys = Object.keys( statesInQueue );
  let i = MAX_STATES_PER_RUN; while(i--) {
    const state = keys[i]; // 'WV'; // 'NY'; // 
    const pageNumber = statesInQueue[state].pagesAttempted + PAGE_INCREMENT;
    const jMax = pageNumber + MAX_PAGES_PER_STATE_PER_RUN;
    for( j = pageNumber; j < jMax; j++ ) {
      const item = { state, pageNumber: j, };
      console.log('item', item,);
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

  const statesRef = db.collection('states').doc(formattedDate);
  const initDoc = () => {
    const statesInit = getStatesInit();
    statesRef.set(statesInit);
    console.log( "Initialized new 'states' for a new day!", formattedDate, );
    // // set queue: list of states not yet scraped
    // // console.log( 'stateAbbreviations', stateAbbreviations, );
    // statesRef.set({ inQueue: stateAbbreviations, });
  }
  
  db.runTransaction( t => {
    return t.get( statesRef )
      .then( doc => {
        // // Add one person to the city population.
        // // Note: this could be done without a transaction
        // //       by updating the population using FieldValue.increment()
        // let newPopulation = doc.data().population + 1;
        // t.update(statesRef, {population: newPopulation});
        // node auctionMacro
        const data = doc.data();
        // console.log( 'data', data, );
        // if( !(data && ( 'AL' in data ))) initDoc();
        if( data === undefined ) initDoc();
        else {
          // determine which states need to be run
          
          // active
          const activeStates = _.pickBy( data, 'isActive', );
          if(_.isEmpty(activeStates)) return;
          
          // current
          const currentStates = _.pickBy( activeStates, 'isCurrent', );
          if(_.isEmpty(currentStates)) {
            const newCurrentState = getRandomState(activeStates);
            const states = {};
            states[newCurrentState] = {
              isCurrent: true,
            };
            const stats = {
              statesAttempted: incrementer.increment(1),
            }
            write2db({ dbConfig, data: { states, stats, }, });
            console.log('Updated new current state:', newCurrentState,);
            return;
          };

          // run those states
          console.log( 'currentStates', currentStates, );
          runCluster( currentStates );
        }
      });
  }).then( result => {
    console.log('Transaction success!');
  }).catch( err => {
    console.log('Transaction failure:', err);
  });
  
})();