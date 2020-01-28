// puppeteer: https://github.com/GoogleChrome/puppeteer
// examples: https://github.com/GoogleChrome/puppeteer/tree/master/examples/
// live coding: https://www.youtube.com/watch?v=pixfH6yyqZk

// scrapes auction.com to send auction data to google sheets

// const puppeteer = require('puppeteer'); // npm i puppeteer -s
const _ = require('lodash'); // npm i lodash -s
const arrayOfObjects2csv = require('../../util/json2csv');
const write2gas = require('../../lib/db/write2gas');
const write2db = require('../../lib/db/write2firestore');
const todayDate = require('../../util/todayDate');
// const isScheduled = require('../../util/scheduler');
// const fs = require('file-system');
// const ObjectsToCsv = require('objects-to-csv'); // uninstalled // alternative to: https://www.npmjs.com/package/json2csv

// increment counters
// ref: https://firebase.google.com/docs/firestore/manage-data/add-data#increment_a_numeric_value
// ref: https://fireship.io/snippets/firestore-increment-tips/
const admin = require('firebase-admin');
const incrementer = admin.firestore.FieldValue;

// called by auctionMacro.js
// const scriptName = 'auctionList';

const {
  // todaysDate, todaysMonth,
  monthsArray, timestamp, formattedDate,
  todaysDayOfTheMonth, todaysMonthOneIndex, todaysYear,
} = todayDate;

const dbConfig = {
  source: 'auction',
  inventoryList: {
    collection: 'inventory',
    // doc: getLocationIndex(config), // 'us-va-virginia-beach'
  },
  states: {
    collection: 'states',
    doc: formattedDate,
  },
  stats: {
    collection: 'stats',
    doc: formattedDate,
  },
  // parsedUrls: {
  //   collection: 'domains',
  //   // docs: , // domainList (later)
  // },
};

// const getMarket = ( city, state, country='us', ) => {
//   const splitter = ' ';
//   const JOINER = '-';
//   const out1 = [ country, state, city, ].join(JOINER);
//   const out2 = out1.split(splitter).join(JOINER);
//   const out3 = out2.toLowerCase();
//   return out3;
// };

// const getUrl = ( city, state, ) => {
//   const CITY_JOINER = '_';
//   const JOINER = '/';
//   const prefix = 'https://www.auction.com/residential';
//   const citySuffix = 'ct';
//   const suffix = 'active_lt/resi_sort_v2_st/y_nbs/';
//   const citySection = [ city, citySuffix, ].join(CITY_JOINER); // 'Danville_ct'
//   const out = [ prefix, state, citySection, suffix ].join(JOINER);
//   return out; // 'https://www.auction.com/residential/VA/Danville_ct/active_lt/resi_sort_v2_st/y_nbs/'
//   // virginia // 'https://www.auction.com/residential/Virginia/active_lt/resi_sort_v2_st/y_nbs/
//   // virginia // 'https://www.auction.com/residential/VA/active_lt/resi_sort_v2_st/y_nbs/
//   // reserve  // 'https://www.auction.com/residential/VA/active_lt/resi_sort_v2_st/y_sr/y_nbs/'
//   // page 2   // 'https://www.auction.com/residential/CA/active_lt/resi_sort_v2_st/y_sr/2_cp/y_nbs/'
//   // page 3   // 'https://www.auction.com/residential/CA/active_lt/resi_sort_v2_st/y_sr/3_cp/y_nbs/'
// }

const getIsCurrent = (listAuctionDateDay, listAuctionDateMonthNumber, listAuctionDateYear,) => {
  // console.log('todaysDate', todaysDayOfTheMonth,);
  // console.log('todaysMonth', todaysMonthOneIndex,);
  // console.log('todaysYear', todaysYear,);
  // console.log('listAuctionDateDay', listAuctionDateDay,);
  // console.log('listAuctionDateMonthNumber', listAuctionDateMonthNumber,);
  // console.log('listAuctionDateYear', listAuctionDateYear,);
  const sameDay   = ( listAuctionDateDay         === todaysDayOfTheMonth );
  const sameMonth = ( listAuctionDateMonthNumber === todaysMonthOneIndex );
  const sameYear  = ( listAuctionDateYear        === todaysYear          );
  const out = ( sameDay && sameMonth && sameYear );
  // console.log('isCurrent', out,);
  return out;
}

