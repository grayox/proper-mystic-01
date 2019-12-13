
const puppeteer = require('puppeteer');
const getSearchStrings = require('./searchStrings');

const url = 'http://www.convertcsv.com/url-extractor.htm';
// also search at:
// https://www.whitepages.com/business/VA/Richmond/Sell-My-House-Now
// https://www.yelp.com/search?find_desc=sell+my+house+for+cash&find_loc=richmond%2C+va&ns=1
// https://www.yellowpages.com/search?search_terms=sell+my+house+for+cash&geo_location_terms=Richmond%2C+VA

// const formInputXpath = "//textarea[@id='txt1']";
const formInputSelector = '#txt1';
// const chkListXpath = "//input[@id='chkList']";
const listCheckboxSelector = '#chkList';
// const btnRunXpath = "//input[@id='btnRun']";
const runButtonSelector = '#btnRun';
// const resultElementXpath = "//textarea[@id='txta']";
const resultElementSelector = '#txta';

const emptyString = '';
const load = 'load';
const geolocation = 'geolocation';
const waitUntilLoad = {
  waitUntil: load,
};

module.exports = async ({ latitude, longitude, ...rest }) => {

  const config = rest;

  const targetListArray = getSearchStrings(config);
  // console.log('targetListArray\n', targetListArray,);
  // return;
  const targetList = targetListArray.join(emptyString);

  // ref: https://github.com/GoogleChrome/puppeteer
  // cheatsheet: https://nitayneeman.com/posts/getting-to-know-puppeteer-using-practical-examples/
  // forms: https://stackoverflow.com/questions/45778181/puppeteer-how-to-submit-a-form
  const browser = await puppeteer.launch({ 
    // headless: false, // uncomment when form testing for visual context and fedback
    // devtools: true, // use to fake geolocation // ref: https://nitayneeman.com/posts/getting-to-know-puppeteer-using-practical-examples/#faking-geolocation
  });

  // Grants permission for changing geolocation
  const context = browser.defaultBrowserContext();
  await context.overridePermissions( url, [ geolocation, ], );

  const page = await browser.newPage();
  // await page.goto('https://example.com');
  await page.goto( url, waitUntilLoad, );
  // await page.goto(url, {
  //   waitUntil: load, // 'load',
  // });
  // docs: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md
  // await page.screenshot({path: 'example.png'});

  // set geolocation
  await page.setGeolocation({ latitude, longitude, });

  // // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_using_XPath_in_JavaScript
  // const paragraphCount = document.evaluate( 'count(//p)', document, null, XPathResult.ANY_TYPE, null );

  // // Type our query into the search bar
  // // await page.focus('.js-search-field');
  // await page.focus(formInputSelector);
  // // await page.type('puppeteer');
  // await page.type(targetList);

  // // Submit form
  // // await page.press('Enter');
  // await page.press(enter);

  // // per: https://stackoverflow.com/a/45785542
  // // const form = await page.$('form-selector');
  // // await form.evaluate(form => form.submit());
  // // For v0.11.0 and laters:
  // // await page.$eval('form-selector', form => form.submit());
  // await page.$eval( formInputSelector, form => form.submit() );

  // // per: https://stackoverflow.com/a/51604207
  // await page.goto('https://www.example.com/login');
  // await page.type('#username', 'username');
  // await page.type('#password', 'password');
  // await page.click('#submit');
  // await page.waitForNavigation();
  // console.log('New Page URL:', page.url());
  await page.click( listCheckboxSelector, );
  await page.type( formInputSelector, targetList, );
  await page.click( runButtonSelector, waitUntilLoad, );
  
  // const waiter = page.waitForFunction('document.querySelector(resultElementSelector).value.length');
  // await waiter;
  // await page.waitFor( () =>  $('#txta').value.length );
  await page.waitFor( () =>  document.querySelector('#txta').value.length );
  
  const results = await page.evaluate( r => {
    // return Promise.resolve($(r).value);
    return Promise.resolve(document.querySelector(r).value);
  }, resultElementSelector );
  
  // console.log( 'result\n', result, ); // success
  // console.log( 'result type: ', typeof result, ); // string
  // console.log( 'result length: ' , result.length , ); // 15,270

  await browser.close();

  return results;  
};