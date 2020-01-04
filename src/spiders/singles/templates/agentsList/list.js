// inspired by: https://www.datasciencecentral.com/profiles/blogs/web-scraping-with-a-headless-browser-a-puppeteer-tutorial
// (corrective edits to above code are necessary)
const puppeteer = require('puppeteer');
const config = require('./config');

const options = {
  slowMo: 500,
  headless: false,
  waitUntil: 'load',
};
// ref: https://stackoverflow.com/a/58298172/1640892
// const waitUntilDocumentLoaded = { waitUntil: 'domcontentloaded', };

// const run = () =>
module.exports = ({ source, term, city, state, zip, county, }) =>
  new Promise(async ( resolve, reject, ) => {
    try {

      // destructure and assign
      configSource = config[source];
      const { getUrl, iframe, select, type, click, recaptcha, } = configSource;
      const { selector: selectSelector, value: selectValue, } = select;
      const { selector: typeSelector, text: typeText, } = type;

      // startup
      const browser = await puppeteer.launch( options );
      let page = await browser.newPage();
      // const navigationPromise = page.waitForNavigation(waitUntilDocumentLoaded);
      const url = getUrl({ city, state, zip, county, term, });
      await page.goto( url, );
      // navigationPromise;

      // iframe
      if( iframe ) {
        await page.waitForSelector( iframe, );
        const iframeElement = await page.$( iframe, );
        page = await iframeElement.contentFrame();
      }
 
      // select
      // await page.select('#telCountryInput', 'my-value')
      if( select ){
        await page.waitForSelector( selectSelector, ); // ( , { timeout: 60000, })
        await page.select( selectSelector, selectValue, );
      }

      // type
      // await page.type('input#js-site-search-input', searchTerm,);
      if( type ) {
        await page.waitForSelector( typeSelector, );
        await page.type( typeSelector, typeText, );
      }
      
      // press
      // await page.keyboard.press('Enter');
          
      // click
      // await page.click('button.mobile__nav__row--btn-search');
      if( click ) {
        await page.waitForSelector( click, ); // ( , { timeout: 60000, })
        await page.click( click, );
      } 
      
      // recaptcha
      if( recaptcha ){
        await page.waitForSelector( recaptcha, ); // ( , { timeout: 60000, })
        await page.click( recaptcha, );
      }
      
      // evaluate and resolve
      const pageData = await page.evaluate( config => {
        const { selectors, } = config;
        const { items: itemsSelector, item: itemConfig, } = selectors;
        const results = [];
        const items = document.querySelectorAll( itemsSelector, );
        items.forEach( item => {
          const newData = {};
          for (const property in itemConfig) {
            try {
              const { selector, attribute, } = itemConfig[ property ];
              newData[ property ] = item.querySelector( selector, )[ attribute ];
            } catch (e) {
              console.log(e);
            }
          }
          results.push( newData, );
        });
        return results;
      }, configSource, );
      browser.close();
      return resolve( pageData, );
    } catch ( error ) {
      return reject( error, );
    }
  })
// run().then(result => console.log('result\n', result,)).catch(console.error);