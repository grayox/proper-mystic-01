// inspired by: https://www.datasciencecentral.com/profiles/blogs/web-scraping-with-a-headless-browser-a-puppeteer-tutorial
// (corrective edits to above code are necessary)
// // ref: https://pptr.dev
const puppeteer = require('puppeteer');
const config = require('./config');

// script name: detail.js

const options = {
  // slowMo: 500,
  // headless: false,
  waitUntil: 'load',
};
// ref: https://stackoverflow.com/a/58298172/1640892
// const waitUntilDocumentLoaded = { waitUntil: 'domcontentloaded', };

// const run = () =>
module.exports = ({ source, url, }) =>
  new Promise(async ( resolve, reject, ) => {
    try {

      // destructure and assign
      configSource = config[source];
      const { iframe, } = configSource;

      // startup
      const browser = await puppeteer.launch( options, );
      let page = await browser.newPage();
      // const navigationPromise = page.waitForNavigation(waitUntilDocumentLoaded);
      await page.goto( url, );
      // navigationPromise;

      // iframe
      if( iframe ) {
        await page.waitForSelector( iframe, );
        const iframeElement = await page.$( iframe, );
        page = await iframeElement.contentFrame();
      }
      
      // evaluate and resolve
      const pageData = await page.evaluate( config => {
        const { selectors, } = config;
        const result =  {};
        for( const property in selectors ) {
          try {
            const { selector, attribute, } = selectors[ property ];
            result[ property ] = document.querySelector( selector, )[ attribute ];
          } catch (e) {
            console.log(e);
          }
        }
        return result;
      }, configSource, );
      browser.close();
      return resolve( pageData, );
    } catch( error ) {
      return reject( error, );
    }
  })
// run().then(result => console.log('result\n', result,)).catch(console.error);