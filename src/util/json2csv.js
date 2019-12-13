// https://nodejs.org/en/knowledge/getting-started/what-is-require/

// usage note:
// to export a function only, use module.exports
// otherwise, export an object using exports

// const arrayOfObjects2csv = require('./json2csv.js');

// const arrayOfObjects2csv = items => {
module.exports = items => {
  // ref: https://stackoverflow.com/a/31536517
  // const items = json3.items;
  const emptyString = '';
  const comma = ',';
  const returnNewLine = '\r\n';
  const replacer = (key, value) => value === null ? emptyString : value;// specify how you want to handle null values here
  const header = Object.keys(items[0]);
  let csv = items.map(row => header.map( fieldName => JSON.stringify(row[fieldName], replacer)).join(comma));
  csv.unshift(header.join(comma));
  csv = csv.join(returnNewLine);
  // console.log(csv);
  return csv;
}