// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-west-1'});

exports.send = async function(addressList, subject, body){
  // Create sendEmail params 
  var params = {
    Destination: { /* required */
      CcAddresses: [
      ],
      ToAddresses: addressList
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
        Charset: "UTF-8",
        Data: body
        },
        Text: {
        Charset: "UTF-8",
        Data: "TEXT_FORMAT_BODY"
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
      },
    Source: 'miles@milescwatson.com', /* required */
    ReplyToAddresses: [
      'miles@milescwatson.com',
      /* more items */
    ],
  };
  // Create the promise and SES service object
  var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
  // Handle promise's fulfilled/rejected states
  sendPromise.then(
    function(data) {
      console.log(data.MessageId);
      return data.MessageId
    }).catch(
      function(err) {
      console.error(err, err.stack);
      return
    });
}