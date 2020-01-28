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
  // enable heroku // ref: https://stackoverflow.com/a/55090914
  args: [
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
    puppeteerOptions,
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
      .then( async doc => {
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
            await write2db({ dbConfig, data: { states, stats, }, });
            console.log('Updated new current state:', newCurrentState,);
            // return;
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

atlasgroup@Atlass-MacBook-Air puppeteer % heroku logs
2020-01-13T08:05:00.111840+00:00 app[scheduler.8317]: }
2020-01-13T08:05:00.111842+00:00 app[scheduler.8317]: }
2020-01-13T08:05:00.112053+00:00 app[scheduler.8317]: stats { pagesAttempted: NumericIncrementTransform { operand: 1 } }
2020-01-13T08:05:00.161361+00:00 app[scheduler.8317]: listAddress 404 Grant Street
2020-01-13T08:05:00.161534+00:00 app[scheduler.8317]: listState ND
2020-01-13T08:05:00.162670+00:00 app[scheduler.8317]: isCurrent false
2020-01-13T08:05:00.163429+00:00 app[scheduler.8317]: listAddress 502 Lincoln Ave S
2020-01-13T08:05:00.163537+00:00 app[scheduler.8317]: listState ND
2020-01-13T08:05:00.163766+00:00 app[scheduler.8317]: isCurrent false
2020-01-13T08:05:00.164374+00:00 app[scheduler.8317]: listAddress 743 3rd Ave
2020-01-13T08:05:00.164445+00:00 app[scheduler.8317]: listState ND
2020-01-13T08:05:00.164515+00:00 app[scheduler.8317]: isCurrent false
2020-01-13T08:05:00.164850+00:00 app[scheduler.8317]: states {
2020-01-13T08:05:00.164852+00:00 app[scheduler.8317]: ND: {
2020-01-13T08:05:00.164855+00:00 app[scheduler.8317]: pagesAttempted: NumericIncrementTransform { operand: 1 },
2020-01-13T08:05:00.164857+00:00 app[scheduler.8317]: pagesCount: NumericIncrementTransform { operand: 1 },
2020-01-13T08:05:00.164859+00:00 app[scheduler.8317]: itemsCount: NumericIncrementTransform { operand: 3 },
2020-01-13T08:05:00.164860+00:00 app[scheduler.8317]: currentItems: NumericIncrementTransform { operand: 0 }
2020-01-13T08:05:00.164862+00:00 app[scheduler.8317]: }
2020-01-13T08:05:00.164863+00:00 app[scheduler.8317]: }
2020-01-13T08:05:00.165096+00:00 app[scheduler.8317]: stats {
2020-01-13T08:05:00.165098+00:00 app[scheduler.8317]: pagesAttempted: NumericIncrementTransform { operand: 1 },
2020-01-13T08:05:00.165100+00:00 app[scheduler.8317]: pagesCount: NumericIncrementTransform { operand: 1 },
2020-01-13T08:05:00.165101+00:00 app[scheduler.8317]: itemsCount: NumericIncrementTransform { operand: 3 },
2020-01-13T08:05:00.165103+00:00 app[scheduler.8317]: currentItems: NumericIncrementTransform { operand: 0 }
2020-01-13T08:05:00.165105+00:00 app[scheduler.8317]: }
2020-01-13T08:05:00.174629+00:00 app[scheduler.8317]: 
2020-01-13T08:05:00.174712+00:00 app[scheduler.8317]: 
2020-01-13T08:05:00.220800+00:00 app[scheduler.8317]: == Start:     2020-01-13 08:04:48.744
2020-01-13T08:05:00.220902+00:00 app[scheduler.8317]: == Now:       2020-01-13 08:05:00.220 (running for 11.5 seconds)
2020-01-13T08:05:00.220988+00:00 app[scheduler.8317]: == Progress:  5 / 5 (100.00%), errors: 0 (0.00%)
2020-01-13T08:05:00.221072+00:00 app[scheduler.8317]: == Remaining: 0.0 ms (@ 0.44 pages/second)
2020-01-13T08:05:00.221154+00:00 app[scheduler.8317]: == Sys. load: 70.9% CPU / 96.6% memory
2020-01-13T08:05:00.221244+00:00 app[scheduler.8317]: == Workers:   5
2020-01-13T08:05:00.221328+00:00 app[scheduler.8317]:    #0 IDLE
2020-01-13T08:05:00.221411+00:00 app[scheduler.8317]:    #1 IDLE
2020-01-13T08:05:00.221495+00:00 app[scheduler.8317]:    #2 IDLE
2020-01-13T08:05:00.221573+00:00 app[scheduler.8317]:    #3 IDLE
2020-01-13T08:05:00.221668+00:00 app[scheduler.8317]:    #4 IDLE
2020-01-13T08:05:00.386566+00:00 app[scheduler.8317]: 
2020-01-13T08:05:00.405389+00:00 heroku[scheduler.8317]: State changed from up to complete
2020-01-13T08:05:00.388323+00:00 heroku[scheduler.8317]: Process exited with status 0
2020-01-13T08:11:47.920968+00:00 app[api]: Starting process with command `node src/spiders/clusters/auctionMacro.js` by user scheduler@addons.heroku.com
2020-01-13T08:12:07.550850+00:00 heroku[scheduler.6321]: Starting process with command `node src/spiders/clusters/auctionMacro.js`
2020-01-13T08:12:08.164915+00:00 heroku[scheduler.6321]: State changed from starting to up
2020-01-13T08:12:11.948713+00:00 app[scheduler.6321]: states { NV: { isCurrent: true } }
2020-01-13T08:12:11.952327+00:00 app[scheduler.6321]: stats { statesAttempted: NumericIncrementTransform { operand: 1 } }
2020-01-13T08:12:11.953455+00:00 app[scheduler.6321]: Updated new current state: NV
2020-01-13T08:12:12.048217+00:00 app[scheduler.6321]: Transaction success!
2020-01-13T08:12:14.546493+00:00 heroku[scheduler.6321]: State changed from up to complete
2020-01-13T08:12:14.527259+00:00 heroku[scheduler.6321]: Process exited with status 0
2020-01-13T08:18:23.000000+00:00 app[api]: Build started by user qquestlive@gmail.com
2020-01-13T08:20:37.547496+00:00 app[api]: Release v12 created by user qquestlive@gmail.com
2020-01-13T08:20:37.547496+00:00 app[api]: Deploy c623dfdf by user qquestlive@gmail.com
2020-01-13T08:21:01.000000+00:00 app[api]: Build succeeded
2020-01-13T08:21:02.059592+00:00 app[api]: Starting process with command `node src/spiders/clusters/auctionMacro.js` by user scheduler@addons.heroku.com
2020-01-13T08:21:16.659323+00:00 heroku[scheduler.5323]: Starting process with command `node src/spiders/clusters/auctionMacro.js`
2020-01-13T08:21:17.438843+00:00 heroku[scheduler.5323]: State changed from starting to up
2020-01-13T08:21:19.578502+00:00 app[scheduler.5323]: states { MD: { isCurrent: true } }
2020-01-13T08:21:19.580525+00:00 app[scheduler.5323]: stats { statesAttempted: NumericIncrementTransform { operand: 1 } }
2020-01-13T08:22:19.235767+00:00 app[scheduler.5323]: Transaction failure: Error: 10 ABORTED: Too much contention on these documents. Please try again.
2020-01-13T08:22:19.235819+00:00 app[scheduler.5323]: at Object.callErrorFromStatus (/app/node_modules/@grpc/grpc-js/build/src/call.js:30:26)
2020-01-13T08:22:19.235822+00:00 app[scheduler.5323]: at Http2CallStream.<anonymous> (/app/node_modules/@grpc/grpc-js/build/src/client.js:96:33)
2020-01-13T08:22:19.235824+00:00 app[scheduler.5323]: at Http2CallStream.emit (events.js:214:15)
2020-01-13T08:22:19.235826+00:00 app[scheduler.5323]: at /app/node_modules/@grpc/grpc-js/build/src/call-stream.js:97:22
2020-01-13T08:22:19.235829+00:00 app[scheduler.5323]: at processTicksAndRejections (internal/process/task_queues.js:75:11) {
2020-01-13T08:22:19.235831+00:00 app[scheduler.5323]: code: 10,
2020-01-13T08:22:19.235833+00:00 app[scheduler.5323]: details: 'Too much contention on these documents. Please try again.',
2020-01-13T08:22:19.235835+00:00 app[scheduler.5323]: metadata: Metadata { internalRepr: Map {}, options: {} }
2020-01-13T08:22:19.235837+00:00 app[scheduler.5323]: }
2020-01-13T08:22:19.421661+00:00 heroku[scheduler.5323]: State changed from up to complete
2020-01-13T08:22:19.405270+00:00 heroku[scheduler.5323]: Process exited with status 0
2020-01-13T08:32:56.775446+00:00 app[api]: Starting process with command `node src/spiders/clusters/auctionMacro.js` by user scheduler@addons.heroku.com
2020-01-13T08:33:12.863414+00:00 heroku[scheduler.6507]: Starting process with command `node src/spiders/clusters/auctionMacro.js`
2020-01-13T08:33:13.507175+00:00 heroku[scheduler.6507]: State changed from starting to up
2020-01-13T08:33:15.815065+00:00 app[scheduler.6507]: states { NY: { isCurrent: true } }
2020-01-13T08:33:15.817216+00:00 app[scheduler.6507]: stats { statesAttempted: NumericIncrementTransform { operand: 1 } }
2020-01-13T08:34:15.467729+00:00 app[scheduler.6507]: Transaction failure: Error: 10 ABORTED: Too much contention on these documents. Please try again.
2020-01-13T08:34:15.467788+00:00 app[scheduler.6507]: at Object.callErrorFromStatus (/app/node_modules/@grpc/grpc-js/build/src/call.js:30:26)
2020-01-13T08:34:15.467791+00:00 app[scheduler.6507]: at Http2CallStream.<anonymous> (/app/node_modules/@grpc/grpc-js/build/src/client.js:96:33)
2020-01-13T08:34:15.467794+00:00 app[scheduler.6507]: at Http2CallStream.emit (events.js:214:15)
2020-01-13T08:34:15.467797+00:00 app[scheduler.6507]: at /app/node_modules/@grpc/grpc-js/build/src/call-stream.js:97:22
2020-01-13T08:34:15.467799+00:00 app[scheduler.6507]: at processTicksAndRejections (internal/process/task_queues.js:75:11) {
2020-01-13T08:34:15.467801+00:00 app[scheduler.6507]: code: 10,
2020-01-13T08:34:15.467803+00:00 app[scheduler.6507]: details: 'Too much contention on these documents. Please try again.',
2020-01-13T08:34:15.467805+00:00 app[scheduler.6507]: metadata: Metadata { internalRepr: Map {}, options: {} }
2020-01-13T08:34:15.467807+00:00 app[scheduler.6507]: }
2020-01-13T08:34:15.543100+00:00 heroku[scheduler.6507]: State changed from up to complete
2020-01-13T08:34:15.528016+00:00 heroku[scheduler.6507]: Process exited with status 0