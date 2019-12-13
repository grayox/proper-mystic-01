// https://nodejs.org/en/knowledge/getting-started/what-is-require/

// usage note:
// to export a function only, use module.exports
// otherwise, export an object using exports

// const parseUrlList = require('./parseUrlList.js');

// // to integrate with
// {
//   'north-carolina': {
//     'raleigh': [ 'example1.com', 'example2.net', ]
//   }
// }

// // sample output
// {
//   'example1,com' :
//      protocol: 'http:',
//      domain: 'example1.com',
//   // w3: true,
//      urls: [
//        'example1.com/home'       ,
//        'example1.com/contact'    ,
//        'example1.com/foo'        ,
//        'example1.com/bar'        ,
//      ],
//   'example2,net' :
//      protocol: 'https:',
//en.      domain: 'example2.net',
//   // w3: false,
//      urls: [
//        'example2.net/home'       ,
//        'example2.net/contact-us' ,
//        'example2.net/foo'        ,
//        'example2.net/bar'        ,
//      ],
// }

const delimeter1 = '//';
const delimeter2 = '/';
const delimeter3 = '.';
const comma = ',';

const getParse = url => {                      // 'http://www.en.example.com/contact-us'
  const splitted1 = url.split(delimeter1);     // [ 'http:', 'www.en.example.com/contact-us', ]
  const protocol = splitted1[0];               // 'http:'
  const body = splitted1[1];                   // 'www.en.example.com/contact-us'
  const splitted2 = body.split(delimeter2);    // [ 'www.en.example.com', 'contact-us', ]
  const uri = splitted2[0];                    // 'www.en.example.com'
  const uriArray = uri.split(delimeter3);      // [ 'www', 'en', 'example', 'com', ]
  const domainArray = uriArray.slice(-2);      // [ example', 'com', ]
  const domain = domainArray.join(delimeter3); // 'example.com'
  const out = { url, uri, protocol, domain, };
  return out;
}

module.exports = a => {
  const out = {
    hasContactUrls: false, // sets default, to be fetched separately, later
  };
  a.forEach( item => {
    const parsed = getParse( item, );
    const { url, uri, protocol, domain, } = parsed;
    const formattedDomain = domain; //.split(delimeter3).join(comma); // handle in write2firebase
    if( out[formattedDomain] ) {
      if( !out[formattedDomain].urls ) out[formattedDomain].urls = [];
      if( !out[formattedDomain].uris ) out[formattedDomain].uris = [];
      if( !out[formattedDomain].urls.includes(url) ) out[formattedDomain].urls.push(url);
      if( !out[formattedDomain].uris.includes(uri) ) out[formattedDomain].uris.push(uri);
      if( !out[formattedDomain].protocol ) out[formattedDomain].protocol = protocol;
      if( !out[formattedDomain].domain   ) out[formattedDomain].domain   = domain  ;
    } else {
      out[formattedDomain] = {
        protocol, domain, urls: [ uri, ], urls: [ uri, ],
      };
    }
  });
  return out;
}