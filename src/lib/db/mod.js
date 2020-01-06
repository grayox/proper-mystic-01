// modifies existing records in the database

const write2db = require('./write2firestore');
const getDb = require('./getDb');
const db = getDb();

const collection = 'domains';

const dbConfig = {
  source: 'mod',
  modList: {
    // // copy the collection labeled 'domains' and name the new collection 'domains1'
    // collection: 'domains1',
    // create a new field for existing docs:
    //   domains.id123.{...} => domains.id123.{..., hasContactUrls: false,}
    // update fields in existing docs:
    //   'https://www.advancetosold.com/contact-us/' => 'contact-us'
    collection: 'domains',
    // separator: collection above this line, doc below
    // doc: formattedDomain, (later)
  }
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

(async () => {

  // [START] fetch data
  // ref: https://firebase.google.com/docs/firestore/query-data/get-data#get_multiple_documents_from_a_collection
  const collectionRef = db.collection(collection);
  const query = await collectionRef
    // .where('capital', '==', true)
    // .where( 'hasContactUrls', '==', false, )
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

  // const data = {
  //   url, hasContactUrls: false,
  // };
  // write2db({ dbConfig, data, });
  write2db({ dbConfig, data: {modQuery: query,}, });

})();