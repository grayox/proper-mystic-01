// API

// yelp.com | API
// use api instead: src/api/config.json
// https://www.yelp.com/biz/the-jenny-maraghy-team-richmond
const yelp = {
  selectors: {
    href: {
      selector: 'section div[class*="island-section"] a',
      attribute: 'href',
    },
    link: {
      selector: 'section div[class*="island-section"] a',
      attribute: 'innerText',
    },
    phone: {
      // selector: 'section div[class*="island-section"]:nth-of-type(2) > p:nth-of-type(2)',
      selector: 'section > div > div:nth-of-type(2) > div > div:nth-of-type(2) > p:nth-of-type(2)',
      attribute: 'innerText',
    },
  },
};

// redfin.com | post to form
// url: https://www.redfin.com/county/2047/NC/Guilford-County/real-estate/agents

// // realtor.com | difficult
// const realtor = {
//   selectors: {
//     areaServed: {
//       selector: 'meta[itemprop="areaServed"]',
//       attribute: 'content',
//     },
//     address: {
//       selector: 'meta[itemprop="streetAddress"]',
//       attribute: 'content',
//     },
//   },
// };

// yellowpages.com
// https://www.yellowpages.com/richmond-va/real-estate-agents
// https://www.yellowpages.com/richmond-va/mip/atlantic-beacon-realty-llc-1508134?lid=1001780201283
const yellow = {
  selectors: {
    name: {
      selector: 'div.sales-info > h1',
      attribute: 'innerText',
    },
    address: {
      selector: 'div.contact > h2.address',
      attribute: 'innerText',
    },
    phone: {
      selector: 'div.contact > p.phone',
      attribute: 'innerText',
    },
    website: {
      selector: 'div.business-card-footer > a.website-link',
      attribute: 'href',
    },
    email: {
      selector: 'div.business-card-footer > a.email-business',
      attribute: 'href',
    },
  },
};

// https://nabpop.org/
// https://nabpop-member.com/members/SearchDirectories.php?zip=36695&city=&cityHidden=&state=-1&county=&countyHidden=
// https://nabpop-member.com/members/publicProfile.php?user=2007246
const bpo = {
  selectors: {
    professionalTitle: {
      selector: 'div.container.mob-margin > div:nth-of-type(3) > div:nth-of-type(1) > div.col-sm-8',
      attribute: 'innerText',
    },
    nabopDesignation: {
      selector: 'div.container.mob-margin > div:nth-of-type(3) > div:nth-of-type(2) > div.col-sm-8',
      attribute: 'innerText',
    },
    certStatus: {
      selector: 'div.container.mob-margin > div:nth-of-type(3) > div:nth-of-type(3) > div.col-sm-8',
      attribute: 'innerText',
    },
    certScore: {
      selector: 'div.container.mob-margin > div:nth-of-type(3) > div:nth-of-type(4) > div.col-sm-8',
      attribute: 'innerText',
    },
    email: {
      selector: 'div.container.mob-margin > div:nth-of-type(3) > div:nth-of-type(5) > div.col-sm-8',
      attribute: 'innerText',
    },
    website: {
      selector: 'div.container.mob-margin > div:nth-of-type(3) > div:nth-of-type(6) > div.col-sm-8',
      attribute: 'innerText',
    },
    companyName: {
      selector: 'div.container.mob-margin > div:nth-of-type(3) > div:nth-of-type(7) > div.col-sm-8',
      attribute: 'innerText',
    },
    streetAddress: {
      selector: 'div.container.mob-margin > div:nth-of-type(3) > div:nth-of-type(8) > div.col-sm-8',
      attribute: 'innerText',
    },
    csz: {
      selector: 'div.container.mob-margin > div:nth-of-type(3) > div:nth-of-type(9) > div.col-sm-8',
      attribute: 'innerText',
    },
    phone: {
      selector: 'div.container.mob-margin > div:nth-of-type(3) > div:nth-of-type(10) > div.col-sm-8',
      attribute: 'innerText',
    },
    altPhone: {
      selector: 'div.container.mob-margin > div:nth-of-type(3) > div:nth-of-type(11) > div.col-sm-8',
      attribute: 'innerText',
    },
    serviceArea_zipCodes: {
      selector: 'div.container.mob-margin > div:nth-of-type(3) > div:nth-of-type(12) > div.col-sm-8',
      attribute: 'innerText',
    },
    serviceArea_cities: {
      selector: 'div.container.mob-margin > div:nth-of-type(3) > div:nth-of-type(13) > div.col-sm-8',
      attribute: 'innerText',
    },
    serviceArea_counties: {
      selector: 'div.container.mob-margin > div:nth-of-type(3) > div:nth-of-type(14) > div.col-sm-8',
      attribute: 'innerText',
    },
  },
}

// https://www.homepath.com/
// https://www.homepath.com/listings/mobile-al/list_v
// https://www.homepath.com/listing/5713-ramada-dr-s-mobile-al-36693-46345257
const homePath = {
  selectors: {
    fullAddress: {
      selector: 'h1.fullAddress',
      attribute: 'innerText',
    },
    csz: {
      selector: 'h1.fullAddress > span',
      attribute: 'innerText',
    },
    updatedListing: {
      selector: 'div.updatedListing',
      attribute: 'innerText',
    },
    price: {
      selector: 'h1.price',
      attribute: 'innerText',
    },
    propertyStatus: {
      selector: 'div#propertyStatus > span:nth-of-type(2)',
      attribute: 'innerText',
    },
    propertyType: {
      selector: 'div.propertyType',
      attribute: 'innerText',
    },
    bedbath: {
      selector: 'div.bedbath',
      attribute: 'innerText',
    },
    reoid: {
      selector: 'div.reoid',
      attribute: 'innerText',
    },
    mlsid: {
      selector: 'div.mlsid',
      attribute: 'innerText',
    },
    agentName: {
      selector: 'div#vcardAgentInfo > div.agent-name',
      attribute: 'innerText',
    },
    agentPhone: {
      selector: 'div#vcardAgentInfo > div._agent-phone',
      attribute: 'innerText',
    },
    agentEmail: {
      selector: 'div#vcardAgentInfo > div.agent-email > a',
      attribute: 'href',
    },
    companyName: {
      selector: 'div#vcardCompanyInfo > div > div.company-name',
      attribute: 'innerText',
    },
    companyPhone: {
      selector: 'div#vcardCompanyInfo > div > div.company-phone',
      attribute: 'innerText',
    },
    companyStreetAddress: {
      selector: 'div#vcardCompanyInfo > div > div.company-address',
      attribute: 'innerText',
    },
    companyCsz: {
      selector: 'div#vcardCompanyInfo > div > div:last-of-type',
      attribute: 'innerText',
    },
  },
};

// hudhomestore.com
// https://www.hudhomestore.com/Listing/BrokerSearch.aspx?sLanguage=ENGLISH
const hud = {
  // details contained in list (inside a table)
};

module.exports = {
  // custom
  bpo, hud, homePath, // realtor, // redfin,
  // salesbot
  yellow,
  // API:
  yelp,
  // CAPTCHA: // zillow, reo,
};