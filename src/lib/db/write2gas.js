const request = require('request');

// below API renders here: https://docs.google.com/spreadsheets/d/1xRuSpW8v3zki6jyC0M9NJMAbua5UYjJgevUO5FI0ezI/edit#gid=471486619
const postUrl = 'https://script.google.com/macros/s/AKfycbyRT8_eiROa8oCVEQV0nX2bQpxcA4b9Eq2zGpp2LNW0p4ue37_G/exec'; // Auction.com API
// const postUrl = 'https://eno9mu3vpqi7l.x.pipedream.net'; // requestbin.com
const POST = 'POST';

module.exports = itemsAsCsv => {
  // write results
  // to file:
  // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md
  // https://stackabuse.com/writing-to-files-in-node-js/
  // https://stackoverflow.com/a/2497040/1640892

  // // JSON.stringify(items).toDisk('./data/scrape.json')
  // // fs.writeFile('/tmp/test', 'Hey there!', e => {
  // // fs.writeFile(filePathJson, JSON.stringify(items), e => {
  // fs.writeFile(filePathJson, JSON.stringify(formattedItems), e => {
  //   if(e) {
  //     return console.log(e);
  //   }
  //   console.log(successMsg);
  // });

  // uninstalled
  // // const itemsAsCsv = new ObjectsToCsv(items);
  // const itemsAsCsv = new ObjectsToCsv(formattedItems);
  // console.log('itemsAsCsv\n', itemsAsCsv,);
  // itemsAsCsv.toDisk(filePathCsv, { allColumns: true, });

  // // start POST
  // broken. using request() instead

  // // to server using POST:
  // // https://stackoverflow.com/a/49385769/1640892

  // // Create browser instance, and give it a first tab
  // // const browser = await puppeteer.launch();
  // const pagePost = await browser.newPage();

  // // Allows you to intercept a request; must appear before
  // // your first page.goto()
  // await pagePost.setRequestInterception(true);

  // // Request intercept handler... will be triggered with 
  // // each page.goto() statement
  // pagePost.on('request', interceptedRequest => {

  //     // Here, is where you change the request method and 
  //     // add your post data
  //     var data = {
  //         method: POST,
  //         // contentType: 'csv',
  //         // postData: 'paramFoo=valueBar&paramThis=valueThat',
  //         postData: 'listAddress=valueBar&listAuctionType=valueThat',
  //         // postData: itemsAsCsv,
  //         // postData: items,
  //     };

  //     // Request modified... finish sending! 
  //     interceptedRequest.continue(data);
  // });

  // // Navigate, trigger the intercept, and resolve the response
  // // const response = await pagePost.goto('https://www.example.com/search'); 
  // try {
  //   const response = await pagePost.goto(postUrl); //, { waitUntil: 'load', timeout: 0, });     
  //   const responseBody = await response.text();
  //   console.log(responseBody);
  // } catch(e) {
  //   console.log(e)   
  // }

  // // // Close the browser - done! 
  // // await browser.close();

  // // end POST

  // start POST request()
  // refs:
  // https://www.npmjs.com/package/request#forms
  // https://github.com/request/request#forms

  // request('http://www.google.com', function (error, response, body) {
  // request( postUrl , ( error, response, body, ) => {
  //   console.log('error:', error); // Print the error if one occurred
  //   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  //   console.log('body:', body); // Print the HTML for the Google homepage.
  // });

  // // single form
  // // request.post({url:'http://service.com/upload', form: {key:'value'}}, function(err,httpResponse,body){ /* ... */ })
  // // request.post({ url : postUrl, form : items[0], }, ( e, httpResponse, body, ) => {
  // request.post({ url : postUrl, form : formattedItems[7], }, ( e, httpResponse, body, ) => {
  //   console.log('error\n', e,);
  //   // console.log('httpResponse\n', httpResponse,);
  //   // console.log('body\n', body,);
  // });

  // // multiple forms
  // const data = formattedItems.map( item => ({
  //   'content-type': applicationJson,
  //   body: JSON.stringify(item),
  // }))

  // request({
  //   // method: 'PUT',
  //   method: POST,
  //   preambleCRLF: true,
  //   postambleCRLF: true,
  //   // uri: 'http://service.com/upload',
  //   uri: postUrl,
  //   // multipart: [
  //   //   {
  //   //     'content-type': 'application/json',
  //   //     body: JSON.stringify({foo: 'bar', _attachments: {'message.txt': {follows: true, length: 18, 'content_type': 'text/plain' }}})
  //   //   },
  //   //   { body: 'I am an attachment' },
  //   //   { body: fs.createReadStream('image.png') }
  //   // ],
  //   // alternatively pass an object containing additional options
  //   multipart: {
  //     chunked: false,
  //     data,
  //     // chunked: true,
  //     // data: itemsAsCsv,
  //     // data: [
  //     //   {
  //     //     'content-type': 'application/json',
  //     //     body: JSON.stringify({foo: 'bar', _attachments: {'message.txt': {follows: true, length: 18, 'content_type': 'text/plain' }}})
  //     //   },
  //     //   { body: 'I am an attachment' }
  //     // ]
  //   },
  // },
  request(
    {
      // ref: https://stackoverflow.com/a/58849817
      uri: postUrl, // "https://script.google.com/macros/s/###/exec", // Please set this.
      method: POST, // "POST",
      // body: fs.createReadStream(filePathCsv), //("./sample.csv"), // Please set this.
      body: itemsAsCsv,
      followAllRedirects: true,
    }, ( error, response, body, ) => {
      if (error) {
        return console.error( 'Upload failed:', error, );
      }
      console.log( 'Upload successful!  Server responded with:', body, );
    }
  )
  // end POST request()
}