const _ = require('lodash');
const words = require('../lib/words');

const depth = 1000;

const unity = 1;
const joiner = '';
const newline = '\n';

const { components, } = words;
const componentsLength = components.length;

let i = depth; while(i--) {
  const out = [];
  let j = componentsLength;
  while(j--) {
    const component = components[j];
    const componentLength = component.length;
    const k = _.random(0, componentLength - unity);
    // console.log('j:', j,);
    // console.log('k:', k,);
    const targetString = component[k];
    // console.log(j, k, targetString,);
    out[j] = targetString;
  }
  console.log( out.join(joiner), newline, );
}