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
const isScheduled = require('../../util/scheduler');

// const getDb = require('../../lib/db/getDb');
// const db = getDb();

// start here
const scriptName = 'auctionMacro';
// calls auctionList.js

const MAX_CONCURRENCY = 5;
const options = { 
  slowMo: 1000,
  // headless: false,
};

const getDbInventory = db => {

  // date calculations
  const maxDaysToGoBack = 5;
  const milSecMultiplier = 1000 * 60 * 60 * 24;
  const timestamp = Date.now();
  // timestamp
  const offset = maxDaysToGoBack * milSecMultiplier;
  // offset
  const minDate = timestamp - offset;
  // minDate
  
  // const collection = 'markets';
  // const doc = 'us-va-richmond';
  const queryFilter = {
    collection: 'inventory',
    limit: 25,
    filters: [
      // // {
      // //   field: 'isTest',
      // //   operator: '==',
      // //   value: true,
      // // },
      // {
      //   field: 'isActive',
      //   operator: '==',
      //   value: true,
      // }, {
      //   field: 'timestamp',
      //   operator: '>',
      //   value: minDate,
      // },
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
  const { collection, filters, limit, } = queryFilter;
  const collectionRef = db.collection(collection);
  const query = collectionRef
    // // .where('capital', '==', true)
    // // .where( 'hasContactUrls', '==', false, )
    // // .where( field, operator, value, )
    // .where( filters[0].field, filters[0].operator, filters[0].value, )
    // .where( filters[1].field, filters[1].operator, filters[1].value, )
    // // .where( filters[2].field, filters[2].operator, filters[2].value, )
    // // // order and limit data
    // // // https://firebase.google.com/docs/firestore/query-data/order-limit-data#order_and_limit_data
    // // .orderBy('name')
    // // .limit(3)
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

(async () => {
  // schedule it
  // if(!isScheduled(scriptName)) return;

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