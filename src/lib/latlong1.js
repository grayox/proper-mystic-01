// DEPRECATED
// because CAPTCHA protected
// use mapquest api instead
// use new file: latlong.js

// // caller code
// // const latitude = 37.5407;
// // const longitude = -77.4360;
// // (async ( getLatLong, config, ) => {
// //   const latlong = await getLatLong(config);
// //   // console.log('latlong: ', latlong,);
// //   // return;
// //   const { latitude, longitude, } = latlong;
// //   console.log('latitude: ', latitude,);
// //   console.log('longitude: ', longitude,);
// //   return;
// // })( getLatLong, config, );
// const latlong = getLatLong(config).then(
//   result => console.log('latlong: ', result,)
// )
// return;

// https://nodejs.org/en/knowledge/getting-started/what-is-require/

// usage note:
// to export a function only, use module.exports
// otherwise, export an object using exports

// const latlong = require('./util/latlong.js');

// return latitude {number} and longitude {number} given a city {string} and state {string}

const puppeteer = require('puppeteer');

const getLatLong = async ( city, state, ) => {

  const url = 'https://www.latlong.net/';
  const placeSelector = '#place'; // 'richmond, va'
  const latlongSelector = '#latlngspan'; // result example: (37.540726, -77.436050)
  // const latitudeSelector = '#lat';
  // const longitudeSelector = '#lng';
  const runButtonSelector = '#btnfind';
  const load = 'load';
  const waitUntilLoad = {
    waitUntil: load,
  };

  const joinString = ', ';
  const placeString = [ city, state, ].join(joinString);

  const browser = await puppeteer.launch({ 
    headless: false, // uncomment when form testing for visual context and fedback
    // devtools: true, // use to fake geolocation // ref: https://nitayneeman.com/posts/getting-to-know-puppeteer-using-practical-examples/#faking-geolocation
  });

  const page = await browser.newPage();
  await page.goto( url, waitUntilLoad, );
  await page.type( placeSelector, placeString, );
  await page.click( runButtonSelector, waitUntilLoad, );
  await page.waitFor( () => {
    const defaultText = '(0.000000, 0.000000)';
    const targetElement = document.querySelector( '#latlngspan' );
    const targetText = targetElement.innerText;
    const ready1 = targetElement;
    const ready2 = ( targetText != defaultText );
    const ready = !!(ready1 && ready2);
    return ready;
  }
    // ( 
    //   document.querySelector('#lat') && 
    //   document.querySelector('#lat').value &&
    //   Number(document.querySelector('#lat').value)
    // )
    // &&
    // ( 
    //   document.querySelector('#lng') && 
    //   document.querySelector('#lng').value &&
    //   Number(document.querySelector('#lng').value)
    // )
  );
  
  // const results = await page.evaluate( ( lat, long, ) => {
  //   const latitude = Promise.resolve(
  //     document.querySelector('#lat').value
  //     .then( () =>
  //       console.log('latitude: ', latitude,)
  //     )
  //   );
  //   const longitude = Promise.resolve(
  //     document.querySelector('#lng').value
  //     .then( () =>
  //       console.log('longitude: ', longitude,)
  //     )
  //   );
  //   const out = { latitude, longitude, }
  //   return out;
  // }, [ latitudeSelector, longitudeSelector, ] );
  
  const results = await page.evaluate( ( latlong ) => {
    return document.querySelector(latlong).innerText
  }, latlongSelector );
  
  // console.log( 'results\n', results, );

  await browser.close();
  return results;
};

module.exports = async ({ city, state, }) => {
  const out = await getLatLong( city, state, );
  return out;
};
