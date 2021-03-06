// puppeteer: https://github.com/GoogleChrome/puppeteer
// examples: https://github.com/GoogleChrome/puppeteer/tree/master/examples/
// live coding: https://www.youtube.com/watch?v=pixfH6yyqZk

// scrapes auction.com to send auction data to google sheets

const puppeteer = require('puppeteer'); // npm i puppeteer -s
const _ = require('lodash'); // npm i lodash -s
const arrayOfObjects2csv = require('../../util/json2csv');
const write2gas = require('../../lib/db/write2gas');
const write2db = require('../../lib/db/write2firestore');
const isScheduled = require('../../util/scheduler');
// const fs = require('file-system');
// const ObjectsToCsv = require('objects-to-csv'); // uninstalled // alternative to: https://www.npmjs.com/package/json2csv

const todayDate = require('../../util/todayDate');
const {
  monthsArray, timestamp, todaysDate, todaysYear,
  todaysDayOfTheMonth,  todaysMonth, todaysMonthOneIndex,
} = todayDate;

const scriptName = 'auction';

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

const getMarket = ( city, state, country='us', ) => {
  const splitter = ' ';
  const joiner = '-';
  const out1 = [ country, state, city, ].join(joiner);
  const out2 = out1.split(splitter).join(joiner);
  const out3 = out2.toLowerCase();
  return out3;
};

const getUrl = ( city, state, ) => {
  const cityJoiner = '_';
  const joiner = '/';
  const prefix = 'https://www.auction.com/residential';
  const citySuffix = 'ct';
  const suffix = 'active_lt/resi_sort_v2_st/y_nbs/';
  const citySection = [ city, citySuffix, ].join(cityJoiner); // 'Danville_ct'
  const out = [ prefix, state, citySection, suffix ].join(joiner);
  return out; // 'https://www.auction.com/residential/VA/Danville_ct/active_lt/resi_sort_v2_st/y_nbs/'
  // virginia // 'https://www.auction.com/residential/Virginia/active_lt/resi_sort_v2_st/y_nbs/
  // virginia // 'https://www.auction.com/residential/VA/active_lt/resi_sort_v2_st/y_nbs/
  // reserve  // 'https://www.auction.com/residential/VA/active_lt/resi_sort_v2_st/y_sr/y_nbs/'
  // page 2   // 'https://www.auction.com/residential/CA/active_lt/resi_sort_v2_st/y_sr/2_cp/y_nbs/'
  // page 3   // 'https://www.auction.com/residential/CA/active_lt/resi_sort_v2_st/y_sr/3_cp/y_nbs/'
}

