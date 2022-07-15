require('dotenv').config({ path: 'variables.env' });

const express = require('express');
const webPush = require('web-push');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'client')));

// VAPID keys should be generated only once. => replace in  variables.env
const vapidKeys = webPush.generateVAPIDKeys();

console.log(vapidKeys);

const publicVapidKey = "BAJQxEDFDWhOHnjtXw2AqcYXJlS0oGYpfJvwsOxCTYq8gM1_vvkyyL4kl4rIdytt5zhvVPZHyGeP-CeD8Szc69Y";
const privateVapidKey = "bBGAR9h95vBmWvLKSjJDw6PJbK64ve77m6LfGMzacuI";

webPush.setVapidDetails('mailto:test@example.com', publicVapidKey, privateVapidKey);

// Subscribe route

app.post('/subscribe', (req, res) => {
  const subscription = req.body

  res.status(201).json({});

  // create payload
  const payload = JSON.stringify({
    title: 'Push notifications From Server',
  });
console.log(subscription);
  webPush.sendNotification(subscription, payload)
    .catch(error => console.error(error));
});

// app.set('port', 8080);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
