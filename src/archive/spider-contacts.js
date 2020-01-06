// source ref: https://pptr.dev
// try all contact pages: example.com/contact-us and similar domain children

const puppeteer = require('puppeteer');
const forms = require('../../lib/forms.json');
const getDb = require('../../lib/db/getDb');
const db = getDb();

const collection = 'markets';
const doc = 'us-va-richmond';

// const joiner1 = '/';
const joiner2 = '://';
// const contactExtensions = forms.contact;

const waitUntilLoad = {
  waitUntil: 'load',
};

// A function to be evaluated by Puppeteer within the browser context.
const pageFunction = $posts => { // $posts.map( $post => $post.href )
  const data = [];
  $posts.forEach( $post =>
    {
    // data.push({
    //   title: $post.querySelector('.title a').innerText,
    //   rank: $post.querySelector('.rank').innerText,
    //   href: $post.querySelector('.title a').href,
    // });
    // data.push($post.name);
    if( $post.href.toLowerCase().includes('contact') ) data.push( $post.href );
  });
  return data;
}

(async () => {

  // process.on('warning', (warning) => {
  //   console.warn(warning.name);    // Print the warning name
  //   console.warn(warning.message); // Print the warning message
  //   console.warn(warning.stack);   // Print the stack trace
  // });

  // [START] fetch data
  // ref: https://firebase.google.com/docs/firestore/query-data/get-data#get_a_document
  const marketRef = db.collection(collection).doc(doc);
  const domains = await marketRef.get()
    .then( doc => {
      if( !doc.exists ) {
        console.log('No such document!');
      } else {
        const data = doc.data();
        // console.log('Document data:', data,);
        const { domainList, } = data;
        return domainList;
      }
    })
    .catch( err => {
      console.log('Error getting document', err);
    });
  // console.log('domains', domains,);
  // return;
  // [END] fetch data

  // start browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // loop over domains
  const promises = await domains.slice(0, 5).forEach( async domain => {
    console.log( 'domain', domain, );
    // const url = [ 'www', domain, ].join('.')
    const url = [ 'http', domain, ].join(joiner2);
    // await page.goto( url, );
    await page.goto( url, waitUntilLoad, );
    // const hrefs = await page.$$eval( 'a', a => a.href, );
    const hrefs = await page.$$eval( 'a', pageFunction, );
    console.log('hrefs', hrefs,);
    return hrefs;

    // // loop over contact extensions
    // const exts = [ null, ...contactExtensions, ];
    // exts.forEach( async ext => {
    //   const a = [ domain, ext, ];
    //   // url tries every contact page of format example.com/<contact-us>
    //   const url = ext ? a.join(joiner) : domain;
    //   console.log('url', url,);

    //   // // navigate to target page
    //   // // await page.goto('https://example.com');
    //   // await page.goto(url);
    //   // // await page.screenshot({path: 'example.png'});
      
    //   // const data = await page.$$eval( 'form input', pageFunction, );
    //   // console.log('data', data,);
    // }); 
  });
  const out = await Promise.all(promises);
  console.log( 'out', out, );
  await browser.close();
})();