(async () => {
  // schedule it
  if(!isScheduled(scriptName)) return;

  // const xpath = '//h4';
  // const xpath = '//div[@data-elm-id="asset_list_content"]';
  // const xpath = '//div[@data-elm-id="asset_list_content"]/*';
  // const applicationJson = 'application/json';
  // const successMsg = 'The file was saved!';
  // const filePath = './data/scrape.';
  // const exts = {
  //     json : 'json' ,
  //     csv  : 'csv'  ,
  //   };
  // const filePathJson = [ filePath , exts.json , ].join('');
  // const filePathCsv  = [ filePath , exts.csv  , ].join('');
  // const url = 'https://www.auction.com/residential/danville,%20virginia_qs/active_lt/resi_sort_v2_st/y_nbs/' ; // danville, virginia (text)
  // const url = 'https://www.auction.com/residential/North%20Carolina/active_lt/resi_sort_v2_st/y_nbs/'        ; // North Carolina (state)
  // const url = 'https://www.auction.com/residential/Virginia/active_lt/resi_sort_v2_st/y_nbs/'                ; // Virginia (state)
  // const url = 'https://www.auction.com/residential/Virginia/active_lt/resi_sort_v2_st/2_cp/y_nbs/'           ; // Virginia (state) (page 2)
  // const url = 'https://www.auction.com/residential/VA/Danville_ct/active_lt/resi_sort_v2_st/y_nbs/'          ; // Danville, Virginia (city)
  const isWrite2db = false;
  const isWrite2gas = true;
  const targetMarket = {
    city: 'Greensboro',
    state: 'NC',
  };
  const url    = getUrl    ( targetMarket.city , targetMarket.state , );
  const market = getMarket ( targetMarket.city , targetMarket.state , );
  const source = 'auction.com';
  const timestamp = Date.now();
  const splitDelimeter1 = ' ';
  const splitDelimeter2 = ', ';
  // const allCommas = /,*/g;
  const nonDigits = /\D*/g;
  const currencyChars = /(\$*,*)/g;
  const emptyString = '';
  const defaultResult = null; // useful for writing to firestore // 'N/A'; // useful when writing to GAS

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
  
  // ref: https://github.com/GoogleChrome/puppeteer
  // cheatsheet: https://nitayneeman.com/posts/getting-to-know-puppeteer-using-practical-examples/
  // forms: https://stackoverflow.com/questions/45778181/puppeteer-how-to-submit-a-form
  const browser = await puppeteer.launch({ 
    // headless: false, // uncomment when form testing for visual context and fedback
  });
  const page = await browser.newPage();
  // await page.goto('https://example.com');
  await page.goto(url, {
    // waitUntil: 'load',
  });
  // docs: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md
  // await page.screenshot({path: 'example.png'});

  // const items = await page.evaluate( (listGroup, listAddress,) => {
  const items = await page.evaluate( () => {
    // return Array.from( document.querySelectorAll( listGroup ))
    // return Array.from( $$( listGroup ))
    return Array.from( document.querySelectorAll( 'div[data-elm-id="asset_list_content"] > *' ))
    // return Array.from( $$( 'div[data-elm-id="asset_list_content"] > *' ))
      .map( item => ({
        // address: document.querySelector( listAddress ).innerText.trim(),
        // address: $( listAddress ).innerText.trim(),
        // listDetailUrl       : ( item.querySelector( 'div > a'                                                                                ) && item.querySelector( 'div > a'                                                                                ).href     .trim() ) || 'N/A' , // /details/291-turpin-st-danville-va-24541-2871813-e_13953a
        listDetailUrl       : ( item.href || 'N/A' ) ,
        listAddress         : ( item.querySelector( 'div[class^="styles__asset-container"] h4[data-elm-id$="_address_content_1"]'            ) && item.querySelector( 'div[class^="styles__asset-container"] h4[data-elm-id$="_address_content_1"]'            ).innerText.trim() ) || 'N/A' , // 170 GROVE PARK CIRCLE
        listCsz             : ( item.querySelector( 'div[class^="styles__asset-container"] label[data-elm-id$="_address_content_2"]'         ) && item.querySelector( 'div[class^="styles__asset-container"] label[data-elm-id$="_address_content_2"]'         ).innerText.trim() ) || 'N/A' , // DANVILLE, VA 24541, Danville city County
        listAuctionDateRaw  : ( item.querySelector( 'div[class^="styles__asset-container"] h4[data-elm-id$="_auction_date"]'                 ) && item.querySelector( 'div[class^="styles__asset-container"] h4[data-elm-id$="_auction_date"]'                 ).innerText.trim() ) || 'N/A' , // Nov 22, 3:00pm
        listAuctionType     : ( item.querySelector( 'div[class^="styles__asset-container"] label[data-elm-id$="_auction_type"]'              ) && item.querySelector( 'div[class^="styles__asset-container"] label[data-elm-id$="_auction_type"]'              ).innerText.trim() ) || 'N/A' , // Foreclosure Sale, In Person | Bank Owned, Online
        listBeds            : ( item.querySelector( 'div[class^="styles__asset-container"] h4[data-elm-id$="_beds"]'                         ) && item.querySelector( 'div[class^="styles__asset-container"] h4[data-elm-id$="_beds"]'                         ).innerText.trim() ) || 'N/A' , // 3
        listBaths           : ( item.querySelector( 'div[class^="styles__asset-container"] h4[data-elm-id$="_baths"]'                        ) && item.querySelector( 'div[class^="styles__asset-container"] h4[data-elm-id$="_baths"]'                        ).innerText.trim() ) || 'N/A' , // 2
        listSqft            : ( item.querySelector( 'div[class^="styles__asset-container"] h4[data-elm-id$="_sqft"]'                         ) && item.querySelector( 'div[class^="styles__asset-container"] h4[data-elm-id$="_sqft"]'                         ).innerText.trim() ) || 'N/A' , // 1,410
        listArv             : ( item.querySelector( 'div[class^="styles__asset-container"] h4[data-elm-id="label_after_repair_value_value"]' ) && item.querySelector( 'div[class^="styles__asset-container"] h4[data-elm-id="label_after_repair_value_value"]' ).innerText.trim() ) || 'N/A' , // $149,000
        listReserve         : ( item.querySelector( 'div[class^="styles__asset-container"] h4[data-elm-id="label_reserve_value"]'            ) && item.querySelector( 'div[class^="styles__asset-container"] h4[data-elm-id="label_reserve_value"]'            ).innerText.trim() ) || 'N/A' , // $25,000
        listOpeningBid      : ( item.querySelector( 'div[class^="styles__asset-container"] h4[data-elm-id="label_starting_bid_value"]'       ) && item.querySelector( 'div[class^="styles__asset-container"] h4[data-elm-id="label_starting_bid_value"]'       ).innerText.trim() ) || 'N/A' , // $25,000
        listNoBuyersPremium : ( item.querySelector( 'div[class^="styles__asset-container"] label[data-elm-id$="_No Buyer\'s Premium_label"]' ) && item.querySelector( 'div[class^="styles__asset-container"] label[data-elm-id$="_No Buyer\'s Premium_label"]' ).innerText.trim() ) || 'N/A' , // No Buyer's Premium
        listVacant          : ( item.querySelector( 'div[class^="styles__asset-container"] label[data-elm-id$="_Vacant_label"]'              ) && item.querySelector( 'div[class^="styles__asset-container"] label[data-elm-id$="_Vacant_label"]'              ).innerText.trim() ) || 'N/A' , // Vacant
      }))
    // }, [ LIST_GROUP, LIST_ADDRESS, ] );
    }, [],
  );

  // console.log( 'items\n'       , items        , );
  // console.log( 'items count: ' , items.length , );

  await browser.close();

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
    const delimeter1 = ' ';
    let listAuctionDateMonthText = listAuctionDateTimestamp = listAuctionDateMonthNumber =
      listAuctionDateYear = listAuctionDateDay = listAuctionDateTime = defaultResult;
    listAuctionDateYear = todaysYear;
    const defaultDate = {
      listAuctionDateMonthText, listAuctionDateMonthNumber,
      listAuctionDateDay, listAuctionDateTime,
      listAuctionDateYear, listAuctionDateTimestamp,
    }
    const split = s.split(delimeter1);
    
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
        listAuctionDateDay = str2num(split[3]) || defaultResult;
        listAuctionDateTime = 0;
        break;
      default:
        // listAuctionDateDay = listAuctionDateTime = defaultResult;
    }
    
    // handle month and year
    listAuctionDateMonthText = split[0];
    const listAuctionDateMonthNumberRaw = monthsArray.indexOf(listAuctionDateMonthText) || defaultResult;
    listAuctionDateMonthNumber = listAuctionDateMonthNumberRaw && (listAuctionDateMonthNumberRaw + 1);
    // increment year if currently december and auction month is january
    if((todaysMonth === 11) && (listAuctionDateMonthNumber === 0)) {
      listAuctionDateYear = listAuctionDateYear + 1; // edge case: last week of the year
    }
    
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

  // compute and format items
  const formattedItems = items.map( item => {
    // const listDetailUrl = `https://www.auction.com${item.listDetailUrl}`;
    // const listCsz = titleCase(item.listCsz); // reformats state undesirably
    const listAddress = (titleCase(item.listAddress)) || defaultResult;
    const listCszSplit = (item.listCsz && item.listCsz.split(splitDelimeter2)) || defaultResult;
    const listCity = (listCszSplit && titleCase(listCszSplit[0])) || defaultResult;
    const listCounty = (listCszSplit && titleCase(listCszSplit[2])) || defaultResult;
    const listStateZip = (listCszSplit && listCszSplit[1]) || defaultResult;
    const listStateZipSplit = (listStateZip && listStateZip.split(splitDelimeter1)) || defaultResult;
    const listState = (listStateZipSplit && listStateZipSplit[0]) || defaultResult;
    const listZip = (listStateZipSplit && listStateZipSplit[1]) || defaultResult;
    // const listAuctionDateSplit = (item.listAuctionDateRaw && item.listAuctionDateRaw.split(splitDelimeter1)) || defaultResult;
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
    const listAuctionTypeSplit = (item.listAuctionType && item.listAuctionType.split(splitDelimeter2)) || defaultResult;
    const listForeclosureOrBankOwned = (listAuctionTypeSplit && listAuctionTypeSplit[0]) || defaultResult;
    const listInPersonOrOnline = (listAuctionTypeSplit && listAuctionTypeSplit[1]) || defaultResult;
    const listArv = (item.listArv && str2num(item.listArv)) || defaultResult;
    const listReserve = (item.listReserve && str2num(item.listReserve)) || defaultResult;
    const listOpeningBid = (item.listOpeningBid && str2num(item.listOpeningBid)) || defaultResult;
    const listBeds  = (item.listBeds  && Number(item.listBeds))  || defaultResult;
    const listBaths = (item.listBaths && Number(item.listBaths)) || defaultResult;
    const listSqft  = (item.listSqft  && str2num(item.listSqft)) || defaultResult;
    const out = {
      // meta data
      timestamp, source, market, listUrl: url,
      // basic facts
      ...item, listTimestamp: timestamp, listBeds, listBaths, listSqft,
      listAddress, listCity, listState, listZip, listCounty, // listCsz, listDetailUrl, 
      listForeclosureOrBankOwned, listInPersonOrOnline, listArv, listReserve, listOpeningBid,
      // time
      listAuctionDateYear, listAuctionDateMonthText, listAuctionDateMonthNumber,
      listAuctionDateDay, listAuctionDateTime, listAuctionDateHours, listAuctionDateMinutes,
      listAuctionDateDate, listAuctionDateTimestamp,
    };
    return out;
  })

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

})();

// node scrape.js
// curl -L --data-binary @data/scrape.csv https://script.google.com/macros/s/AKfycbyRT8_eiROa8oCVEQV0nX2bQpxcA4b9Eq2zGpp2LNW0p4ue37_G/exec