[Load to Heroku](https://dashboard.heroku.com/apps/nuns-playing-monopoly/deploy/heroku-git)

[HEROKU]
*weekly - sun*
1. Get source auction data
   a. Run `Puppeteer/src/auction.js` (`node auction`)
   b. Posts data to:
      i) `if(isWrite2gas)` -> `Auction.com API` -> renders here ->
      `https://docs.google.com/spreadsheets/d/1xRuSpW8v3zki6jyC0M9NJMAbua5UYjJgevUO5FI0ezI/edit#gid=471486619`
      ii) `if(isWrite2db)` -> Firestore

[GAS]
*weekly +hourly - sun*
2. Order field reports
   a. Run `GAS/FetchInventory.js`
   b. Look for auctions starting within one week.
   c. Order *Field Reports* from field agents.
   d. Upon receipt of *Field Reports*, do nothing.
   e. They will sit in queue and have chron jobs process them via GAS timed triggers.

[GAS]
*weekly +hourly - mon*
3. Create Q-Reports
   a. Run `GAS/CreateQ.js` to create Q-Reports.
   b. `CreateQ` calls `Shopify`, `Slides` and `Youtube`.

[HEROKU]
*daily (+0h)* 
4. Google for buyers online domains
   a. Run `Puppeteer/src/google.js` (`node google`)

[HEROKU]
*8hrs (+1h)* 
5. Fetch and store links to contact pages for each domain
   a. Run `Puppeteer/src/util/spiders/clusters/contact.js` (`node contact`)

[HEROKU]
*8hrs (+2h)* 
6. Fetch and store site form structure data for each domain
   a. Run `Puppeteer/src/util/spiders/clusters/formGet.js` (`node formGet`)

[HEROKU]
*hourly*
7. Post to buyer online forms
   a. `Puppeteer/src/form.js`  (`node formPost`)

[GAS]
8. MailBot to sell reports and solicit offers
   a. getMailWithAttachments() *30 minutes*
   b. getMailWithoutAttachments() *2 hours*
