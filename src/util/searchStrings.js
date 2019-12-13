// https://nodejs.org/en/knowledge/getting-started/what-is-require/

// usage note:
// to export a function only, use module.exports
// otherwise, export an object using exports

// const searchStrings = require('./searchStrings.js');

// sample return
// [
//   // 'I Need To Sell My House Fast In Richmond!'
//   'https://www.google.com/search?q=sell+my+house+now+in+richmond+virginia\n',
//   'https://www.google.com/search?q=sell+my+house+now+in+richmond+virginia&start=10\n',
//   'https://www.google.com/search?q=sell+my+house+now+in+richmond+virginia&start=20\n',
//   'https://www.google.com/search?q=sell+my+house+fast+in+richmond+virginia\n',
//   'https://www.google.com/search?q=sell+my+house+fast+in+richmond+virginia&start=10\n',
//   'https://www.google.com/search?q=sell+my+house+fast+in+richmond+virginia&start=20\n',
// ];

// also search at:
// https://www.whitepages.com/business/VA/Richmond/Sell-My-House-Now
// https://www.yelp.com/search?find_desc=sell+my+house+for+cash&find_loc=richmond%2C+va&ns=1
// https://www.yellowpages.com/search?search_terms=sell+my+house+for+cash&geo_location_terms=Richmond%2C+VA

const conjunction = 'in';
const pageStrBase = '&start=';
const prefix = 'https://www.google.com/search?q=';
const resultsPerPage = 10;
const suffix = '\n';
const delimeter = '+';
const empty = '';
const space = ' ';
// const spaceRe = /\s/gm;

const getPageString = pageNumber =>
  pageNumber ? [ pageStrBase, (  pageNumber * resultsPerPage ), ].join(empty) : empty;

  const getBody = ( s, city, state, ) => {
  const str = [ s, conjunction, city, state, ].join(space);
  const out = str.split(space).join(delimeter);
  return out;
}

const getLine = ( s, city, state, page, ) => {
  const pgStr = getPageString( page );
  // const body = s.replace( sp, del, );
  const body = getBody( s, city, state, );
  const outLine = [ prefix, body, pgStr, suffix, ].join(empty);
  return outLine;
}

module.exports = ({ pageDepth, city, state, searchStrings, }) => {
  const out = [];
  searchStrings.forEach( searchString => {
    let i = pageDepth; while(i--) {
      const nextLine = getLine( searchString, city, state, i, );
      out.push(nextLine);
    }
  });
  return out;
}