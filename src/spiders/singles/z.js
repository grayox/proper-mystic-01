const puppeteer = require('puppeteer');

const url = 'https://www.yellowpages.com/search?search_terms=Real+Estate+Agents&geo_location_terms=High+Point%2C+NC';
const selector = 'div.info';

// ref: https://pptr.dev
puppeteer.launch().then(async browser => {
  const page = await browser.newPage();
  await page.goto(url);
  // await page.goto('https://example.com');
  // await page.screenshot({path: 'screenshot.png'});
  // ref: https://pptr.dev/#?product=Puppeteer&version=v2.0.0&show=api-pageevalselector-pagefunction-args
  // const divsCount = await page.$$eval( 'div', divs => divs.length );
  // console.log( 'divsCount', divsCount, );
  const selected = await page.$$eval( selector, items => items );
  const items = selected.forEach( async item => {
    const link = await page.$eval('a', a => a.href);
    return { link, };
  });
  console.log('items', items);

  // const length = items.length;
  // let i = length; while(i--) {
  //   const item = items[i];
  //   console.log('i', i);
  //   // console.log('item', item);
  // }

  await browser.close();
});