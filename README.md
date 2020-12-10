# eshop-watcher

Watch regional Nintendo eshop for good deals.

This is a **cli tool**, that can render the best deals into an html page
(which it can send to you or serve it via a static server).

It uses the _[undocumented](https://gist.github.com/Shy07/822eff655ec8da2717f269bc21c65976)_ eshop API,
so in order to avoid bombing the API, the calls are cached on the disk for at least one day.

## usage

1. clone repository, `cd eshop-watcher`
2. `npm i`
3. `echo "module.exports = {};" > ./config.user.js`, and edit the file
4. `node .`

## configuration

Create a `config.json` to override the [default config](./src/config.js) values.

## parameters

1. `--mail`: sends the rendered html as a mail; uses [SendGrid](https://sendgrid.com/), so you will
  need an API key (or change the mail transport, I use [nodemailer](https://nodemailer.com/)).
2. `--server`: serves the static html page on a server; set port and host in the config json.
3. `--cron`: will not exit (unless something breaks): continually reruns the app after X days.

