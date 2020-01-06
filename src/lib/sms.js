const config = //require('./sms.json');
{
  "source": "https://20somethingfinance.com/how-to-send-text-messages-sms-via-email-for-free/",
  "comment1": "txt.att.net means actual number is number@txt.att.net",
  "comment2": "market share source: https://www.statista.com/statistics/199359/market-share-of-wireless-carriers-in-the-us-by-subscriptions/",
  "comment3": "market share: 2019Q3: att: 39.9%, ver: 29.2, tmo: 16.4, spr: 13.3, us: 1.2",
  "carriers": {
    "att": {
      "sms": "txt.att.net",
      "mms": "mms.att.net"
    },
    "verizon": {
      "sms": "vtext.com",
      "mms": "vzwpix.com"
    },
    "tmobile": {
      "sms": "tmomail.net",
      "mms": "tmomail.net"
    },
    "sprint": {
      "sms": "messaging.sprintpcs.com",
      "mms": "pm.sprint.com"
    },
    "usCellular": {
      "sms": "email.uscc.net",
      "mms": "mms.uscc.net"
    },
    "boostMobile": {
      "sms": "sms.myboostmobile.com",
      "mms": "myboostmobile.com"
    },
    "consumerCellular": {
      "sms": "mailmymobile.net",
      "mms": "mailmymobile.net"
    },
    "cricket": {
      "sms": "sms.cricketwireless.net",
      "mms": "mms.cricketwireless.net"
    },
    "cSpire": {
      "sms": "cspire1.com",
      "mms": "cspire1.com"
    },
    "googleFi": {
      "sms": "msg.fi.google.com",
      "mms": "msg.fi.google.com"
    },
    "metroPcs": {
      "sms": "mymetropcs.com",
      "mms": "mymetropcs.com"
    },
    "pagePlus": {
      "sms": "vtext.com",
      "mms": "vtext.com"
    },
    "republicWireless": {
      "sms": "text.republicwireless.com"
    },
    "ting": {
      "sms": "message.ting.com",
      "mms": "message.ting.com"
    },
    "tracfone": {
      "mms": "mmst5.tracfone.com"
    },
    "virginMobile": {
      "sms": "vmobl.com",
      "mms": "vmpix.com"
    },
    "xfinityMobile": {
      "sms": "vtext.com",
      "mms": "mypixmessages.com"
    }
  }
};

function getEmailList( textNumber ) {
  var empty = '';
  var joiner = '@';
  var digits = /\d/g;
  var num = textNumber.match(digits).join(empty); // num
  var out = [];
  var carriers = config.carriers;
  var keys = Object.keys(carriers).reverse(); // keys
  var length = keys.length;
  var i = length; while(i--) {
    var key = keys[i];
    var email = [ num, carriers[key].sms ].join(joiner);
    out.push( email );
  }
  return out;
}
// const emails = getEmailList('555-555-9999'); // emails