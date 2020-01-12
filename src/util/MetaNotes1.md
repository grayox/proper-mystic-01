[Load to Heroku](https://dashboard.heroku.com/apps/nuns-playing-monopoly/deploy/heroku-git)
  <!-- terminal -->
  puppeteer %
  <!-- create app -->
  heroku create nuns-playing-monopoly
    heroku create nuns-playing-monopoly --buildpack heroku/nodejs
  heroku buildpacks:set heroku/nodejs
    heroku buildpacks:remove heroku/nodejs
  <!-- deploy app -->
  git add .
  git commit -m "update"
  git push heroku master
  git add . && git commit -m "update" && git push heroku master
  <!-- local test run -->
  heroku run node src/spiders/clusters/auctionMacro.js
  <!-- logging (automated cloud runs) -->
  heroku logs
  <!-- troubleshooting -->
  https://devcenter.heroku.com/articles/troubleshooting-node-deploys#don-t-check-in-generated-directories
  <!-- error notes -->
  Error: "fatal: not a git repository (or any of the parent directories): .git"
  solution: cd puppeteer
  explanation: most likely in the wrong directory. has no .git file.
  ref: https://stackoverflow.com/a/20413490
  <!-- error notes -->
  Error: "Cannot find module 'foobar'"
  solution: heroku config:set NODE_MODULES_CACHE=false
    Next, you should ensure that you aren't accidentally checking your modules into git.
    Finally, you should check to ensure that your dependencies are correctly listed in package.json.
  ref: https://help.heroku.com/TO64O3OG/cannot-find-module-in-node-js-at-runtime
  <!-- tasks -->
  heroku run node src/spiders/clusters/auctionMacro.js
  heroku run node auction
  heroku run node google
  heroku run node contact
  heroku run node formGet
  heroku run node formPost
  <!-- schedule tasks -->
  <!-- https://devcenter.heroku.com/articles/scheduler -->
  heroku addons:create scheduler:standard

[HEROKU] daily
auction: [ 'saturday', ]
1. Get source auction data
   a. Run `Puppeteer/src/auction.js` (`node auction`)
   b. Posts data to:
      i) `if(isWrite2gas)` -> `Auction.com API` -> renders here ->
      `https://docs.google.com/spreadsheets/d/1xRuSpW8v3zki6jyC0M9NJMAbua5UYjJgevUO5FI0ezI/edit#gid=471486619`
      ii) `if(isWrite2db)` -> Firestore

[GAS] hourly
FetchInventory: [ 'sunday', ]
2. Order field reports
   a. Run `GAS/FetchInventory.js`
   b. Look for auctions starting within one week.
   c. Order *Field Reports* from field agents.
   d. Upon receipt of *Field Reports*, do nothing.
   e. They will sit in queue and have chron jobs process them via GAS timed triggers.

[GAS] hourly
CreateQ: [ 'monday', 'tuesday', ],
3. Create Q-Reports
   a. Run `GAS/CreateQ.js` to create Q-Reports.
   b. `CreateQ` calls `Shopify`, `Slides` and `Youtube`.

[HEROKU] daily
google: [ 'friday', 'sunday', ]
4. Google for buyers online domains
   a. Run `Puppeteer/src/google.js` (`node google`)

[HEROKU] daily
contact: [ 'sunday', 'tuesday', ]
5. Fetch and store links to contact pages for each domain
   a. Run `Puppeteer/src/util/spiders/clusters/contact.js` (`node contact`)

[HEROKU] daily
formGet: [ 'saturday', 'monday', ]
6. Fetch and store site form structure data for each domain
   a. Run `Puppeteer/src/util/spiders/clusters/formGet.js` (`node formGet`)

[HEROKU] daily
formPost: [ 'tuesday', ]
7. Post to buyer online forms
   a. `Puppeteer/src/form.js`  (`node formPost`)

[GAS]
8. MailBot to sell reports and solicit offers
   a. getMailWithAttachments() *30 minutes*
   b. getMailWithoutAttachments() *2 hours*
