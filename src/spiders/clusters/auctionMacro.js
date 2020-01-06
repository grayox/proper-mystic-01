// https://github.com/thomasdondorf/puppeteer-cluster
// https://stackoverflow.com/a/51989560
// https://stackoverflow.com/a/50049555

// example:
// https://github.com/thomasdondorf/puppeteer-cluster/blob/master/examples/alexa-1m.js

// You need to download the Alexa 1M from http://s3.amazonaws.com/alexa-static/top-1m.csv.zip
// and unzip it into this directory

const { Cluster } = require('puppeteer-cluster');
const puppeteer = require('puppeteer'); // npm i puppeteer -s

const auctionList = require('./auctionList');
const states = require('../../lib/geoData/states.json');
// const isScheduled = require('../../util/scheduler');

const getDb = require('./getDb');
const todayDate = require('../../util/todayDate');
const db = getDb();
const {
  todaysDayOfTheMonth, todaysMonthOneIndex, todaysYear, // timestamp, todaysMonth, todaysDate,
} = todayDate;
const formattedDate = [ todaysYear, todaysMonthOneIndex, todaysDayOfTheMonth, ].join('-'); // '2020-01-05'

// start here
const scriptName = 'auctionMacro'; // node auctionMacro
// calls auctionList.js

const MAX_CONCURRENCY = 5;
const options = { 
  slowMo: 1000,
  // headless: false,
};

const runTransaction = () => {

  // Initialize document
  const statRef = db.collection('stats').doc(formattedDate);
  const setStat = statRef.set({
    name: 'San Francisco',
    state: 'CA',
    country: 'USA',
    capital: false,
    population: 860000
  });
  
  const transaction = db.runTransaction(t => {
    return t.get(statRef)
      .then(doc => {
        // Add one person to the city population.
        // Note: this could be done without a transaction
        //       by updating the population using FieldValue.increment()
        let newPopulation = doc.data().population + 1;
        t.update(statRef, {population: newPopulation});
      });
  }).then(result => {
    console.log('Transaction success!');
  }).catch(err => {
    console.log('Transaction failure:', err);
  });

}

(async () => {
  // schedule it
  // if(!isScheduled(scriptName)) return;

  runTransaction(); return;

  // ref: https://github.com/GoogleChrome/puppeteer
  // cheatsheet: https://nitayneeman.com/posts/getting-to-know-puppeteer-using-practical-examples/
  // forms: https://stackoverflow.com/questions/45778181/puppeteer-how-to-submit-a-form
  const browser = await puppeteer.launch(options);

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
  
  const inventory = null; // await getDbInventory(db);
  
  const { asArray: statesArray, } = states;
  const length = statesArray.length;
  // const i = 15;
  // let i = length;
  let i = 15; while(i--) {
    const state = statesArray[i];
    const { variant, abbreviation, } = state;
    const item = { inventory, abbreviation, };
    // console.log('variant', variant,);
    // console.log('abbreviation', abbreviation,);
    if ( variant === 'state' ) cluster.queue( item, auctionList, ); // ref: https://github.com/thomasdondorf/puppeteer-cluster/blob/master/examples/function-queuing-complex.js
  }

  await cluster.idle();
  await cluster.close();
})();