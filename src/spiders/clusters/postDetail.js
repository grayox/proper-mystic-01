// refs
// https://blog.antoine-augusti.fr/2019/08/submit-form-puppeteer/
// https://stackoverflow.com/questions/45778181/puppeteer-how-to-submit-a-form
// const puppeteer = require('puppeteer'); // npm i puppeteer -s
// const write2db = require('../../lib/db/write2firestore');
// const isScheduled = require('../../util/scheduler');

// const scriptName = 'postDetail';
const joiner = '.';
const prefix = 'http://www';
const waiter = { waitUntil: 'domcontentloaded', };
// const waitUntilLoad = { waitUntil: 'load', };
// const headful = { headless: false, };

// const url = 'https://www.example.com/';
// const selector1 = 'form #signup_email';
// const value1 = 'mytestemail@example.com';
// const selector2 = 'form #signup_mobile_number';
// const value2 = '555.555.9999';
// const enter = 'Enter';
// const browserVersion = 'browser version:';
const newPageLogHeader = 'New Page URL:';

// const dbConfig = {
//   source: 'form-post',
//   formFieldList: {
//     collection: 'domains',
//     // doc: formattedDomain, (later)
//   },
//   // source: 'auction',
//   // inventoryList: {
//   //   collection: 'inventory',
//   //   // doc: getLocationIndex(config), // 'us-va-virginia-beach'
//   // },
//   // parsedUrls: {
//   //   collection: 'domains',
//   //   // docs: , // domainList (later)
//   // },
// };

// const dbData = {
//   formList: [
//     {
//       url: domainName,
//       isCurrent,
//       currentMarket,
//       currentAddress,
//     },
//   ],
// };

// const getWrite2db = () => {
//   const dbData = {
//     // url, contactUrlList: values,
//     url, formFieldList: values,
//   };
//   write2db({ dbConfig, data: dbData, });
// }

// const config = {
//   address: '123 Main St',
//   'line 1': '123 Main St',
//   'line 2': 'Anytown, VA 98023',
//   city: 'Anytown',
//   state: 'VA',
//   zip: '98023',
  
//   phone: '5555559999',
//   email: 'myemail@example.com',
//   name: 'John Doe',
//   first: 'John',
//   last: 'Doe',
// };

const getValue = (
  label,
  {
    listAddress: address,
    listCity: city,
    listState: state,
    listZip: zip,
  }, {
    first, last, phone, email,
  },
) => {
  const joiner = ', ';
  const empty = '';
  const config = {
    address, city, state, zip,
    first, last, phone, email,
    'line 1': address,
    'line 2': [ city , state , zip , ].join(joiner),
  };
  let out = empty;
  const lowered = label.toLowerCase();
  for (let key in config) {
    if(lowered.includes(key)) {
      out = config[key];
      break;
    } 
  }
  return out;
  // [BEGIN] test
  // const labels = [
  //   'Address', 'Address Line 1', 'Address Line 2', 'Street Address', 'Property Address',
  //   'State', 'City', 'Zip', 'ZIP Code', 'Zip Code',
  //   'First', 'Last', 'Name', 'Email', 'Phone',
  // ]
  // // const test = labels.map( label => getValue(label) )
  // // // const test = getValue(labels[5]);
  // // test
  // [END] test
}

module.exports = async ({
  // page, data,
  data: {
    queryDomain: { domain, formFieldList, },
    queryInventory, queryContactDetails,
  },
}) => {
  // schedule it
  // if(!isScheduled(scriptName)) return;

  // [BEGIN] include if stand-alone (not exported to puppeteer-clusters)
  // const browser = await puppeteer.launch(headful);
  // // const version = browser.version();
  // // console.log(browserVersion, version,);
  // const page = await browser.newPage();
  // [END] include if stand-alone (not exported to puppeteer-clusters)

  // console.log('data', data,);
  // console.log('domain', domain,);
  // console.log('formFieldList', formFieldList,);
  // console.log('queryInventory', queryInventory,);
  // console.log('queryContactDetails', queryContactDetails,);
  // return;
  const url = [ prefix, domain, ].join(joiner);
  // console.log('url', url,); return;
  // console.log('formFieldList', formFieldList,);

  // await page.goto( url , waitUntilLoad , );
  await page.goto( url , waiter , );

  // await page.type( selector1 , value1 , );
  // await page.type( selector2 , value2 , );

  for (let field of formFieldList) {
    const { id, label, } = field;
    const selectorPrefix = 'form';
    const selectorJoiner = ' #';
    const selector = [ selectorPrefix, id, ].join(selectorJoiner);
    const value = getValue(label, queryInventory, queryContactDetails,);
    console.log('url', url,);
    console.log('selector', selector,);
    console.log('label', label,);
    console.log('value', value,);
    // await page.type( selector , value , );
  }

  // // await page.keyboard.press(enter);
  // await page.$eval('form', form => form.submit());

  await page.waitForNavigation();
  console.log( newPageLogHeader, page.url(), );
  await browser.close();

  // await write2db({ dbConfig, dbData, });
  return;
}