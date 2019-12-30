// https://github.com/thomasdondorf/puppeteer-cluster
// https://stackoverflow.com/a/51989560
// https://stackoverflow.com/a/50049555

// example:
// https://github.com/thomasdondorf/puppeteer-cluster/blob/master/examples/alexa-1m.js

// You need to download the Alexa 1M from http://s3.amazonaws.com/alexa-static/top-1m.csv.zip
// and unzip it into this directory

const { Cluster } = require('puppeteer-cluster');
// const puppeteer = require('puppeteer');

const admin = require('firebase-admin');
const postDetail = require('./postDetail'); // posts to form
const serviceAccount = require('../../lib/db/serviceAcctKey.json');
// const write2db = require('../../lib/db/write2firestore');
const isScheduled = require('../../util/scheduler');

const scriptName = 'formPost';

const MAX_CONCURRENCY = 5;

const getDbDomains = async db => {

  // date calculations
  const daysToGoBack = 5;
  const milSecMultiplier = 1000 * 60 * 60 * 24;
  const timestamp = Date.now();
  // timestamp
  const offset = daysToGoBack * milSecMultiplier;
  // offset
  const maxDate = timestamp - offset;
  // maxDate
  
  // const collection = 'markets';
  // const doc = 'us-va-richmond';
  const queryFilter = {
    collection: 'domains',
    limit: 25,
    filters: [
      // {
      //   field: 'isTest',
      //   operator: '==',
      //   value: true,
      // },
      {
        field: 'hasContactUrls',
        operator: '==',
        value: true,
      }, {
        field: 'hasFormFields',
        operator: '==',
        value: true,
      }, {
        field: 'latestPosting',
        operator: '<',
        value: maxDate,
      },
    ],
  }

  // fetching a list from a doc
  // // [START] fetch data
  // // ref: https://firebase.google.com/docs/firestore/query-data/get-data#get_a_document
  // // ref: https://stackoverflow.com/a/57764002
  // if (!admin.apps.length) {
  //   // try {
  //     admin.initializeApp({
  //       credential: admin.credential.cert(serviceAccount),
  //       // databaseURL: dB_URL,
  //     });
  //   // } catch(error) {
  //   //   console.log('error', error.message,);
  //   // }
  // }
  // const db = admin.firestore();
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
  const query = await collectionRef
    // .where('capital', '==', true)
    // .where( 'hasContactUrls', '==', false, )
    // .where( field, operator, value, )
    .where( filters[0].field, filters[0].operator, filters[0].value, )
    .where( filters[1].field, filters[1].operator, filters[1].value, )
    // .where( filters[2].field, filters[2].operator, filters[2].value, )
    // // order and limit data
    // // https://firebase.google.com/docs/firestore/query-data/order-limit-data#order_and_limit_data
    // .orderBy('name')
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

const getDbInventory = async db => {
  const queryFilter = {
    collection: 'inventory',
    limit: 1,
    filters: [
      // {
      //   field: 'isTest',
      //   operator: '==',
      //   value: true,
      // },
      // {
      //   field: 'hasContactUrls',
      //   operator: '==',
      //   value: true,
      // }, {
      //   field: 'hasFormFields',
      //   operator: '==',
      //   value: true,
      // }, {
      //   field: 'latestPosting',
      //   operator: '<',
      //   value: maxDate,
      // },
    ],
  };
  const { collection, filters, limit, } = queryFilter;
  const collectionRef = db.collection(collection);
  const query = await collectionRef
    // .where('capital', '==', true)
    // .where( 'hasContactUrls', '==', false, )
    // .where( field, operator, value, )
    // .where( filters[0].field, filters[0].operator, filters[0].value, )
    // .where( filters[1].field, filters[1].operator, filters[1].value, )
    // .where( filters[2].field, filters[2].operator, filters[2].value, )
    // // order and limit data
    // // https://firebase.google.com/docs/firestore/query-data/order-limit-data#order_and_limit_data
    // .orderBy('name')
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
  
    return query;
}

const getDbContactDetails = async db => {
  const queryFilter = {
    collection: 'contacts',
    limit: 1,
    filters: [
      // {
      //   field: 'isTest',
      //   operator: '==',
      //   value: true,
      // },
      // {
      //   field: 'hasContactUrls',
      //   operator: '==',
      //   value: true,
      // }, {
      //   field: 'hasFormFields',
      //   operator: '==',
      //   value: true,
      // }, {
      //   field: 'latestPosting',
      //   operator: '<',
      //   value: maxDate,
      // },
    ],
  };
  const { collection, filters, limit, } = queryFilter;
  const collectionRef = db.collection(collection);
  const query = await collectionRef
    // .where('capital', '==', true)
    // .where( 'hasContactUrls', '==', false, )
    // .where( field, operator, value, )
    // .where( filters[0].field, filters[0].operator, filters[0].value, )
    // .where( filters[1].field, filters[1].operator, filters[1].value, )
    // .where( filters[2].field, filters[2].operator, filters[2].value, )
    // // order and limit data
    // // https://firebase.google.com/docs/firestore/query-data/order-limit-data#order_and_limit_data
    // .orderBy('name')
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
  
    return query;
}

(async () => {
  // schedule it
  // if(!isScheduled(scriptName)) return;

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: MAX_CONCURRENCY,
    monitor: true,
    // timeout: 30000, // 30000 default
  });

  // In case of problems, log them
  cluster.on('taskerror', ( err, data, ) => {
    console.log(`Error crawling ${data}: ${err.message}`);
  });
  
  // ref: https://stackoverflow.com/a/57764002
  if (!admin.apps.length) {
    // try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // databaseURL: dB_URL,
      });
    // } catch(error) {
    //   console.log('error', error.message,);
    // }
  }
  const db = admin.firestore();
  const queryDomains = getDbDomains(db);
  const queryInventory = getDbInventory(db);
  const queryContactDetails = getDbContactDetails(db);
  const queryData = await Promise.all([ queryDomains, queryInventory, queryContactDetails, ])
    .then( values => values );

  // console.log('queryData', queryData,); // return;
  const [ queryDomainsArray, queryInventoryArray, queryContactDetailsArray, ] = queryData; // queryDomains,
  
  // // for prior versions, see formGet
  const length = queryDomainsArray.length;
  // console.log('length', length,);
  // console.log('typeof cluster', typeof cluster,);
  let i = length; while(i--) {
    const queryDomain = queryDomainsArray[i];
    const queryInventory = queryInventoryArray[0];
    const queryContactDetails = queryContactDetailsArray[0];
    // console.log('typeof queryDomain', typeof queryDomain,);
    // console.log('typeof queryInventory', typeof queryInventory,);
    // console.log('typeof queryContactDetails', typeof queryContactDetails,);
    const item = { queryDomain, queryInventory, queryContactDetails, };
    // console.log('item', JSON.stringify(item),);
    cluster.queue( item, postDetail, ); // ref: https://github.com/thomasdondorf/puppeteer-cluster/blob/master/examples/function-queuing-complex.js
  }

  await cluster.idle();
  await cluster.close();
})();