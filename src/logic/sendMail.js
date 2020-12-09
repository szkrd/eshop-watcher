const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');
const config = require('../config');
const { readFile } = require('../utils/file');

const transport = nodemailer.createTransport(
  nodemailerSendgrid({ apiKey: config.sendGridApiKey })
);

module.exports = async function sendMail () {
  if (!config.sendGridApiKey) {
    console.error('can not send mail without an api key');
    return;
  }
  const html = await readFile('~/dist/index.html');
  if (!html) {
    console.error('no html file found');
    return;
  }
  const subject = ((html.match(/<title>.*?<\/title>/g) || [])[0] || '').replace(/<\/?title>/g, '').trim();
  console.info(`mail subject: ${subject}`);
  try {
    await transport.sendMail({ // result is a huge sendgrid object
      from: config.emailFrom,
      to: config.emailTo || config.emailFrom,
      subject,
      html
    });
    console.info('message delivered');
  } catch (err) {
    console.error('message delivery failed', err);
  }
};
