// CAPTCHA

// // zillow.com | CAPTCHA
// const zillow = {
//   selectors: {
//     // a selector all list items share in common ... $$() ... document.querySelectorAll()
//     items: 'div.ldb-contact-summary',
//     // item.property.attribute: innerText, href, value, ...
//     item: {
//       name: {
//         selector: 'p.ldb-contact-name > a',
//         attribute: 'innerText',
//       },
//       link: {
//         selector: 'p.ldb-contact-name > a',
//         attribute: 'href',
//       },
//       phone: {
//         selector: 'p.ldb-phone-number',
//         attribute: 'innerText',
//       },
//     },
//   },
//   // url: https://www.zillow.com/high-point-nc/real-estate-agent-reviews/?sortBy=None&page=3&showAdvancedItems=True&regionID=11896&locationText=High%20Point%20NC
//   // urlDetail: https://www.zillow.com/profile/CarolYoungHighPoint/
//   // url for lenders: https://www.zillow.com/lender-directory/?sort=Relevance&location=Greensboro%2C%20NC&language=English&page=1
//   getUrl: ({ city, state, }) =>
//     'https://www.zillow.com/high-point-nc/real-estate-agent-reviews/?sortBy=None&page=3&showAdvancedItems=True&regionID=11896&locationText=High%20Point%20NC',
//   // {
//   //   const stem = 'https://www.realtor.com/realestateagents';
//   //   const tail = 'sort-activelistings/pg-1';
//   //   const splitter = ' ';
//   //   const joiner1 = '-';
//   //   const joiner1a = '_';
//   //   const joiner2 = '/';
//   //   const formatString = s => s.split(splitter).join(joiner1)
//   //   const formattedCity = formatString(city);
//   //   const formattedCityState = [ formattedCity, state, ].join(joiner1a);
//   //   const out = [ stem, formattedCityState, tail, ].join(joiner2);
//   //   // out
//   //   return out;
//   // },
// }
// // const zillowUrl = zillow.getUrl({ city: 'high-point', state: 'nc', });
// // zillowUrl

// // reonetwork.com | CAPTCHA
// const reo = {
//   type: {
//     selector: 'input#csz',
//     text: '27214',
//   },
//   click: 'input#bttn-search', // selector
//   // press: '', // selector
//   recaptcha: 'div.recaptcha-checkbox-checkmark',
//   selectors: {
//     // a selector all list items share in common ... $$() ... document.querySelectorAll()
//     items: 'table#LeftSubTable td a',
//     // item.property.attribute: innerText, href, value, ...
//     item: {
//       name: {
//         selector: ':scope',
//         attribute: 'innerText',
//       },
//       link: {
//         selector: ':scope',
//         attribute: 'href',
//       },
//     },
//   },
//   // url: 'https://www.reonetwork.com/search/',
//   getUrl: () => 'https://www.reonetwork.com/search/',
// }
// // const reoUrl = reo.getUrl();
// // reoUrl

// API

// // yelp.com | API
// // use api instead: src/api/config.json
// const yelp = {
//   url: 'https://www.yelp.com/search?find_desc=Real%20Estate%20Agents&find_loc=High%20Point%2C%20NC',
//   selectors: {
//     // a selector all list items share in common ... $$() ... document.querySelectorAll()
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

// redfin.com | post to form
// url: https://www.redfin.com/county/2047/NC/Guilford-County/real-estate/agents

