// inspired by: https://www.datasciencecentral.com/profiles/blogs/web-scraping-with-a-headless-browser-a-puppeteer-tutorial
// (corrective edits to above code are necessary)
const puppeteer = require('puppeteer');

const options = {
  headless: true,
  // slowMo: 500,
};

// yellowpages.com
const config = {
  // url: 'https://www.yellowpages.com/search?search_terms=Real+Estate+Agents&geo_location_terms=High+Point%2C+NC',
  url: 'https://www.yellowpages.com/richmond-va/real-estate-agents',
  selectors: {
    items: 'div.info',
    // item.property.attribute: innerText, href, value, ...
    item: {
      label: {
        selector: 'a.business-name',
        attribute: 'innerText',
      },
      link: {
        selector: 'a.business-name',
        attribute: 'href',
      },
      address: {
        selector: 'div.street-address',
        attribute: 'innerText',
      },
      csz: {
        selector: 'div.locality',
        attribute: 'innerText',
      },
      phone: {
        selector: 'div.phones.phone.primary',
        attribute: 'innerText',
      },
      website: {
        selector: 'div.links > a.track-visit-website',
        attribute: 'href',
      },
      bbb: {
        selector: 'bbb-rating.extra-rating.hasRating',
        attribute: 'innerText',
      },
    },
  },
};

// // yelp.com
// // use api instead: src/api/config.json
// const config = {
//   url: 'https://www.yelp.com/search?find_desc=Real%20Estate%20Agents&find_loc=High%20Point%2C%20NC',
//   selectors: {
//     items: 'body > div > div > div > div > div > div > div > div > div > ul > li',
//     // item.property.attribute: innerText, href, name, value, ...
//     item: {
//       label: {
//         selector: 'li a',
//         attribute: 'innerText',
//       },
//       link: {
//         selector: 'li a',
//         attribute: 'href',
//       },
//       // address: {
//       //   selector: 'div.street-address',
//       //   attribute: 'innerText',
//       // },
//       // csz: {
//       //   selector: 'div.locality',
//       //   attribute: 'innerText',
//       // },
//       // phone: {
//       //   selector: 'div.phones.phone.primary',
//       //   attribute: 'innerText',
//       // },
//       // website: {
//       //   selector: 'div.links > a.track-visit-website',
//       //   attribute: 'href',
//       // },
//       // bbb: {
//       //   selector: 'bbb-rating.extra-rating.hasRating',
//       //   attribute: 'innerText',
//       // },
//     },
//   },
// };

const run = () =>
  new Promise(async ( resolve, reject, ) => {
    try {
      const browser = await puppeteer.launch(options);
      const page = await browser.newPage();
      // const searchTerm = process.argv[2]; // node scraper iphone
      // await page.goto('https://www.croma.com/');
      // await page.click('button.mobile__nav__row--btn-search');
      // await page.type('input#js-site-search-input', searchTerm);
      // await page.keyboard.press('Enter');
      // await page.screenshot({ path: 'sample.png', });
      await page.goto(config.url);
      // await page.goto('https://www.yellowpages.com/search?search_terms=Real+Estate+Agents&geo_location_terms=High+Point%2C+NC');
      const pageData = await page.evaluate( config => {
        const { selectors, } = config;
        const { items: itemsSelector, item: itemConfig, } = selectors;
        const results = [];
        const items = document.querySelectorAll(itemsSelector);
        // const items = document.querySelectorAll('div.info');
        items.forEach( item => {
          const newData = {};

          // const price = item.querySelector('span.pdpPrice').innerText
          // const discount = item.querySelector('div.listingDiscnt').innerText
          // const link = item.querySelector('a').href
          // const link = item.querySelector(itemSelector.link).href
          for (const property in itemConfig) {
            // console.log(`${property}: ${itemSelector[property]}`);
            try {
              newData[property] = item.querySelector(itemConfig[property].selector)[itemConfig[property].attribute] 
            } catch (e) {
              console.log(e);
            }
          }

          // results.push({ link, });
          results.push(newData);
        });
        return results;
      }, config, );
      browser.close();
      return resolve(pageData);
    } catch (error) {
      return reject(error);
    }
  })
run().then(result => console.log('result\n', result,)).catch(console.error);