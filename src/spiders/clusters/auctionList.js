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
const isScheduled = require('../../util/scheduler');
// const fs = require('file-system');
// const ObjectsToCsv = require('objects-to-csv'); // uninstalled // alternative to: https://www.npmjs.com/package/json2csv

// called by auctionMacro.js
const scriptName = 'auctionList';

const {
  // todaysDate, todaysMonth,
  monthsArray, timestamp, todaysDayOfTheMonth, todaysMonthOneIndex, todaysYear,
} = todayDate;

const dbConfig = {
  source: 'auction',
  inventoryList: {
    collection: 'inventory',
    // doc: getLocationIndex(config), // 'us-va-virginia-beach'
  },
  // parsedUrls: {
  //   collection: 'domains',
  //   // docs: , // domainList (later)
  // },
};

// const getMarket = ( city, state, country='us', ) => {
//   const splitter = ' ';
//   const joiner = '-';
//   const out1 = [ country, state, city, ].join(joiner);
//   const out2 = out1.split(splitter).join(joiner);
//   const out3 = out2.toLowerCase();
//   return out3;
// };

// const getUrl = ( city, state, ) => {
//   const cityJoiner = '_';
//   const joiner = '/';
//   const prefix = 'https://www.auction.com/residential';
//   const citySuffix = 'ct';
//   const suffix = 'active_lt/resi_sort_v2_st/y_nbs/';
//   const citySection = [ city, citySuffix, ].join(cityJoiner); // 'Danville_ct'
//   const out = [ prefix, state, citySection, suffix ].join(joiner);
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
  console.log('isCurrent', out,);
  return out;
}

const getUrl = ( state, pageNumber = 1, ) =>
  `https://www.auction.com/residential/${state}/active_lt/resi_sort_v2_st/y_sr/${pageNumber}_cp/y_nbs/`;
  // city, st // 'https://www.auction.com/residential/VA/Danville_ct/active_lt/resi_sort_v2_st/y_nbs/'
  // virginia // 'https://www.auction.com/residential/Virginia/active_lt/resi_sort_v2_st/y_nbs/
  // virginia // 'https://www.auction.com/residential/VA/active_lt/resi_sort_v2_st/y_nbs/
  // reserve  // 'https://www.auction.com/residential/VA/active_lt/resi_sort_v2_st/y_sr/y_nbs/'
  // page 2   // 'https://www.auction.com/residential/CA/active_lt/resi_sort_v2_st/y_sr/2_cp/y_nbs/'
  // page 3   // 'https://www.auction.com/residential/CA/active_lt/resi_sort_v2_st/y_sr/3_cp/y_nbs/'

const isWrite2db = true;
const isWrite2gas = false;
const source = 'auction.com';
const options = {
  waitUntil: 'load',
};
const splitter1 = ' ';
const splitter2 = ', ';
// const allCommas = /,*/g;
const nonDigits = /\D*/g;
const currencyChars = /(\$*,*)/g;
// const joiner = '-';
const emptyString = '';
const defaultResult = null; // useful for writing to firestore // 'N/A'; // useful when writing to GAS

const selector = 'div[data-elm-id="asset_list_content"] a';
const pageFunction = items => {
  const defaultValue = 'N/A';
  const container = 'div[class^="styles__asset-container"]';
  const configSelectors = {
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
  };
  const keys = Object.keys(configSelectors);
  return items.map( item => {
    const out = { listDetailUrl: ( item.href || defaultValue ) };
    keys.forEach( key => {
      out[key] = (
        item.querySelector( `${container} ${configSelectors[key]}` ) && 
        item.querySelector( `${container} ${configSelectors[key]}` ).innerText.trim()
      ) || defaultValue;
    })
    return out;
  });
}

const str2num = c => Number(c && c.replace(currencyChars, emptyString,)) || defaultResult;
const titleCase = s => _.startCase(_.toLower(s));
const milHour = s => {
  // s = '10:00am';
  const pm = 'pm';
  const ampmSlice = -2;
  const pmAdder = 1200;
  const ampm = s.slice(ampmSlice);
  const lowercaseAmpm = ampm.toLowerCase();
  const isPm = ( lowercaseAmpm == pm );
  const pmAdj = isPm * pmAdder;
  const baseHrStr = s.replace(nonDigits, emptyString,);
  const baseHrNum = parseInt(baseHrStr);
  const out = baseHrNum + pmAdj;
  return out;
}

