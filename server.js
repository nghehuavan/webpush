const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const { Sequelize, QueryTypes } = require('sequelize');

const webPush = require('web-push');
const publicVapidKey = 'BAJQxEDFDWhOHnjtXw2AqcYXJlS0oGYpfJvwsOxCTYq8gM1_vvkyyL4kl4rIdytt5zhvVPZHyGeP-CeD8Szc69Y';
const privateVapidKey = 'bBGAR9h95vBmWvLKSjJDw6PJbK64ve77m6LfGMzacuI';
webPush.setVapidDetails('mailto:test@example.com', publicVapidKey, privateVapidKey);
// VAPID keys should be generated only once. => replace in  variables.env
// const vapidKeys = webPush.generateVAPIDKeys();
// console.log(vapidKeys);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client')));

async function startup() {
  const db = await connectDb();

  // Subscribe route => save to dynamoDB
  app.post('/subscribe', async (req, res) => {
    const subscription = req.body;
    console.log('[new] subscription:', subscription);

    // save to db: map user <=> subscription json
    const key = 'someUserId'; // should change on every user by token
    await db.query('INSERT INTO subscriptions(key,data) VALUES($key,$data) ON CONFLICT(key) DO UPDATE SET data = $data', {
      bind: { key: key, data: JSON.stringify(subscription) },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({});
  });

  app.post('/push', async (req, res) => {
    const message = req.body;

    const key = 'someUserId'; // should change on every user by token
    const rows = await db.query('SELECT * FROM subscriptions WHERE key = $$key', {
      bind: { key: key },
      type: QueryTypes.SELECT,
    });

    if (rows.length > 0) {
      const subscription = JSON.parse(rows[0].data);
      console.log('[push] subscription:', subscription);
      console.log('message:', message);
      webPush.sendNotification(subscription, JSON.stringify(message)).catch((error) => console.error(error));
    }

    res.status(201).json({});
  });

  app.get('/db', async (req, res) => {
    const rows = await db.query('SELECT * FROM subscriptions', {
      type: QueryTypes.SELECT,
    });

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(rows, null, 4));
  });

  app.set('port', 8080);
  const server = app.listen(app.get('port'), () => {
    console.log(`Express running → ${server.address().port} [http://localhost:${server.address().port}]`);
  });
}

// connect database Sqlite by sequelize ORM
connectDb = async () => {
  const db = new Sequelize({
    dialect: 'sqlite',
    storage: './webpush.db',
    logging: false,
  });
  try {
    await db.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }

  return db;
};

startup()
  .catch(console.error)
  .then(() => console.log('Server startup success !'));
