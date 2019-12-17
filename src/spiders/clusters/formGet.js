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

const scriptName = 'formGet';

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
      value: false,
    },
  ],
}

// const selector = 'a';
// const selector = 'form > *';
// const selector = 'form input';
const selector = 'form label';
const MAX_CONCURRENCY = 5;

const joiner = '.';
const prefix = 'http://www';
const waiter = { waitUntil: 'domcontentloaded', };

const dbConfig = {
  source: 'form-get',
  formFieldList: {
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
  // const target = 'contact';
  // const attribute = 'href';
  // const attribute = 'class';
  // const attribute = 'name';
  // const attribute = 'type';
  const attribute = 'htmlFor';
  // const attribute = '*';
  const out = [];
  const length = items.length;
  let i = length; while(i--) {
    const item = items[i];
    const value = item[attribute];
    // const attrs = item.attributes;
    // const jLength = attrs.length;
    // let j = jLength; while(j--) {
    //   attr = attrs[j];
    //   const { name, value, } = attr;
    //   out.push({ name, value, });
    //   // out.push(attr.name);
    //   // out.push(attr.value);
    //   // out.push(JSON.stringify(attr));
    // }
    // console.log( 'item', item, );
    // console.log( 'value', value, ); debugger;
    // const lowerCaseValue = value.toLowerCase();
    // if(lowerCaseValue.includes(target)) out.push(value);
    // out.push(value);
    // out.push(item);
    // out.push(attrs);
    // out.push(`${item.textContent}:${value}`);
    // out.push(item.textContent);
    out.push({
      label: item.textContent,
      id: value, // undefined
    });
  }
  return out;
}

(async () => {
  // schedule it
  // if(!isScheduled(scriptName)) return;

  // fetching a list from a doc
  // // [START] fetch data
  // // ref: https://firebase.google.com/docs/firestore/query-data/get-data#get_a_document
  // admin.initializeApp({
  //   credential: admin.credential.cert(serviceAccount)
  // });
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
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  const db = admin.firestore();
  const collectionRef = db.collection(collection);
  const query = await collectionRef
    // .where('capital', '==', true)
    // .where( 'hasContactUrls', '==', false, )
    // .where( field, operator, value, )
    .where( filters[0].field, filters[0].operator, filters[0].value, )
    .where( filters[1].field, filters[1].operator, filters[1].value, )
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

    // // [BEGIN] write to db
    // const dbData = {
    //   // url, contactUrlList: values,
    //   url, formFieldList: values,
    // };
    // write2db({ dbConfig, data: dbData, });
    // // [END] write to db
    
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
  // const domains = query.map( ({domain, contactUrlList,},) => { domain, contactUrlList,);
  const length = domains.length;
  let i = length; while(i--) {
    const domain = domains[i];
    cluster.queue([ prefix, domain, ].join(joiner));
  }
  
  await cluster.idle();
  await cluster.close();
})();