const IS_WRITE_TO_DB = false; // true; //
const IS_WRITE_TO_GAS = false;
const MAXIMUM_RUN_TIME = 45000; // max run time before auto timeout // default: 30000 // 0 turns it off
const source = 'auction.com';
const options = {
  timeout: MAXIMUM_RUN_TIME, // default: 30000; 0 turns it off
  waitUntil: 'load',
};
const COMMA_SPACE = ', ';
const SINGLE_SPACE = ' ';
// const ALL_COMMAS = /,*/g;
const NON_DIGITS = /\D*/g;
const CURRENCY_CHARS = /(\$*,*)/g;
// const JOINER = '-';
const EMPTY_STRING = '';
const DEFAULT_RESULT = null; // useful for writing to firestore // 'N/A'; // useful when writing to GAS

const getUrl = ( state = null, pageNumber = 1, ) => ({
  date:
    `https://www.auction.com/residential/active_lt/auction_date_order,resi_sort_v2_st/${pageNumber}_cp/2020_mt/y_nbs/`,
    // by date  // 'https://www.auction.com/residential/active_lt/auction_date_order,resi_sort_v2_st/13_cp/2020_mt/y_nbs/'
  state: 
    `https://www.auction.com/residential/${state}/active_lt/resi_sort_v2_st/y_sr/${pageNumber}_cp/y_nbs/`,
    // city, st // 'https://www.auction.com/residential/VA/Danville_ct/active_lt/resi_sort_v2_st/y_nbs/'
    // virginia // 'https://www.auction.com/residential/Virginia/active_lt/resi_sort_v2_st/y_nbs/
    // virginia // 'https://www.auction.com/residential/VA/active_lt/resi_sort_v2_st/y_nbs/
    // reserve  // 'https://www.auction.com/residential/VA/active_lt/resi_sort_v2_st/y_sr/y_nbs/'
    // page 2   // 'https://www.auction.com/residential/CA/active_lt/resi_sort_v2_st/y_sr/2_cp/y_nbs/'
    // page 3   // 'https://www.auction.com/residential/CA/active_lt/resi_sort_v2_st/y_sr/3_cp/y_nbs/'
})

const config = {
  selector: 'div[data-elm-id="asset_list_content"] a',
  container: 'div[class^="styles__asset-container"]',
  subSelectors: {
    // listDetailUrlSelector: , // /details/291-turpin-st-danville-va-24541-2871813-e_13953a
    listAddress         : 'h4[data-elm-id$="_address_content_1"]'            , // 170 GROVE PARK CIRCLE
    listCsz             : 'label[data-elm-id$="_address_content_2"]'         , // DANVILLE, VA 24541, Danville city County
    listAuctionDateRaw  : 'h4[data-elm-id$="_auction_date"]'                 , // Nov 22, 3:00pm
    listAuctionType     : 'label[data-elm-id$="_auction_type"]'              , // Foreclosure Sale, In Person | Bank Owned, Online
    listBeds            : 'h4[data-elm-id$="_beds"]'                         , // 3
    listBaths           : 'h4[data-elm-id$="_baths"]'                        , // 2
    listSqft            : 'h4[data-elm-id$="_sqft"]'                         , // 1,410
    listArv             : 'h4[data-elm-id="label_after_repair_value_value"]' , // $149,000
    listReserve         : 'h4[data-elm-id="label_reserve_value"]'            , // $25,000
    listOpeningBid      : 'h4[data-elm-id="label_starting_bid_value"]'       , // $25,000
    listNoBuyersPremium : 'label[data-elm-id$="_No Buyer\'s Premium_label"]' , // No Buyer's Premium
    listVacant          : 'label[data-elm-id$="_Vacant_label"]'              , // Vacant
  },
};

