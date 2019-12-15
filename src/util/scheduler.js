// Heroku Scheduler can only be set to run at the following intervals
// Every 10 minutes, Every hour at..., Every day at...
// This utility provides finer grained controls for running weekly on a specific day, etc.

const config = {
  auction  : [], // [ /* 'sunday',    'monday',    'tuesday',    'wednesday', 'thursday',    'friday', */ 'saturday',    ] ,
  google   : [], // [    'sunday', /* 'monday',    'tuesday',    'wednesday', 'thursday', */ 'friday', /* 'saturday', */ ] ,
  contact  : [], // [    'sunday', /* 'monday', */ 'tuesday', /* 'wednesday', 'thursday',    'friday',    'saturday', */ ] ,
  formGet  : [], // [ /* 'sunday', */ 'monday', /* 'tuesday',    'wednesday', 'thursday',    'friday', */ 'saturday',    ] ,
  formPost : [], // [ /* 'sunday',    'monday', */ 'tuesday', /* 'wednesday', 'thursday',    'friday',    'saturday', */ ] ,
};

const daysOfWeek = [ 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', ];
const date = new Date();
const today = date.getUTCDay();
// today
const dayOfWeek = daysOfWeek[today];
// dayOfWeek

// returns true if argument (array of days) includes the current day (today)
const includesDayOfWeek = arrayOfTargets =>
  arrayOfTargets.some(target => dayOfWeek.includes(target.toLowerCase()))
  // could have used array.contains() but that would have required an exact match on the string
  // with string.includes() we can use a partial match on the string argument
// console.log(includesDayOfWeek([ 'monday'  , ])) //
// console.log(includesDayOfWeek([ 'saturday', ])) //
// console.log(includesDayOfWeek([ 'sat'     , ])) //

module.exports = scriptName => {
// const runPerSchedule = scriptName => {
  const targets = config[scriptName];
  // targets
  const out = includesDayOfWeek(targets);
  return out;
}

// console.log(runPerSchedule('auction' )) //
// console.log(runPerSchedule('google'  )) //
// console.log(runPerSchedule('contact' )) //
// console.log(runPerSchedule('formGet' )) //
// console.log(runPerSchedule('formPost')) //
