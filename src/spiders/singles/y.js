// inspired by: https://www.datasciencecentral.com/profiles/blogs/web-scraping-with-a-headless-browser-a-puppeteer-tutorial
// (corrective edits to above code are necessary)
const puppeteer = require('puppeteer');

const options = {
  headless: true,
  // slowMo: 500,
};

const config = {
  url: 'https://www.yellowpages.com/search?search_terms=Real+Estate+Agents&geo_location_terms=High+Point%2C+NC',
  selectors: {
    items: 'div.info',
    item: {
      link: {
        selector: 'a',
        attribute: 'href', // value, href, innerHtml, ...
      },
    },
  },
}

const run = () =>
  new Promise(async (resolve, reject,) => {
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
            newData[property] = item.querySelector(itemConfig[property].selector)[itemConfig[property].attribute] 
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