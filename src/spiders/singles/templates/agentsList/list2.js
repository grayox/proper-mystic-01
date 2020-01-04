// inspired by: https://www.datasciencecentral.com/profiles/blogs/web-scraping-with-a-headless-browser-a-puppeteer-tutorial
// (corrective edits to above code are necessary)
const puppeteer = require('puppeteer');
const config = require('./config');

const options = {
  // slowMo: 500,
  // headless: false,
  // waitUntil: 'load',
};

// const run = () =>
module.exports = ({ source, term, city, state, zip, county, }) =>
  new Promise(async ( resolve, reject, ) => {
    try {
      const browser = await puppeteer.launch(options);
      const page = await browser.newPage();
      // await page.goto(config.url);
      const url = config[source].getUrl({ city, state, zip, county, term, });
      await page.goto(url);
      const pageData = await page.evaluate( config => {
        const { selectors, } = config;
        const { items: itemsSelector, item: itemConfig, } = selectors;
        const results = [];
        const items = document.querySelectorAll(itemsSelector);
        items.forEach( item => {
          const newData = {};
          for (const property in itemConfig) {
            try {
              newData[property] = item.querySelector(itemConfig[property].selector)[itemConfig[property].attribute];
            } catch (e) {
              console.log(e);
            }
          }
          results.push(newData);
        });
        return results;
      }, config[source], );
      browser.close();
      return resolve(pageData);
    } catch (error) {
      return reject(error);
    }
  })
// run().then(result => console.log('result\n', result,)).catch(console.error);