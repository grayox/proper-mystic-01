// Contact Info Extractor

// Email and social media and contact info scraper
// https://github.com/vdrmota/Social-Media-and-Contact-Info-Extractor
// https://apify.com/vdrmota/contact-info-scraper


// https://sdk.apify.com/docs/api/social#social.EMAIL_REGEX
// Example usage:

// const Apify = require('apify');

// const browser = await Apify.launchPuppeteer();
// const page = await browser.newPage();
// await page.goto('http://www.example.com');
// const html = await page.content();

// const result = Apify.utils.social.parseHandlesFromHtml(html);
// console.log('Social handles:');
// console.dir(result);