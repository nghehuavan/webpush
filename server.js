const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const CyclicDb = require('cyclic-dynamodb');
const db = CyclicDb('long-lime-crow-yokeCyclicDB');
const collectionName = 'users-subscription';
const collections = db.collection(collectionName);

const webPush = require('web-push');
const publicVapidKey = 'BAJQxEDFDWhOHnjtXw2AqcYXJlS0oGYpfJvwsOxCTYq8gM1_vvkyyL4kl4rIdytt5zhvVPZHyGeP-CeD8Szc69Y';
const privateVapidKey = 'bBGAR9h95vBmWvLKSjJDw6PJbK64ve77m6LfGMzacuI';
webPush.setVapidDetails('mailto:test@example.com', publicVapidKey, privateVapidKey);
// VAPID keys should be generated only once. => replace in  variables.env
// const vapidKeys = webPush.generateVAPIDKeys();
// console.log(vapidKeys);

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client')));

// Subscribe route => save to dynamoDB
app.post('/subscribe', async (req, res) => {
  const subscription = req.body;
  console.log('[new] subscription:', subscription);

  const collectionKey = 'someUserId'; // should change on every user request
  await collections.set(collectionKey, { payload: subscription });
  res.status(201).json({});
});

app.post('/push', async (req, res) => {
  const message = req.body;
  const collectionKey = 'someUserId'; // should change on every user request
  const collectionValue = await collections.get(collectionKey);
  const subscription = collectionValue.props.payload;
  console.log('[push] subscription:', subscription);
  console.log('message:', message);

  webPush.sendNotification(subscription, JSON.stringify(message)).catch((error) => console.error(error));
  res.status(201).json({});
});

app.set('port', 8080);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → ${server.address().port} [http://localhost:${server.address().port}]`);
});
