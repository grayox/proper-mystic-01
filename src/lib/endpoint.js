// GAS script

// final version inspired here
// https://stackoverflow.com/a/58848538
// https://stackoverflow.com/a/58849817

// inspired by
// https://mashe.hawksey.info/2014/07/google-sheets-as-a-database-insert-with-apps-script-using-postget-methods-with-ajax-example/
// https://script.google.com/macros/s/AKfycbzV--xTooSkBLufMs4AnrCTdwZxVNtycTE4JNtaCze2UijXAg8/exec // API
// https://docs.google.com/spreadsheets/d/10tt64TiALYhPMqR2fh9JzkuhxW7oC0rXXPb_pmJ7HAY/edit#gid=0  // sheet

// request = $.ajax({
  // url: "https://script.google.com/macros/s/AKfycbyRT8_eiROa8oCVEQV0nX2bQpxcA4b9Eq2zGpp2LNW0p4ue37_G/exec",
  // type: "post",
  // data: serializedData
// });

function setup() {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  SCRIPT_PROP.setProperty("key", doc.getId());
}

//  0. Must run setup() or each new sheet to initiate "key" as a script property

//  1. Enter sheet name where data is to be written below
var SHEET_NAME = "Sheet1";
       
//  2. Run > setup
//
//  3. Publish > Deploy as web app 
//    - enter Project Version name and click 'Save New Version' 
//    - set security level and enable service (most likely execute as 'me' and access 'anyone, even anonymously) 
//
//  4. Copy the 'Current web app URL' and post this in your form/script action 
//
//  5. Insert column names on your destination sheet matching the parameter names of the data you are passing in (exactly matching case)

var SCRIPT_PROP = PropertiesService.getScriptProperties(); // new property service

// If you don't want to expose either GET or POST methods you can comment out the appropriate function
function doGet(e){
return handleResponse(e);
}

function doPost1(e){
return handleResponse(e);
}

function doPost(e) {
// references
// curl example
// https://stackoverflow.com/a/58848538
// node.js => request.()
// https://stackoverflow.com/a/58849817
var csv = Utilities.parseCsv(e.postData.contents);

var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
// sheet.appendRow([JSON.stringify(e)]);
sheet.getRange(sheet.getLastRow() + 1, 1, csv.length, csv[0].length).setValues(csv);

return ContentService.createTextOutput("ok");
}

// // test
// function handleResponse(e) {
//   Logger.log(e);
//   // return "Hello world" //e; //e.parameter;
//   // var textOutput = ContentService.createTextOutput("Hello World! Welcome to the web app.")
//   // return textOutput

   // var params = JSON.stringify(e);
   // return HtmlService.createHtmlOutput(params);

//   //var out = ContentService
//     //.createTextOutput(e.parameter.text) // (JSON.stringify({"result":"success", "row": nextRow}))
//     //.setMimeType(ContentService.MimeType.TEXT); //.JSON);
//   //return out;
// }

// // single row
// function handleResponse(e) {
//   // shortly after my original solution Google announced the LockService[1]
//   // this prevents concurrent access overwritting data
//   // [1] http://googleappsdeveloper.blogspot.co.uk/2011/10/concurrency-and-google-apps-script.html
//   // we want a public lock, one that locks for all invocations
//   var lock = LockService.getPublicLock();
//   lock.waitLock(30000);  // wait 30 seconds before conceding defeat.
 
//   // // If you are passing JSON in the body of the request uncomment this block
//   // var jsonString = e.postData.getDataAsString();
//   // e.parameter = JSON.parse(jsonString);

//   try {
//     // next set where we write the data - you could write to multiple/alternate destinations
//     var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
//     var sheet = doc.getSheetByName(SHEET_NAME);
   
//     // we'll assume header is in row 1 but you can override with header_row in GET/POST data
//     var headRow = e.parameter.header_row || 1;
//     var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
//     var nextRow = sheet.getLastRow() + 1; // get next row
//     var row = []; 
//     // loop through the header columns
//     for (i in headers){
//       if (headers[i] == "Timestamp"){ // special case if you include a 'Timestamp' column
//         row.push(new Date());
//       } else { // else use header name to get data
//         row.push(e.parameter[headers[i]]);
//       }
//     }
//     // more efficient to set values as [][] array than individually
//     sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
//     // return json success results
//     return ContentService
//           .createTextOutput(JSON.stringify({"result":"success", "row": nextRow}))
//           .setMimeType(ContentService.MimeType.JSON);
//   } catch(e){
//     // if error return this
//     return ContentService
//           .createTextOutput(JSON.stringify({"result":"error", "error": e}))
//           .setMimeType(ContentService.MimeType.JSON);
//   } finally { //release lock
//     lock.releaseLock();
//   }
// }

// multiple rows
function handleResponse(e) {

var json = JSON.stringify(e)
var textOutput = ContentService.createTextOutput(json);
return textOutput

// shortly after my original solution Google announced the LockService[1]
// this prevents concurrent access overwritting data
// [1] http://googleappsdeveloper.blogspot.co.uk/2011/10/concurrency-and-google-apps-script.html
// we want a public lock, one that locks for all invocations
var lock = LockService.getPublicLock();
lock.waitLock(30000);  // wait 30 seconds before conceding defeat.

// If you are passing JSON in the body of the request uncomment this block
var jsonString = e.postData.getDataAsString();
e.parameter = JSON.parse(jsonString);

try {
  // next set where we write the data - you could write to multiple/alternate destinations
  var doc = SpreadsheetApp.openById(SCRIPT_PROP.getProperty("key"));
  var sheet = doc.getSheetByName(SHEET_NAME);
   
  // we'll assume header is in row 1 but you can override with header_row in GET/POST data
  // var headRow = e.parameter.header_row || 1;
  // var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var nextRow = sheet.getLastRow() + 1; // get next row
  // var row = []; 
  // // loop through the header columns
  // for (i in headers){
  //   if (headers[i] == "Timestamp"){ // special case if you include a 'Timestamp' column
  //     row.push(new Date());
  //   } else { // else use header name to get data
  //     row.push(e.parameter[headers[i]]);
  //   }
  // }

  var postData = e.postData.contents;
  Logger.log('e\n%s', JSON.stringify(e));

  // more efficient to set values as [][] array than individually
  // sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
  sheet.getRange(nextRow, 1, postData.length, postData[0].length).setValues([row]);

  // return json success results
  return ContentService
        .createTextOutput(JSON.stringify({"result":"success", "row": nextRow}))
        .setMimeType(ContentService.MimeType.JSON);
} catch(e){
  // if error return this
  return ContentService
        .createTextOutput(JSON.stringify({"result":"error", "error": e}))
        .setMimeType(ContentService.MimeType.JSON);
} finally { //release lock
  lock.releaseLock();
}
}