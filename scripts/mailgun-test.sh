#!/Users/as3ics-dev/.nvm/versions/node/v14.19.0/bin/node

require('dotenv').config();
const mailgun = require("mailgun-js");

console.log("Running mailgun test script...");

const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_API_URL});
const data = {
	from: 'Excited User <me@samples.mailgun.org>',
	to: 'zach@as3ics.com',
	subject: 'Hello',
	text: 'Testing some Mailgun awesomness!'
};
mg.messages().send(data, function (error, body) {
	console.log(body);
});