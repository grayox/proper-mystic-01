// inspired by: https://www.datasciencecentral.com/profiles/blogs/web-scraping-with-a-headless-browser-a-puppeteer-tutorial
// (corrective edits to above code are necessary)
const puppeteer = require('puppeteer');

const options = {
  headless: true,
  // slowMo: 500,
};

// zillow.com
// url: https://www.zillow.com/high-point-nc/real-estate-agent-reviews/?sortBy=None&page=3&showAdvancedItems=True&regionID=11896&locationText=High%20Point%20NC
// urlDetail: https://www.zillow.com/profile/CarolYoungHighPoint/

// realtor.com
const config = {
  url: 'https://www.realtor.com/realestateagents/high-point_nc/sort-activelistings/pg-2',
  selectors: {
    items: 'div.agent-list-card',
    // item.property.attribute: innerText, href, value, ...
    item: {
      areaServed: {
        selector: 'meta[itemprop="areaServed"]',
        attribute: 'content',
      },
      address: {
        selector: 'meta[itemprop="streetAddress"]',
        attribute: 'content',
      },
      city: {
        selector: 'meta[itemprop="addressLocality"]',
        attribute: 'content',
      },
      state: {
        selector: 'meta[itemprop="addressRegion"]',
        attribute: 'content',
      },
      zip: {
        selector: 'meta[itemprop="postalCode"]',
        attribute: 'content',
      },
      name: {
        selector: 'div[itemprop="name"] > a',
        attribute: 'innerText',
      },
      detailPageLink: {
        selector: 'div[itemprop="name"] > a',
        attribute: 'href',
      },
      phone: {
        selector: 'div[itemprop="telephone"]',
        attribute: 'innerText',
      },
      firm: {
        selector: 'div[itemprop="subOrganization"] > span[itemprop="name"]',
        attribute: 'innerText',
      },
    },
  },
};

// // yellowpages.com
// const config = {
//   // url: 'https://www.yellowpages.com/search?search_terms=Real+Estate+Agents&geo_location_terms=High+Point%2C+NC',
//   url: 'https://www.yellowpages.com/richmond-va/real-estate-agents',
//   selectors: {
//     items: 'div.info',
//     // item.property.attribute: innerText, href, value, ...
//     item: {
//       label: {
//         selector: 'a.business-name',
//         attribute: 'innerText',
//       },
//       link: {
//         selector: 'a.business-name',
//         attribute: 'href',
//       },
//       address: {
//         selector: 'div.street-address',
//         attribute: 'innerText',
//       },
//       csz: {
//         selector: 'div.locality',
//         attribute: 'innerText',
//       },
//       phone: {
//         selector: 'div.phones.phone.primary',
//         attribute: 'innerText',
//       },
//       website: {
//         selector: 'div.links > a.track-visit-website',
//         attribute: 'href',
//       },
//       bbb: {
//         selector: 'bbb-rating.extra-rating.hasRating',
//         attribute: 'innerText',
//       },
//     },
//   },
// };

// // use api instead: src/api/config.json
// // yelp.com
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
      await page.goto(config.url);
      const pageData = await page.evaluate( config => {
        const { selectors, } = config;
        const { items: itemsSelector, item: itemConfig, } = selectors;
        const results = [];
        const items = document.querySelectorAll(itemsSelector);
        items.forEach( item => {
          const newData = {};
          for (const property in itemConfig) {
            try {
              newData[property] = item.querySelector(itemConfig[property].selector)[itemConfig[property].attribute] 
            } catch (e) {
              console.log(e);
            }
          }
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