const pageFunction = ( items, { container, subSelectors, }, ) => {
  const JOINER = ' ';
  const defaultValue = 'N/A';
  // const keys = Object.keys( subSelectors );
  const result = items.map( item => {
    const out = { listDetailUrl: ( item.href || defaultValue )};
    // keys.forEach( key => {
    for(const key in subSelectors) {
      const qSel = [ container, subSelectors[key], ].join(JOINER);
      const itemQSel = item.querySelector(qSel);
      out[key] = (itemQSel && itemQSel.innerText.trim()) || defaultValue;
    }
    // })
    return out;
  });
  return result;
}

const doWriteOut = ( formattedItems, states, stats, ) => {
  // write to GAS
  if ( IS_WRITE_TO_GAS ){
    const itemsAsCsv = arrayOfObjects2csv(formattedItems);
    // console.log('itemsAsCsv\n', itemsAsCsv,);
    write2gas(itemsAsCsv);
  } else {
    console.log('Would have written to GAS:', formattedItems,);
  }
  // write to firestore db
  if ( IS_WRITE_TO_DB ){
    const data = {
      stats, inventoryList: formattedItems, // states,
    };
    // handle sortBy === 'states'
    if( states && !_.isEmpty(states) ) data.states = states;
    write2db({ dbConfig, data, });
  } else {
    console.log( 'Would have written to DB:');
    console.log( 'stats'     , stats          , );
    console.log( 'states'    , states         , );
    console.log( 'inventory' , formattedItems , );
  }
};

const str2num = c => Number(c && c.replace(CURRENCY_CHARS, EMPTY_STRING,)) || DEFAULT_RESULT;
const str2titleCase = s => _.startCase(_.toLower(s));
const milHour = s => {
  // s = '10:00am';
  const pm = 'pm';
  const ampmSlice = -2;
  const pmAdder = 1200;
  const ampm = s.slice(ampmSlice);
  const lowercaseAmpm = ampm.toLowerCase();
  const isPm = ( lowercaseAmpm == pm );
  const pmAdj = isPm * pmAdder;
  const baseHrStr = s.replace(NON_DIGITS, EMPTY_STRING,);
  const baseHrNum = parseInt(baseHrStr);
  const out = baseHrNum + pmAdj;
  return out;
}

