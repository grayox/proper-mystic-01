// https://nodejs.org/en/knowledge/getting-started/what-is-require/

// usage note:
// to export a function only, use module.exports
// otherwise, export an object using exports

// const latlong = require('./util/latlong.js');

// return latitude {number} and longitude {number} given a city {string} and state {string}

// mapquest api
// ref: https://developer.mapquest.com/documentation/geocoding-api/address/get/

// Example Request
// GET http://www.mapquestapi.com/geocoding/v1/address?key=KEY&location=Washington,DC

// Example Response
// {
//   "info": {
//     "statuscode": 0,
//     "copyright": {
//       "text": "© 2018 MapQuest, Inc.",
//       "imageUrl": "http://api.mqcdn.com/res/mqlogo.gif",
//       "imageAltText": "© 2018 MapQuest, Inc."
//     },
//     "messages": []
//   },
//   "options": {
//     "maxResults": -1,
//     "thumbMaps": true,
//     "ignoreLatLngInput": false
//   },
//   "results": [
//     {
//       "providedLocation": {
//         "location": "Washington,DC"
//       },
//       "locations": [
//         {
//           "street": "",
//           "adminArea6": "",
//           "adminArea6Type": "Neighborhood",
//           "adminArea5": "Washington",
//           "adminArea5Type": "City",
//           "adminArea4": "District of Columbia",
//           "adminArea4Type": "County",
//           "adminArea3": "DC",
//           "adminArea3Type": "State",
//           "adminArea1": "US",
//           "adminArea1Type": "Country",
//           "postalCode": "",
//           "geocodeQualityCode": "A5XAX",
//           "geocodeQuality": "CITY",
//           "dragPoint": false,
//           "sideOfStreet": "N",
//           "linkId": "282772166",
//           "unknownInput": "",
//           "type": "s",
//           "latLng": {
//             "lat": 38.892062,
//             "lng": -77.019912
//           },
//           "displayLatLng": {
//             "lat": 38.892062,
//             "lng": -77.019912
//           },
//           "mapUrl": "http://www.mapquestapi.com/staticmap/v4/getmap?key=KEY&type=map&size=225,160&pois=purple-1,38.892062,-77.019912,0,0,|&center=38.892062,-77.019912&zoom=12&rand=306744981"
//         }
//       ]
//     }
//   ]
// }

const axios = require('axios'); // npm i axios -s

const urlBase = 'http://www.mapquestapi.com/geocoding/v1/address?key=';
const urlParam = '&location=';
const key = 'uNB9YXCZ1jBfdJeFfxIA4Nv9BssXzfmA';
// const secret = 'xxxx'; // check email qquestlive@gmail.com;

const empty = '';
const comma = ',';

// note
// we can also now pull this data inhouse because we have the json data file in our library
// pseudocode: _.pull(city, state, './geoData/states.json',).latlong

module.exports = async ({ city, state, }) => {
  const locationString = [ city, state, ].join(comma);
  const url = [ urlBase, key, urlParam, locationString, ].join(empty);

  // axios.get('/user?ID=12345')
  const out = axios.get(url)
    .then( response => {
      // handle success
      // console.log(response);
      const { latLng, } = response.data.results[0].locations[0];
      const { lat: latitude, lng: longitude, } = latLng;
      return { latitude, longitude, };
    })
    .catch( error => {
      // handle error
      console.log(error);
    });
    //  .finally( () => {
    //    // always executed
    //  });
  return out;
};
