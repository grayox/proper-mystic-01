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

// const isScheduled = require('../../util/scheduler');
const getAgents = require('./getAgents');

const getDb = require('../../../../lib/db/getDb');
const todayDate = require('../../../../util/todayDate');
const write2db = require('../../../../lib/db/write2firestore');

// increment counters
// ref: https://firebase.google.com/docs/firestore/manage-data/add-data#increment_a_numeric_value
// ref: https://fireship.io/snippets/firestore-increment-tips/
const admin = require('firebase-admin');
const incrementer = admin.firestore.FieldValue;
const db = getDb();
// const { formattedDate, } = todayDate;

// start here
const scriptName = 'agentsMacro'; // node agentsMacro
// calls agentsMacro.js

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
const term = 'real estate agents';
const sources = [ 'yelp', 'bpo', 'hud', 'homePath', 'realtor', 'yellow', ];
const stateInitObject = {
  isActive: true, // all states not yet scraped today
  isCurrent: false, // current state to scrape
  pagesAttempted: 0, // total pages attempted to be scraped
  pagesCount: 0, // total count of pages with data we successfully captured
  itemsCount: 0, // total number of items captured from pages with data
  currentItems: 0, // total number of captured items that are current
};

// // do not change
// const PAGE_INCREMENT = 1;

// const dbConfig = {
//   source: 'agentsBot',
//   stats: {
//     collection: 'stats',
//     doc: formattedDate,
//   },
//   states: {
//     collection: 'states',
//     doc: formattedDate,
//   },
// };

const getTargetProperty = async () => {

  // const collection = 'markets';
  // const doc = 'us-va-richmond';
  const queryFilter = {
    collection: 'inventory',
    limit: 1,
    orderBy: 'formattedDate',
    filters: [
      {
        field: 'hasAgent',
        operator: '==',
        value: false,
      // }, {
      //   field: 'formattedDate',
      //   operator: '==',
      //   value: formattedDate,
      // }, {
      //   field: 'latestPosting',
      //   operator: '<',
      //   value: maxDate,
      },
    ],
  }

  // fetching a list from a doc
  // // [START] fetch data
  // // ref: https://firebase.google.com/docs/firestore/query-data/get-data#get_a_document
  // const marketRef = db
  //   .collection(collection)
  //   .doc(doc);
  // const domains = await marketRef.get()
  //   .then( doc => {
  //     if (!doc.exists) {
  //       console.log('No such document!');
  //     } else {
  //       const data = doc.data();
  //       // console.log('Document data:', data,);
  //       const { domainList, } = data;
  //       return domainList;
  //     }
  //   })
  //   .catch(err => {
  //     console.log('Error getting document', err);
  //   });
  // // console.log('domains', domains,);
  // // return;
  // // [END] fetch data

  // fetching a collection subset with a query
  // [START] fetch data
  // ref: https://firebase.google.com/docs/firestore/query-data/get-data#get_multiple_documents_from_a_collection
  // const { collection, field, operator, value, limit, } = queryFilter;
  const { collection, filters, limit, orderBy, } = queryFilter;
  const collectionRef = db.collection(collection);
  const query = await collectionRef
    // .where('capital', '==', true)
    // .where( 'hasContactUrls', '==', false, )
    // .where( field, operator, value, )
    .where( filters[0].field, filters[0].operator, filters[0].value, )
    // .where( filters[1].field, filters[1].operator, filters[1].value, )
    // .where( filters[2].field, filters[2].operator, filters[2].value, )
    // // order and limit data
    // // https://firebase.google.com/docs/firestore/query-data/order-limit-data#order_and_limit_data
    // .orderBy('name')
    .orderBy( orderBy, 'desc', )
    // .limit(3)
    .limit(limit)
    .get()
    .then( snapshot => {
      if (snapshot.empty) {
        console.log('No matching documents.');
        return;
      }
      const out = [];
      snapshot.forEach( doc => {
        // console.log( doc.id, '=>', doc.data() );
        out.push( doc.data() );
      });
      // const out = snapshot.map( doc => doc.data() ); // .map() not a function
      return out;
    })
    .catch( err => {
      console.log('Error getting documents', err,);
    });
    // console.log( 'query', query, );
    // console.log( 'query', JSON.stringify(query, null, 2,), );
    // return;
  // [END] fetch data
  return query;
}

( async () => {
  // schedule it
  // if(!isScheduled(scriptName)) return;

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
  
  const queryTargetProperty = await getTargetProperty();
  // console.log( 'queryTargetProperty', queryTargetProperty, );
  const targetProperty = queryTargetProperty[0];
  // console.log( 'targetProperty', targetProperty, );
  const {
    listCity: city, listState: state, listZip: zip, listCounty: county,
  } = targetProperty;
  const config = { term, city, state, zip, county, };
  // console.log( 'config', config, );
  
  const length = sources.length;
  // console.log('length', length,);
  // console.log('typeof cluster', typeof cluster,);
  let i = length; while(i--) {
    const source = sources[i];
    config.source = source;
    // console.log('config', config,);
    cluster.queue( config, getAgents, ); // ref: https://github.com/thomasdondorf/puppeteer-cluster/blob/master/examples/function-queuing-complex.js
  }

  await cluster.idle();
  await cluster.close();
})();