const processDate = s => {
  let listAuctionDateMonthText = listAuctionDateTimestamp = listAuctionDateMonthNumber =
    listAuctionDateYear = listAuctionDateDay = listAuctionDateTime = DEFAULT_RESULT;
  listAuctionDateYear = todaysYear;
  const defaultDate = {
    listAuctionDateMonthText, listAuctionDateMonthNumber,
    listAuctionDateDay, listAuctionDateTime,
    listAuctionDateYear, listAuctionDateTimestamp,
  }
  const split = s.split(SINGLE_SPACE);
  
  const ready1 = split;
  if(!ready1) return defaultDate;

  const splitLength = split && split.length;
  
  const ready2 = !!splitLength;
  if(!ready2) return defaultDate;

  switch( splitLength ) {
    case 3 :
      // s = 'Nov 26, 10:00am'
      listAuctionDateDay = str2num(split[1]) || DEFAULT_RESULT;
      listAuctionDateTime = milHour(split[2]) || DEFAULT_RESULT;
      break;
    case 4 :
      // s = 'Nov 19 - 21' // time: Nov 21, 12:01 AM
      // listAuctionDateDay = str2num(split[3]) || DEFAULT_RESULT; // end of auction
      listAuctionDateDay = str2num(split[1]) || DEFAULT_RESULT; // start of auction
      listAuctionDateTime = 0;
      break;
    case 7 :
      // s = 'Dec 31, 2019 - Jan 2, 2020'
      // listAuctionDateDay = str2num(split[3]) || DEFAULT_RESULT; // end of auction
      listAuctionDateDay = str2num(split[1]) || DEFAULT_RESULT; // start of auction
      listAuctionDateTime = 0;
      break;
    default:
      // listAuctionDateDay = listAuctionDateTime = DEFAULT_RESULT;
  }
  
  // handle month and year
  listAuctionDateMonthText = split[0];
  const listAuctionDateMonthNumberRaw = monthsArray.indexOf(listAuctionDateMonthText) || DEFAULT_RESULT;
  listAuctionDateMonthNumber = ( listAuctionDateMonthNumberRaw === -1 )
    ? DEFAULT_RESULT : (listAuctionDateMonthNumberRaw + 1);
  // edge case: last week of the year
  // increment year if currently december and auction month is january
  // // if((todaysMonthOneIndex === 11) && (listAuctionDateMonthNumber < 3)) {
  const dateYearReady1 = !!listAuctionDateMonthNumber;
  const dateYearReady2 = ( todaysMonthOneIndex - listAuctionDateMonthNumber ) > 6;
  const dateYearReady3 = dateYearReady1 && dateYearReady2;
  if( !dateYearReady1 ) listAuctionDateYear = DEFAULT_RESULT;
  else if ( dateYearReady3 ) listAuctionDateYear = listAuctionDateYear + 1;
  
  // handle hours and minutes
  const hoursMinutesString = (listAuctionDateTime && listAuctionDateTime.toString()) || DEFAULT_RESULT;
  const listAuctionDateHours = (hoursMinutesString && Number(hoursMinutesString.slice( 0, -2, ))) || DEFAULT_RESULT;
  const listAuctionDateMinutes = (hoursMinutesString && Number(hoursMinutesString.slice( -2 ))) || DEFAULT_RESULT;
  
  const listAuctionDateDate = new Date (
    listAuctionDateYear, listAuctionDateMonthNumberRaw, listAuctionDateDay,
    listAuctionDateHours, listAuctionDateMinutes,
  );
  // console.log('listAuctionDateDate', listAuctionDateDate);
  listAuctionDateTimestamp = listAuctionDateDate.getTime();
  // console.log('listAuctionDateTimestamp', listAuctionDateTimestamp);
  
  const out = {
    listAuctionDateYear, listAuctionDateMonthText, listAuctionDateMonthNumber,
    listAuctionDateDay, listAuctionDateTime, listAuctionDateHours, listAuctionDateMinutes,
    listAuctionDateDate, listAuctionDateTimestamp,
  };
  return out;
}

