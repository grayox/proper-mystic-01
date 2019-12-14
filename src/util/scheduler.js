// Heroku Scheduler can only be set to run at the following intervals
// Every 10 minutes, Every hour at..., Every day at...
// This utility provides finer grained controls for running weekly on a specific day, etc.

const daysOfWeek = [ 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', ];
const date = new Date();
const today = date.getUTCDay();
// today
const dayOfWeek = daysOfWeek[today];
// dayOfWeek

// const isDayOfWeek = arrayOfTargets =>
module.exports = arrayOfTargets =>
  arrayOfTargets.some(target => dayOfWeek.includes(target.toLowerCase()))

// console.log(isDayOfWeek([ 'monday'  , ])) //
// console.log(isDayOfWeek([ 'saturday', ])) //
// console.log(isDayOfWeek([ 'sat'     , ])) //