// realtor.com
const realtor = {
  selectors: {
    // a selector all list items share in common ... $$() ... document.querySelectorAll()
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
      link: {
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
  // url: 'https://www.realtor.com/realestateagents/high-point_nc/sort-activelistings/pg-2',
  getUrl: ({ city, state, }) => {
    const stem = 'https://www.realtor.com/realestateagents';
    const tail = 'sort-activelistings/pg-1';
    const splitter = ' ';
    const joiner1 = '-';
    const joiner1a = '_';
    const joiner2 = '/';
    const formatString = s => s.split(splitter).join(joiner1)
    const formattedCity = formatString(city);
    const formattedCityState = [ formattedCity, state, ].join(joiner1a);
    const out = [ stem, formattedCityState, tail, ].join(joiner2);
    // out
    return out;
  },
};
// const realtorUrl = realtor.getUrl({ city: 'richmond', state: 'va', });
// const realtorUrl = realtor.getUrl({ city: 'high-point', state: 'nc', });
// realtorUrl

// yellowpages.com
const yellow = {
  selectors: {
    // a selector all list items share in common ... $$() ... document.querySelectorAll()
    items: 'div.info',
    // item.property.attribute: innerText, href, value, ...
    item: {
      label: {
        selector: 'a.business-name',
        attribute: 'innerText',
      },
      link: {
        selector: 'a.business-name',
        attribute: 'href',
      },
      address: {
        selector: 'div.street-address',
        attribute: 'innerText',
      },
      csz: {
        selector: 'div.locality',
        attribute: 'innerText',
      },
      phone: {
        selector: 'div.phones.phone.primary',
        attribute: 'innerText',
      },
      website: {
        selector: 'div.links > a.track-visit-website',
        attribute: 'href',
      },
      bbb: {
        selector: 'bbb-rating.extra-rating.hasRating',
        attribute: 'innerText',
      },
    },
  },
  // url: 'https://www.yellowpages.com/search?search_terms=Real+Estate+Agents&geo_location_terms=High+Point%2C+NC',
  // url: 'https://www.yellowpages.com/search?search_terms=real-estate-agents&geo_location_terms=Woodhaven-NY',
  // url: 'https://www.yellowpages.com/richmond-va/real-estate-agents',
  getUrl: ({ city, state, term, }) => {
    const stem = 'https://www.yellowpages.com';
    const splitter = ' ';
    const joiner1 = '-';
    const joiner2 = '/';
    const formatString = s => s.split(splitter).join(joiner1)
    const formattedCity = formatString(city);
    const formattedTerm = formatString(term);
    const formattedCityState = [ formattedCity, state, ].join(joiner1);
    const out = [ stem, formattedCityState, formattedTerm, ].join(joiner2);
    // out
    return out;
  },
};
// const yellowUrl = yellow.getUrl({ city: 'richmond', state: 'va', term: 'real estate agents', });
// yellowUrl

// https://nabpop.org/
const bpo = {
  selectors: {
    // a selector all list items share in common ... $$() ... document.querySelectorAll()
    items: 'table#directoryResultsTable > tbody > tr',
    // item.property.attribute: innerText, href, value, ...
    item: {
      name: {
        selector: 'td:nth-of-type(1)',
        attribute: 'innerText',
      },
      email: {
        selector: 'td:nth-of-type(2)',
        attribute: 'innerText',
      },
      city: {
        selector: 'td:nth-of-type(3)',
        attribute: 'innerText',
      },
      state: {
        selector: 'td:nth-of-type(4)',
        attribute: 'innerText',
      },
      designation: {
        selector: 'td:nth-of-type(5)',
        attribute: 'innerText',
      },
      link: {
        selector: 'td:nth-of-type(6) > a',
        attribute: 'href',
      },
    },
  },
  // url: 'https://nabpop-member.com/members/SearchDirectories.php?zip=36695&city=&cityHidden=&state=-1&county=&countyHidden=',
  getUrl: ({ zip='', city='', state='-1', county='', }) =>
    `https://nabpop-member.com/members/SearchDirectories.php?zip=${zip}&city=${city}&cityHidden=&state=${state}&county=${county}&countyHidden=`,
}
// const bpoUrl = bpo.getUrl({zip: '02139'});
// bpoUrl


// https://www.homepath.com/
const homePath = {
  selectors: {
    // a selector all list items share in common ... $$() ... document.querySelectorAll()
    items: 'div#fragmentsSearchResultsList > table.table.table-results > tbody > tr',
    // item.property.attribute: innerText, href, value, ...
    item: {
      photoUrl: {
        selector: 'td.tPhoto > a',
        attribute: 'href',
      },
      address: {
        selector: 'td.tAddress > a',
        attribute: 'innerText',
      },
      link: {
        selector: 'td.tAddress > a',
        attribute: 'href',
      },
      csz: {
        selector: 'td.tLocation > div',
        attribute: 'data-original-title', // 'innerText'
      },
      type: {
        selector: 'td.tType',
        attribute: 'innerText',
      },
      status: {
        selector: 'td.tStatus',
        attribute: 'innerText',
      },
      price: {
        selector: 'td.tPrice',
        attribute: 'innerText',
      },
      beds: {
        selector: 'td.tBeads',
        attribute: 'innerText',
      },
      baths: {
        selector: 'td.tBaths',
        attribute: 'innerText',
      },
    },
  },
  // url: 'https://www.homepath.com/listings/mobile-al/list_v',
  getUrl: ({ city='', state='', }) => {
    const stem = 'https://www.homepath.com/listings';
    const tail = 'list_v';
    const splitter = ' ';
    const joiner1 = '-';
    const joiner2 = '/';
    const formatString = s => s.split(splitter).join(joiner1)
    const formattedCity = formatString(city);
    const formattedCityState = [ formattedCity, state, ].join(joiner1);
    const out = [ stem, formattedCityState, tail, ].join(joiner2);
    // out
    return out;    
  },
};
// const homePathUrl = homePath.getUrl({city: 'mobile', state: 'al',});
// homePathUrl

// hudhomestore.com
const hud = {
  iframe: 'iframe#inWin107',
  select: {
    selector: 'td select#ddState',
    value: 'NC',
  },
  type: {
    selector: 'td > input#txtZipCode',
    text: '27214',
  },
  click: 'td span#btnSearch', // selector
  // press: '', // selector
  // recaptcha: 'div.recaptcha-checkbox-checkmark',
  selectors: {
    // a selector all list items share in common ... $$() ... document.querySelectorAll()
    items: '#dgBrokerList > tbody > tr.bsresultrow',
    // item.property.attribute: innerText, href, value, ...
    item: {
      company: {
        selector: 'td:nth-of-type(1)',
        attribute: 'innerText',
      },
      name: {
        selector: 'td:nth-of-type(2)',
        attribute: 'innerText',
      },
      location: {
        selector: 'td:nth-of-type(3)',
        attribute: 'innerText',
      },
      phone: {
        selector: 'td:nth-of-type(4)',
        attribute: 'innerText',
      },
    },
  },
  // url: 'https://www.hudhomestore.com/Listing/BrokerSearch.aspx?sLanguage=ENGLISH',
  getUrl: () => 'https://www.hudhomestore.com/Listing/BrokerSearch.aspx?sLanguage=ENGLISH',
}
// const hudUrl = hud.getUrl();
// hudUrl

module.exports = {
  // custom
  bpo, hud, homePath, realtor, // redfin,
  // salesbot
  yellow,
  // API:
    // yelp | use api at src/api/config.json
  // CAPTCHA: // zillow, reo,
};