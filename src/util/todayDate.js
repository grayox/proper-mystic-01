const monthsArray = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', ];

const timestamp = Date.now(); // timestamp
const todaysDate = new Date(timestamp); // todaysDate
// index: 1
const todaysDayOfTheMonth = todaysDate.getDate(); // todaysDayOfTheMonth
// index: 0
const todaysMonth = todaysDate.getMonth(); // todaysMonth
const todaysMonthAsString = monthsArray[ todaysMonth ]; // todaysMonthAsString
// index: 1
const todaysMonthOneIndex = todaysMonth + 1; // todaysMonthOneIndex
const todaysYear = todaysDate.getFullYear(); // todaysYear

const getFormattedDate = () => {
  const joiner = '-';
  const targetLength = 2;
  const todaysMonthOneIndexString = todaysMonthOneIndex.toString();
  const todaysMonthOneIndexStringLength = todaysMonthOneIndexString.length;
  const twoDigitMonth = ( todaysMonthOneIndexStringLength === targetLength )
    ? todaysMonthOneIndexString : `0${todaysMonthOneIndexString}`;
  const todaysDayOfTheMonthString = todaysDayOfTheMonth.toString();
  const todaysDayOfTheMonthStringLength = todaysDayOfTheMonthString.length;
  const twoDigitDay = ( todaysDayOfTheMonthStringLength === targetLength )
    ? todaysDayOfTheMonthString : `0${todaysDayOfTheMonthString}`;
  const out = [ todaysYear, twoDigitMonth, twoDigitDay, ].join(joiner);
  return out; // '2020-01-05'
}

const formattedDate = getFormattedDate(); // formattedDate

const out = {
  monthsArray, timestamp, todaysDate, todaysYear, formattedDate,
  todaysDayOfTheMonth, todaysMonth, todaysMonthAsString, todaysMonthOneIndex,
}

module.exports = out;

// // test:
// out

// // use:
// const todayDate = require('../../util/todayDate');
// const {
//   monthsArray, timestamp, todaysDate, todaysYear,
//   todaysDayOfTheMonth,  todaysMonth, todaysMonthOneIndex,
// } = todayDate;