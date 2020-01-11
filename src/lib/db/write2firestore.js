// documentation
// https://firebase.google.com/docs/firestore/quickstart

const _ = require('lodash'); // npm i lodash -s
const getDb = require('./getDb');
const db = getDb();

// const timestamp = Date.now();
const merge = { merge: true, };
const dot = '.';
const comma = ',';
const slash = '/';
const empty = '';

// db (structure):
// buyers: { email, domain, (markets[],) }
// inventory: { ...listData, source, url, market, }
// domains: { ...rest, email, (buyers[]), markets[], url, isCurrent, currentMarket, currentAddress, }
// markets: { index, buyers, domains, }
// emails: { id, sender, attachment, timestamp, propertyId, market, address, }
// currentForm: { domain, market, address, }

module.exports = async ({
  dbConfig,
  data: {
    // source: 'google'
    domainList=false,
    parsedUrls=false,
    // source: 'auction'
    inventoryList=false,
    states=false,
    stats=false,
    // source: 'form'
    formList=false,
    // source: 'contact'
    url=false,
    contactUrlList=false,
    // source: 'form-get'
    formFieldList=false,
    // // source: 'mod'
    // modQuery=false,
  },
}) => {

  const { source, } = dbConfig;
  
  // const docRef = db.collection(collection).doc(doc);
  // // const setData = 
  // docRef.set(data);

  // [ START batch write ]

  // ref: https://firebase.google.com/docs/firestore/manage-data/transactions#batched-writes
  // Get a new write batch
  const batch = db.batch();
  
  // // Set the value of 'NYC'
  // const nycRef = db.collection('cities').doc('NYC');
  // batch.set(nycRef, {name: 'New York City'});
  
  if(source === 'google') {
    // to engage buyers by generating lists of domains to post inventory for sale
    const locationRef = db
      .collection(dbConfig.domainList.collection) // 'markets'
      .doc(dbConfig.domainList.doc); // 'us-va-virginia-beach'
    batch.set(locationRef, { domains, }, merge,); // timestamp,
  
    domainList.forEach( domain => {
      const domainRef = db
        .collection(dbConfig.parsedUrls.collection) // 'domains'
        .doc(domain.split(dot).join(comma)); // 'www.example.com' => 'www,example,com' // to use as firebase key
      batch.update(domainRef, parsedUrls[domain], merge,);
    })
  }

  if(source === 'auction') {
    // for sourcing inventory

    if( inventoryList && Array.isArray(inventoryList) ) {
      inventoryList.forEach( item => {
        // console.log('item', item,);
        // skip entries that are not current; item === false per auctionList.js
        const ready1 = !!item;
        if(!ready1) return;
        const inventoryRef = db
          .collection(dbConfig.inventoryList.collection) // 'inventory'
          .doc(item.listDetailUrl.split(slash).slice(-1)[0]); // '255-county-club-drive-eden-nc-27288-2850751-e_13836' < 'https://www.auction.com/details/255-county-club-drive-eden-nc-27288-2850751-e_13836'
        batch.set( inventoryRef, item, merge, );
      });
    }

    if( states ) {
      console.log('states', states,);
      const statesRef = db
        .collection(dbConfig.states.collection) // 'states'
        .doc(dbConfig.states.doc); // 2020-01-19
      batch.set( statesRef, states, merge, );
    }

    if( stats ) {
      console.log('stats', stats,);
      const statsRef = db
        .collection(dbConfig.stats.collection) // 'stats'
        .doc(dbConfig.stats.doc); // 2020-01-19
      batch.set( statsRef, stats, merge, );
    }

  }

  if(source === 'form') {
    // for posting inventory to forms to solicit offers
    formList.forEach( item => {
      const formRef = db
        .collection(dbConfig.formList.collection) // 'currentForm'
        .doc(item.url); // 'rvahomebuyers,com'
      batch.set(formRef, item, merge,);
    })
  }

  if(source === 'contact') {
    // for posting urls of 'contact us' pages of given domains
    const domainArray = url.split(dot).slice(-2); // 'http://www.richmond.com' => ['richmond', 'com',]
    const domainMask = domainArray.join(comma);   // ['richmond', 'com',] => 'richmond,com'
    const unique = _.uniq(contactUrlList);
    const root = [ domain, slash, ].join(empty);
    const pruned = await unique.map( r => r.split(root)[1]);
    const contactUrlRef = db
      .collection(dbConfig.contactUrlList.collection) // 'domains'
      .doc(domainMask);
    batch.set(contactUrlRef, {
      contactUrlList: pruned,
      hasContactUrls: true,
      hasFormFields: false,
    }, merge,);
  }

  if(source === 'form-get') {
    // for posting urls of 'contact us' pages of given domains
    const domainArray = url.split(dot).slice(-2); // 'http://www.richmond.com' => ['richmond', 'com',]
    const domainMask = domainArray.join(comma);   // ['richmond', 'com',] => 'richmond,com'
    // const unique = _.uniq(contactUrlList);
    // const root = [ domain, slash, ].join(empty);
    // const pruned = await unique.map( r => r.split(root)[1]);
    const formFieldRef = db
      .collection(dbConfig.formFieldList.collection) // 'domains'
      .doc(domainMask);
    batch.set(formFieldRef, {
      // contactUrlList: pruned,
      // hasContactUrls: true,
      formFieldList,
      hasFormFields: true,
    }, merge,);
  }

  // [BEGIN] mod -- modifies existing records in the database
    
  // // copy the collection labeled 'domains' and name the new collection 'domains1'
  // // collection: 'domains1',
  // if(source === 'mod') {
  //   // modifies existing records in the database
  //   modQuery.forEach( item => {
  //     // console.log('item', item,);
  //     const queryRef = db
  //       .collection(dbConfig.modList.collection) // 'domains'
  //       .doc(item.domain.split(dot).join(comma)); // 'rvahomebuyers,com'
  //     batch.set(queryRef, item, merge,); // copies collection and duplicates every doc
  //   })
  // }
  
  // // create a new field for existing docs:
  // //   domains.id123.{...} => domains.id123.{..., hasContactUrls: false,}
  // // also:
  // //   domains.id123.{...} => domains.id123.{..., hasFormFields: false,}
  // if(source === 'mod') {
  //   modQuery.forEach( ({ domain, }) => {
  //     const queryRef = db
  //       .collection(dbConfig.modList.collection) // 'domains'
  //       .doc(domain.split(dot).join(comma)); // 'rvahomebuyers,com'
  //     // batch.set(queryRef, { hasContactUrls: false, }, merge,); // adds new field every doc
  //     batch.set(queryRef, { hasFormFields: false, }, merge,); // adds new field every doc
  //   })
  // }

  // * * * WARNING: This operation is NOT a MERGE * * *
  // // update fields in existing docs:
  // //   'https://www.advancetosold.com/contact-us/' => 'contact-us'
  // if(source === 'mod') {
  //   // modifies existing records in the database
  //   modQuery.forEach( async item => {
  //     // console.log('item', item,);
  //     const { domain, contactUrlList, } = item;
  //     const unique = _.uniq(contactUrlList);
  //     const root = [ domain, slash, ].join(empty);
  //     const pruned = await unique.map( r => r.split(root)[1]);
  //     const queryRef = db
  //       .collection(dbConfig.modList.collection) // 'domains'
  //       .doc(domain.split(dot).join(comma)); // 'rvahomebuyers,com'
  //     batch.set( queryRef, { ...item, contactUrlList: pruned, }, ); // unique // dedupes and prunes contact urls
  //   })
  // }
  // * * * WARNING: This operation is NOT a MERGE * * *

  // [END] mod -- modifies existing records in the database

  // // Update the population of 'SF'
  // const sfRef = db.collection('cities').doc('SF');
  // batch.update(sfRef, {population: 1000000});
  
  // // Delete the city 'LA'
  // const laRef = db.collection('cities').doc('LA');
  // batch.delete(laRef);
  
  // Commit the batch
  return batch.commit().then( result => {
    // console.log( 'result\n', result, );
  });

  // [ END batch write ]
}