const formatItems = ( url, items, ) => items.map( item => {
  // filters for current items only
  // const listDetailUrl = `https://www.auction.com${item.listDetailUrl}`;
  // const listCsz = str2titleCase(item.listCsz); // reformats state undesirably
  const listAddress = (str2titleCase(item.listAddress)) || DEFAULT_RESULT;
  console.log('listAddress', listAddress,);
  const listCszSplit = (item.listCsz && item.listCsz.split(COMMA_SPACE)) || DEFAULT_RESULT;
  const listCity = (listCszSplit && str2titleCase(listCszSplit[0])) || DEFAULT_RESULT;
  const listCounty = (listCszSplit && str2titleCase(listCszSplit[2])) || DEFAULT_RESULT;
  const listStateZip = (listCszSplit && listCszSplit[1]) || DEFAULT_RESULT;
  const listStateZipSplit = (listStateZip && listStateZip.split(SINGLE_SPACE)) || DEFAULT_RESULT;
  const listState = (listStateZipSplit && listStateZipSplit[0]) || DEFAULT_RESULT;
  console.log('listState', listState,);
  const listZip = (listStateZipSplit && listStateZipSplit[1]) || DEFAULT_RESULT;
  // const listAuctionDateSplit = (item.listAuctionDateRaw && item.listAuctionDateRaw.split(SINGLE_SPACE)) || DEFAULT_RESULT;
  // const listAuctionDateMonthText = (listAuctionDateSplit && listAuctionDateSplit[0] && listAuctionDateSplit[0].replace(ALL_COMMAS, EMPTY_STRING,)) || DEFAULT_RESULT;
  // const listAuctionDateMonthNumber = (monthsArray.indexOf(listAuctionDateMonthText) + 1) || DEFAULT_RESULT;
  // const listAuctionDateDay = (listAuctionDateSplit && str2num(listAuctionDateSplit[1])) || DEFAULT_RESULT;
  // const listAuctionDateTime = (listAuctionDateSplit && listAuctionDateSplit[2]) || DEFAULT_RESULT;
  const processedDate = processDate(item.listAuctionDateRaw);
  const {
    listAuctionDateYear, listAuctionDateMonthText, listAuctionDateMonthNumber,
    listAuctionDateDay, listAuctionDateTime, listAuctionDateHours, listAuctionDateMinutes,
    listAuctionDateDate, listAuctionDateTimestamp,
  } = processedDate;
  // const listAuctionDateTimestamp = new Date(2018, 11, 24, 10, 33, 30, 0);
  const listAuctionTypeSplit = (item.listAuctionType && item.listAuctionType.split(COMMA_SPACE)) || DEFAULT_RESULT;
  const listForeclosureOrBankOwned = (listAuctionTypeSplit && listAuctionTypeSplit[0]) || DEFAULT_RESULT;
  const listInPersonOrOnline = (listAuctionTypeSplit && listAuctionTypeSplit[1]) || DEFAULT_RESULT;
  const listArv = (item.listArv && str2num(item.listArv)) || DEFAULT_RESULT;
  const listReserve = (item.listReserve && str2num(item.listReserve)) || DEFAULT_RESULT;
  const listOpeningBid = (item.listOpeningBid && str2num(item.listOpeningBid)) || DEFAULT_RESULT;
  const listBeds  = (item.listBeds  && Number(item.listBeds))  || DEFAULT_RESULT;
  const listBaths = (item.listBaths && Number(item.listBaths)) || DEFAULT_RESULT;
  const listSqft  = (item.listSqft  && str2num(item.listSqft)) || DEFAULT_RESULT;
  const isCurrent = getIsCurrent(listAuctionDateDay, listAuctionDateMonthNumber, listAuctionDateYear,);
  const out = {
    // meta data
    source, timestamp, isCurrent, formattedDate, 
    listUrl: url, hasAgent: false, // market,
    // basic facts
    ...item, listTimestamp: timestamp, listBeds, listBaths, listSqft,
    listAddress, listCity, listState, listZip, listCounty, // listCsz, listDetailUrl, 
    listForeclosureOrBankOwned, listInPersonOrOnline, listArv, listReserve, listOpeningBid,
    // date timeline
    listAuctionDateYear, listAuctionDateMonthText, listAuctionDateMonthNumber,
    listAuctionDateDay, listAuctionDateTime, listAuctionDateHours, listAuctionDateMinutes,
    listAuctionDateDate, listAuctionDateTimestamp,
  };
  return isCurrent && out;
});