const processDate = s => {
  let listAuctionDateMonthText = listAuctionDateTimestamp = listAuctionDateMonthNumber =
    listAuctionDateYear = listAuctionDateDay = listAuctionDateTime = defaultResult;
  listAuctionDateYear = todaysYear;
  const defaultDate = {
    listAuctionDateMonthText, listAuctionDateMonthNumber,
    listAuctionDateDay, listAuctionDateTime,
    listAuctionDateYear, listAuctionDateTimestamp,
  }
  const split = s.split(splitter1);
  
  const ready1 = split;
  if(!ready1) return defaultDate;

  const splitLength = split && split.length;
  
  const ready2 = !!splitLength;
  if(!ready2) return defaultDate;

  switch( splitLength ) {
    case 3 :
      // s = 'Nov 26, 10:00am'
      listAuctionDateDay = str2num(split[1]) || defaultResult;
      listAuctionDateTime = milHour(split[2]) || defaultResult;
      break;
    case 4 :
      // s = 'Nov 19 - 21' // time: Nov 21, 12:01 AM
      // listAuctionDateDay = str2num(split[3]) || defaultResult; // end of auction
      listAuctionDateDay = str2num(split[1]) || defaultResult; // start of auction
      listAuctionDateTime = 0;
      break;
    case 7 :
      // s = 'Dec 31, 2019 - Jan 2, 2020'
      // listAuctionDateDay = str2num(split[3]) || defaultResult; // end of auction
      listAuctionDateDay = str2num(split[1]) || defaultResult; // start of auction
      listAuctionDateTime = 0;
      break;
    default:
      // listAuctionDateDay = listAuctionDateTime = defaultResult;
  }
  
  // handle month and year
  listAuctionDateMonthText = split[0];
  const listAuctionDateMonthNumberRaw = monthsArray.indexOf(listAuctionDateMonthText) || defaultResult;
  listAuctionDateMonthNumber = ( listAuctionDateMonthNumberRaw === -1 )
    ? defaultResult : (listAuctionDateMonthNumberRaw + 1);
  // edge case: last week of the year
  // increment year if currently december and auction month is january
  // // if((todaysMonthOneIndex === 11) && (listAuctionDateMonthNumber < 3)) {
  const dateYearReady1 = !!listAuctionDateMonthNumber;
  const dateYearReady2 = ( todaysMonthOneIndex - listAuctionDateMonthNumber ) > 6;
  const dateYearReady3 = dateYearReady1 && dateYearReady2;
  if( !dateYearReady1 ) listAuctionDateYear = defaultResult;
  else if ( dateYearReady3 ) listAuctionDateYear = listAuctionDateYear + 1;
  
  // handle hours and minutes
  const hoursMinutesString = (listAuctionDateTime && listAuctionDateTime.toString()) || defaultResult;
  const listAuctionDateHours = (hoursMinutesString && Number(hoursMinutesString.slice(0, -2))) || defaultResult;
  const listAuctionDateMinutes = (hoursMinutesString && Number(hoursMinutesString.slice(-2))) || defaultResult;
  
  const listAuctionDateDate = new Date(
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

const getFormattedItems = ( url, items, ) => items.map( item => {
  // const listDetailUrl = `https://www.auction.com${item.listDetailUrl}`;
  // const listCsz = titleCase(item.listCsz); // reformats state undesirably
  const listAddress = (titleCase(item.listAddress)) || defaultResult;
  console.log('listAddress', listAddress,);
  const listCszSplit = (item.listCsz && item.listCsz.split(splitter2)) || defaultResult;
  const listCity = (listCszSplit && titleCase(listCszSplit[0])) || defaultResult;
  const listCounty = (listCszSplit && titleCase(listCszSplit[2])) || defaultResult;
  const listStateZip = (listCszSplit && listCszSplit[1]) || defaultResult;
  const listStateZipSplit = (listStateZip && listStateZip.split(splitter1)) || defaultResult;
  const listState = (listStateZipSplit && listStateZipSplit[0]) || defaultResult;
  console.log('listState', listState,);
  const listZip = (listStateZipSplit && listStateZipSplit[1]) || defaultResult;
  // const listAuctionDateSplit = (item.listAuctionDateRaw && item.listAuctionDateRaw.split(splitter1)) || defaultResult;
  // const listAuctionDateMonthText = (listAuctionDateSplit && listAuctionDateSplit[0] && listAuctionDateSplit[0].replace(allCommas, emptyString,)) || defaultResult;
  // const listAuctionDateMonthNumber = (monthsArray.indexOf(listAuctionDateMonthText) + 1) || defaultResult;
  // const listAuctionDateDay = (listAuctionDateSplit && str2num(listAuctionDateSplit[1])) || defaultResult;
  // const listAuctionDateTime = (listAuctionDateSplit && listAuctionDateSplit[2]) || defaultResult;
  const processedDate = processDate(item.listAuctionDateRaw);
  const {
    listAuctionDateYear, listAuctionDateMonthText, listAuctionDateMonthNumber,
    listAuctionDateDay, listAuctionDateTime, listAuctionDateHours, listAuctionDateMinutes,
    listAuctionDateDate, listAuctionDateTimestamp,
  } = processedDate;
  // const listAuctionDateTimestamp = new Date(2018, 11, 24, 10, 33, 30, 0);
  const listAuctionTypeSplit = (item.listAuctionType && item.listAuctionType.split(splitter2)) || defaultResult;
  const listForeclosureOrBankOwned = (listAuctionTypeSplit && listAuctionTypeSplit[0]) || defaultResult;
  const listInPersonOrOnline = (listAuctionTypeSplit && listAuctionTypeSplit[1]) || defaultResult;
  const listArv = (item.listArv && str2num(item.listArv)) || defaultResult;
  const listReserve = (item.listReserve && str2num(item.listReserve)) || defaultResult;
  const listOpeningBid = (item.listOpeningBid && str2num(item.listOpeningBid)) || defaultResult;
  const listBeds  = (item.listBeds  && Number(item.listBeds))  || defaultResult;
  const listBaths = (item.listBaths && Number(item.listBaths)) || defaultResult;
  const listSqft  = (item.listSqft  && str2num(item.listSqft)) || defaultResult;
  const isCurrent = getIsCurrent(listAuctionDateDay, listAuctionDateMonthNumber, listAuctionDateYear,);
  const out = {
    // meta data
    timestamp, source, isCurrent, listUrl: url, hasAgent: false, // market,
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

module.exports = async ({ page, data: { state, pageNumber, }, }) => {
  console.log('state', state,);
  console.log('pageNumber', pageNumber,);

  // // schedule it
  // if(!isScheduled(scriptName)) return;

  // const arrayOfObjects2csv = items => {
  //   // ref: https://stackoverflow.com/a/31536517
  //   // const items = json3.items;
  //   const emptyString = '';
  //   const comma = ',';
  //   const returnNewLine = '\r\n';
  //   const replacer = (key, value) => value === null ? emptyString : value;// specify how you want to handle null values here
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
  // await page.goto('https://example.com');
  const url = getUrl( state, pageNumber, );
  // console.log('url', url,); return;
  // // const market = [ 'us', state, ].join(joiner).toLowerCase();
  await page.goto( url, options, );
  const items = await page.$$eval( selector, pageFunction, );
 
  // console.log( 'items\n'       , items        , );
  // console.log( 'items count: ' , items.length , );

  // await browser.close();

  // compute and format items
  const formattedItems = getFormattedItems( url, items, );
  // console.log('formattedItems\n', formattedItems,);

  // [ BEGIN write to GAS ]
  if ( isWrite2gas ){
    const itemsAsCsv = arrayOfObjects2csv(formattedItems);
    // console.log('itemsAsCsv\n', itemsAsCsv,);
    write2gas(itemsAsCsv);
  }
  // [ END write to GAS ]

  // [ BEGIN write to firestore db ]
  if ( isWrite2db ){
    const data = {
      inventoryList: formattedItems,
    };
    write2db({ dbConfig, data, });
  }
  // [ END write to firestore db ]

};

// node scrape.js
// curl -L --data-binary @data/scrape.csv https://script.google.com/macros/s/AKfycbyRT8_eiROa8oCVEQV0nX2bQpxcA4b9Eq2zGpp2LNW0p4ue37_G/exec