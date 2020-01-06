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
const serviceAccount = require('../../lib/db/serviceAcctKey.json');
const write2db = require('../../lib/db/write2firestore');
const isScheduled = require('../../util/scheduler');

// const getDb = require('./getDb');
// const db = getDb();

const scriptName = 'contact';

// const collection = 'markets';
// const doc = 'us-va-richmond';
const queryFilter = {
  collection: 'domains',
  field: 'hasContactUrls',
  operator: '==',
  value: false,
  limit: 200,
}

const selector = 'a';
const MAX_CONCURRENCY = 5;

const joiner = '.';
const prefix = 'http://www';
const waiter = { waitUntil: 'domcontentloaded', };

const dbConfig = {
  source: 'contact',
  contactUrlList: {
    collection: 'domains',
    // doc: formattedDomain, (later)
  },
  // source: 'auction',
  // inventoryList: {
  //   collection: 'inventory',
  //   // doc: getLocationIndex(config), // 'us-va-virginia-beach'
  // },
  // parsedUrls: {
  //   collection: 'domains',
  //   // docs: , // domainList (later)
  // },
};

const pageFunction = items => { // items.length;
  const attribute = 'href';
  const target = 'contact';
  const out = [];
  const length = items.length;
  let i = length; while(i--) {
    const item = items[i];
    const value = item[attribute];
    const lowerCaseValue = value.toLowerCase();
    if(lowerCaseValue.includes(target)) out.push(value);
  }
  return out;
}

(async () => {
  // schedule it
  if(!isScheduled(scriptName)) return;

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
  const { collection, field, operator, value, limit, } = queryFilter;
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  const db = admin.firestore();
  const collectionRef = db.collection(collection);
  const query = await collectionRef
    // .where('capital', '==', true)
    // .where( 'hasContactUrls', '==', false, )
    .where( field, operator, value, )
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
    // return;
  // [END] fetch data

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: MAX_CONCURRENCY,
    monitor: true,
    // timeout: 30000, // 30000 default
  });

  // // Extracts document.title of the crawled pages
  // await cluster.task(async ({ page, data: url }) => {
  //   await page.goto(url, { waitUntil: 'domcontentloaded' });
  //   const pageTitle = await page.evaluate(() => document.title);
  //   console.log(`Page title of ${url} is ${pageTitle}`);
  // });
  // Extract a.hrefs of the crawled pages
  await cluster.task(async ({ page, data: url }) => {
    await page.goto( url, waiter, );
    // const pageTitle = await page.evaluate(() => document.title);
    // const values = await page.$$eval( selector, items => items.length, );
    const values = await page.$$eval( selector, pageFunction, );
    console.log( url, values, );

    // [BEGIN] write to db
    const dbData = {
      url, contactUrlList: values,
    };
    write2db({ dbConfig, data: dbData, });
    // [END] write to db
    
  });

  // In case of problems, log them
  cluster.on('taskerror', (err, data,) => {
    console.log(`  Error crawling ${data}: ${err.message}`);
  });

  // // Read the top-1m.csv file from the current directory
  // const csvFile = await fs.readFile(__dirname + '/top-1m.csv', 'utf8');
  // const lines = csvFile.split('\n');
  // for (let i = 0; i < lines.length; i++) {
  //   const line = lines[i];
  //   const splitterIndex = line.indexOf(',');
  //   if (splitterIndex !== -1) {
  //     const domain = line.substr(splitterIndex + 1);
  //     // queue the domain
  //     cluster.queue('http://www.' + domain);
  //   }
  // }
  const domains = query.map( ({domain,},) => domain );
  const length = domains.length;
  let i = length; while(i--) {
    const domain = domains[i];
    cluster.queue([ prefix, domain, ].join(joiner));
  }
  
  await cluster.idle();
  await cluster.close();
})();