// const run = async ( state, pageNumber, ) => {
module.exports = async ({ page, data: { state=null, pageNumber, sortBy='state', }, }) => {
  console.log('sortBy', sortBy,); // 'state' | 'date'
  console.log('state', state,);
  console.log('pageNumber', pageNumber,);

  // // schedule it
  // if(!isScheduled(scriptName)) return;

  // const arrayOfObjects2csv = items => {
  //   // ref: https://stackoverflow.com/a/31536517
  //   // const items = json3.items;
  //   const EMPTY_STRING = '';
  //   const comma = ',';
  //   const returnNewLine = '\r\n';
  //   const replacer = (key, value) => value === null ? EMPTY_STRING : value;// specify how you want to handle null values here
  //   const header = Object.keys(items[0]);
  //   let csv = items.map(row => header.map( fieldName => JSON.stringify(row[fieldName], replacer)).join(comma));
  //   csv.unshift(header.join(comma));
  //   csv = csv.join(returnNewLine);
  //   // console.log(csv);
  //   return csv;
  // }

  // const selector = {
  //   list: {
  //     // scraping: https://www.auction.com/residential/danville,%20virginia_qs/active_lt/resi_sort_v2_st/y_nbs/
  //     group: 'div[data-elm-id="asset_list_content"] div[class^="styles__asset-container"]', // nodelist[n]
  //     individual: {
  //       address         : 'h4[data-elm-id$="_address_content_1"]'            , // 170 GROVE PARK CIRCLE
  //       csz             : 'label[data-elm-id$="_address_content_2"]'         , // DANVILLE, VA 24541, Danville city County
  //       auctionDate     : 'h4[data-elm-id$="_auction_date"]'                 , // Nov 22, 3:00pm
  //       auctionType     : 'label[data-elm-id$="_auction_type"]'              , // Foreclosure Sale, In Person | Bank Owned, Online
  //       beds            : 'h4[data-elm-id$="_beds"]'                         , // 3
  //       baths           : 'h4[data-elm-id$="_baths"]'                        , // 2
  //       sqft            : 'h4[data-elm-id$="_sqft"]'                         , // 1,410
  //       arv             : 'h4[data-elm-id="label_after_repair_value_value"]' , // $149,000
  //       reserve         : 'h4[data-elm-id="label_reserve_value"]'            , // $25,000
  //       openingBid      : 'h4[data-elm-id="label_starting_bid_value"]'       , // $25,000
  //       noBuyersPremium : 'label[data-elm-id$="_No Buyer\'s Premium_label"]' , // No Buyer's Premium
  //       vacant          : 'label[data-elm-id$="_Vacant_label"]'              , // Vacant
  //     },
  //   },
  //   detail: {
  //     // scraping: https://www.auction.com/details/170-grove-park-circle-danville-va-24541-2869818-e_13953x
  //     property: {
  //       auctionType  : 'span[data-elm-id="asset_type_label"]'             , // foreclosure | bank-owned
  //       address      : 'h1[data-elm-id="property_header_address"]'        , // 170 GROVE PARK CIRCLE
  //       location     : 'h1[data-elm-id="property_header_location"]'       , // DANVILLE, Virginia 24541
  //       arv          : 'div[data-elm-id="arv_value"]'                     , // $149,000
  //       creditBid    : 'div[data-elm-id="est_credit_bid_value"]'          , // Not Disclosed
  //       beds         : 'div[data-elm-id="total_bedrooms_value"]'          , // -
  //       baths        : 'div[data-elm-id="total_bathrooms_value"]'         , // -
  //       sqft         : 'div[data-elm-id="interior_square_footage_value"]' , // -
  //       lot          : 'div[data-elm-id="exterior_acerage_value"]'        , // -
  //       propertyType : 'div[data-elm-id="property_type_value"]'           , // -
  //       yearBuilt    : 'div[data-elm-id="year_built_value"]'              , // -
  //       propertyId   : 'div[data-elm-id="property_id_value"]'             , // 2869818
  //       eventId      : 'div[data-elm-id="event_id_value"]'                , // E13953X-21500
  //       fileNumber   : 'div[data-elm-id="trusteeSaleNo_value"]'           , // 221266
  //       apn          : 'div[data-elm-id="apn_value"]'                     , // 54431
  //       occupied     : 'strong[data-elm-id="occupancy_badge_label"]'      , // Occupied:
  //     },
  //     auction: {
  //       group            : 'div."ui raised segments"'                    ,
  //       auctionVenue     : 'h4[data-elm-id*="u-mb-3"]'                   , // In-Person Auction
  //       date             : 'div[data-elm-id="date_value"]'               , // Friday, Nov 22, 2019
  //       auctionStartTime : 'div[data-elm-id="auction_start_time_value"]' , // 03:00 pm
  //       venueAddress     : 'div[data-elm-id="venue_address"]'            , // 401 Patton St., Danville, VA 24543
  //     },
  //   },
  // }
  // // the above object can not be parsed inside page.evaluate()
  // // ref: https://github.com/GoogleChrome/puppeteer/issues/1423

  // define selectors individually

  // // list page
  // // scraping: https://www.auction.com/residential/danville,%20virginia_qs/active_lt/resi_sort_v2_st/y_nbs/
  // const LIST_GROUP             = 'div[data-elm-id="asset_list_content"] div[class^="styles__asset-container"]' ; // nodelist[n]
  // const LIST_ADDRESS           = 'h4[data-elm-id$="_address_content_1"]'            ; // 170 GROVE PARK CIRCLE
  // const LIST_CSZ               = 'label[data-elm-id$="_address_content_2"]'         ; // DANVILLE, VA 24541, Danville city County
  // const LIST_AUCTION_DATE      = 'h4[data-elm-id$="_auction_date"]'                 ; // Nov 22, 3:00pm
  // const LIST_AUCTION_TYPE      = 'label[data-elm-id$="_auction_type"]'              ; // Foreclosure Sale, In Person | Bank Owned, Online
  // const LIST_BEDS              = 'h4[data-elm-id$="_beds"]'                         ; // 3
  // const LIST_BATHS             = 'h4[data-elm-id$="_baths"]'                        ; // 2
  // const LIST_SQFT              = 'h4[data-elm-id$="_sqft"]'                         ; // 1,410
  // const LIST_ARV               = 'h4[data-elm-id="label_after_repair_value_value"]' ; // $149,000
  // const LIST_RESERVE           = 'h4[data-elm-id="label_reserve_value"]'            ; // $25,000
  // const LIST_OPENING_BID       = 'h4[data-elm-id="label_starting_bid_value"]'       ; // $25,000
  // const LIST_NO_BUYERS_PREMIUM = 'label[data-elm-id$="_No Buyer\'s Premium_label"]' ; // No Buyer's Premium
  // const LIST_VACANT            = 'label[data-elm-id$="_Vacant_label"]'              ; // Vacant

  // // detail page
  // // scraping: https://www.auction.com/details/170-grove-park-circle-danville-va-24541-2869818-e_13953x
  // // property section
  // const DETAIL_AUCTION_TYPE  = 'span[data-elm-id="asset_type_label"]'             ; // foreclosure | bank-owned
  // const DETAIL_ADDRESS       = 'h1[data-elm-id="property_header_address"]'        ; // 170 GROVE PARK CIRCLE
  // const DETAIL_CSZ           = 'h1[data-elm-id="property_header_location"]'       ; // DANVILLE, Virginia 24541
  // const DETAIL_ARV           = 'div[data-elm-id="arv_value"]'                     ; // $149,000
  // const DETAIL_CREDIT_BID    = 'div[data-elm-id="est_credit_bid_value"]'          ; // Not Disclosed
  // const DETAIL_BEDS          = 'div[data-elm-id="total_bedrooms_value"]'          ; // -
  // const DETAIL_BATHS         = 'div[data-elm-id="total_bathrooms_value"]'         ; // -
  // const DETAIL_SQFT          = 'div[data-elm-id="interior_square_footage_value"]' ; // -
  // const DETAIL_LOT           = 'div[data-elm-id="exterior_acerage_value"]'        ; // -
  // const DETAIL_PROPERTY_TYPE = 'div[data-elm-id="property_type_value"]'           ; // -
  // const DETAIL_YEAR_BUILT    = 'div[data-elm-id="year_built_value"]'              ; // -
  // const DETAIL_PROPERTY_ID   = 'div[data-elm-id="property_id_value"]'             ; // 2869818
  // const DETAIL_EVENT_ID      = 'div[data-elm-id="event_id_value"]'                ; // E13953X-21500
  // const DETAIL_FILE_NUMBER   = 'div[data-elm-id="trusteeSaleNo_value"]'           ; // 221266
  // const DETAIL_APN           = 'div[data-elm-id="apn_value"]'                     ; // 54431
  // const DETAIL_OCCUPIED      = 'strong[data-elm-id="occupancy_badge_label"]'      ; // Occupied:
  
  // // auction section
  // const AUCTION_GROUP         = 'div."ui raised segments"'                    ;
  // const AUCTION_VENUE         = 'h4[data-elm-id*="u-mb-3"]'                   ; // In-Person Auction
  // const AUCTION_DATE          = 'div[data-elm-id="date_value"]'               ; // Friday, Nov 22, 2019
  // const AUCTION_START_TIME    = 'div[data-elm-id="auction_start_time_value"]' ; // 03:00 pm
  // const AUCTION_VENUE_ADDRESS = 'div[data-elm-id="venue_address"]'            ; // 401 Patton St., Danville, VA 24543
  
  // // ref: https://github.com/GoogleChrome/puppeteer
  // // cheatsheet: https://nitayneeman.com/posts/getting-to-know-puppeteer-using-practical-examples/
  // // forms: https://stackoverflow.com/questions/45778181/puppeteer-how-to-submit-a-form
  // const browser = await puppeteer.launch({ 
  //   // headless: false, // uncomment when form testing for visual context and fedback
  //   slowMo: 1000,
  // });

  // const page = await browser.newPage();

  // log
  // // allow console.log() inside page methods // ref: https://stackoverflow.com/a/46245945
  // page.on('console', consoleObj => console.log(consoleObj.text()));
  // augment above to filter warnings // ref: https://stackoverflow.com/a/49101258
  page.on('console', consoleMessageObject =>
    (consoleMessageObject._type === 'log') ? // 'error', 'warning'
    console.debug(consoleMessageObject._text) : null
  );

  // await page.goto('https://example.com');
  const url = getUrl( state, pageNumber, )[sortBy];
  // console.log('url', url,); return;
  // // const market = [ 'us', state, ].join(JOINER).toLowerCase();
  await page.goto( url, options, );

  // handle errors
  // ref: https://github.com/puppeteer/puppeteer/issues/1030#issuecomment-336631036
  // Error 503 Site temporarily unavailable
  // happens during scheduled maintenance; e.g., friday evening
  const ready = true;
  page.on( 'error', err => {
    ready = false;
    console.log( 'error:', err, );
  });
  page.on('pageerror', pageerr => {
    ready = false;
    console.log( 'pageerror occurred:', pageerr, );
  });
  if( !ready ) return;

  const items = await page.$$eval( config.selector, pageFunction, config, );
 
  // console.log( 'items\n'       , items        , );
  // console.log( 'items count: ' , items.length , );

  // await browser.close();

  // compute and format items
  const formattedItems = formatItems( url, items, );
  // console.log('formattedItems\n', formattedItems,);

  // callback
  const itemsCount = items.length;
  const currentItems = formattedItems.filter(Boolean).length;
  const stats = {
    pagesAttempted: incrementer.increment(1),
  };
  const states = {};
  states[state] = {
    pagesAttempted: incrementer.increment(1),
  };
  if( itemsCount ) {
    // items found on page
    stats         .pagesCount   = incrementer.increment(1);
    states[state] .pagesCount   = incrementer.increment(1);
    stats         .itemsCount   = incrementer.increment(itemsCount);
    states[state] .itemsCount   = incrementer.increment(itemsCount);
    stats         .currentItems = incrementer.increment(currentItems);
    states[state] .currentItems = incrementer.increment(currentItems);
  } else {
    // no items found on page
    states[state].isActive  = false; // encountered page with no data
    states[state].isCurrent = false; // encountered page with no data
  }
  doWriteOut( formattedItems, states, stats, );
};
// run('ny', 1);

// node scrape.js
// curl -L --data-binary @data/scrape.csv https://script.google.com/macros/s/AKfycbyRT8_eiROa8oCVEQV0nX2bQpxcA4b9Eq2zGpp2LNW0p4ue37_G/exec