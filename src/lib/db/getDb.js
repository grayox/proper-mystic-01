// Initialize on your own server
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAcctKey.json');

module.exports = () => {
  // ref: https://stackoverflow.com/a/57764002
  if ( !admin.apps.length ) {
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
  return db;
}
// // use:
// const getDb = require('./getDb');
// const db = getDb();