// refs
// https://blog.antoine-augusti.fr/2019/08/submit-form-puppeteer/
// https://stackoverflow.com/questions/45778181/puppeteer-how-to-submit-a-form
const puppeteer = require('puppeteer'); // npm i puppeteer -s
const write2db = require('../../../lib/db/write2firestore');

const waitUntilLoad = { waitUntil: 'load', };
const headful = { headless: false, };

const url = 'https://www.kshamasawant.org/';
const selector1 = 'form #signup_email';
const value1 = 'homebuyerrichmond@gmail.com';
const selector2 = 'form #signup_mobile_number';
const value2 = '804.399.9337';
// const enter = 'Enter';
// const browserVersion = 'browser version:';
const newPageLogHeader = 'New Page URL:';

const dbConfig = {
  source: 'form',
  formList: {
    collection: 'currentForm',
    doc: domainName, // 'rvahomebuyers,com'
  },
  // parsedUrls: {
  //   collection: 'domains',
  //   // docs: , // domainList (later)
  // },
};

const dbData = {
  formList: [
    {
      url: domainName,
      isCurrent,
      currentMarket,
      currentAddress,
    },
  ],
};

(async () => {
  const browser = await puppeteer.launch(headful);
  // const version = browser.version();
  // console.log(browserVersion, version,);
  const page = await browser.newPage();

  await page.goto( url , waitUntilLoad , );

  await page.type( selector1 , value1 , );
  await page.type( selector2 , value2 , );
  // await page.keyboard.press(enter);
  // await page.$eval('form', form => form.submit());

  await page.waitForNavigation();
  console.log( newPageLogHeader, page.url(), );
  await browser.close();

  await write2db({ dbConfig, dbData, });
  return;
})();