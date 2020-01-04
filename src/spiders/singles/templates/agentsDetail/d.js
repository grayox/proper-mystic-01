const puppeteer = require('puppeteer');

// script name: detail.js

const url = 'https://www.yelp.com/biz/the-jenny-maraghy-team-richmond';
const selector = 'section div[class*="island-section"] a';
const pageFunction = r => ({
  href: r.href,
  link: r.innerText,
});

// ref: https://pptr.dev
puppeteer.launch().then(async browser => {
  const page = await browser.newPage();
  await page.goto(url);
  const item = await page.$eval( selector, pageFunction, );
  console.log('item', item,);
  await browser.close();
});