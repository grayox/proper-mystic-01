// inspired by: https://www.datasciencecentral.com/profiles/blogs/web-scraping-with-a-headless-browser-a-puppeteer-tutorial
// (corrective edits to above code are necessary)
const puppeteer = require('puppeteer');
const config = require('./config');
const _ = require('lodash');

const waitUntilLoad = { waitUntil : 'load'             , };
// const waiter        = { waitUntil : 'domcontentloaded' , };
const options = {
  slowMo: 500,
  // headless: false,
  // ...waiter,
  ...waitUntilLoad,
};
// ref: https://stackoverflow.com/a/58298172/1640892
// const waitUntilDocumentLoaded = { waitUntil: 'domcontentloaded', };

// const run = () =>
module.exports = ({ source, term, city, state, zip, county, }) =>
  new Promise( async ( resolve, reject, ) => {
    try {
      // console.log('config', config,);
      // console.log( source, term, city, state, zip, county, );
  
      // destructure and assign
      configSource = config[source];
      const { getUrl, iframe, select={}, type={}, click, recaptcha, selectors={}, } = configSource;
      const { items: selectorsItems, item: selectorsItem, } = selectors;
      const { selector: selectSelector, value: selectValue, } = select;
      const { selector: typeSelector, text: typeText, } = type;

      // startup
      const browser = await puppeteer.launch( options, );
      let page = await browser.newPage();

      // log
      // // allow console.log() inside page methods // ref: https://stackoverflow.com/a/46245945
      // page.on('console', consoleObj => console.log(consoleObj.text()));
      // augment above to filter warnings // ref: https://stackoverflow.com/a/49101258
      page.on('console', consoleMessageObject =>
        (consoleMessageObject._type === 'log') ? // 'error', 'warning'
        console.debug(consoleMessageObject._text) : null
      );

      // navigate
      // const navigationPromise = page.waitForNavigation(waitUntilDocumentLoaded);
      const url = getUrl({ city, state, zip, county, term, });
      // const url = 'https://www.yellowpages.com/search?search_terms=real-estate-agents&geo_location_terms=Woodhaven-NY'
      console.log('url', url,);
      // await page.goto( url, waiter, );
      await page.goto( url, waitUntilLoad, );
      // await navigationPromise;

      // iframe
      if( iframe ) {
        await page.waitForSelector( iframe, );
        const iframeElement = await page.$( iframe, );
        page = await iframeElement.contentFrame();
      }

      // select
      // await page.select('#telCountryInput', 'my-value')
      if( select && !_.isEmpty(select) ){
        await page.waitForSelector( selectSelector, ); // ( , { timeout: 60000, })
        await page.select( selectSelector, selectValue, );
      }

      // type
      // await page.type('input#js-site-search-input', searchTerm,);
      if( type && !_.isEmpty(type) ) {
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

      // console.log('configSource', JSON.stringify(configSource),);
      // console.log('selectorsItem', JSON.stringify(selectorsItem),);

      // // evaluate and resolve
      // const pageData = await page.evaluate( config => {
      //   return new Promise( (resolve, reject,) => {          
      //     const { selectors={}, } = config;
      //     const { items: itemsSelector, item: itemConfig, } = selectors;
      //     const results = [];
      //     const items = document.querySelectorAll( itemsSelector, );
      //     items.forEach( item => {
      //       const newData = {}; // source, 
      //       for( const property in itemConfig ) {
      //         console.log('property', property,);
      //         try {
      //           const { selector, attribute, } = itemConfig[ property ];
      //           newData[ property ] = item.querySelector( selector, )[ attribute ];
      //         } catch (error) {
      //           console.log(error.message);
      //         }
      //       }
      //       results.push( newData, );
      //     });
      //     resolve (results);
      //   })
      // }, configSource, );

      // evaluate: $$eval()
      const pageFunction = ( items, selectorsItem, ) => {
        // console.log('items', items,);
        const results = [];
        items.forEach( item => {
          // console.log('item', item,);
          // results.push({
          //   title: item.querySelector('.title a').innerText,
          //   rank: item.querySelector('.rank').innerText,
          //   href: item.querySelector('.title a').href,
          // });
          const newData = {};
          for( const property in selectorsItem ) {
            // console.log('property', property,);
            try {
              const { selector, attribute, } = selectorsItem[ property ];
              // console.log('item', item,);
              // console.log('attribute', attribute,);
              // console.log('attribute', attribute,);
              newData[ property ] = item &&
                item.querySelector( selector ) &&
                item.querySelector( selector )[ attribute ];
              // console.log('newData', newData,);
              // console.log('querySelector', item.querySelector( selector ),);
            } catch (error) {
              console.log(error.message);
            }
          }
          results.push( newData, );
        });
        return results;
      };
      // console.log('selectorsItem', selectorsItem,);
      // console.log('selectorsItems', selectorsItems,);
      const pageData = await page.$$eval( selectorsItems, pageFunction, selectorsItem, );

      console.log('pageData', pageData,);
      browser.close();
      return resolve( pageData, );
    } catch( error ) {
      console.error( 'Query failed:', error, );
      return reject( error, );
    }
  })
// run().then(result => console.log('result\n', result,)).catch(console.error);