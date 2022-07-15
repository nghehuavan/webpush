function sendToBroadcastChannel(message) {
  const channelGuilId = 'd235a86e-bc13-4539-b4a5-077de485a2fd';
  new BroadcastChannel(channelGuilId).postMessage(message);
}

self.addEventListener('push', (e) => {
  const data = e.data.json();
  console.log('received message from web push server');
  console.log(data);
  e.waitUntil(processMessage(data));
});

self.addEventListener('notificationclick', (e) => {
  console.log(e);

  const data = e.notification.data;
  console.log(data);
  e.waitUntil(processMessageClick(data));
});

async function processMessage(message) {
  sendToBroadcastChannel(message);
  self.registration.showNotification(message.title, {
    body: 'notify from server forward by services worker!',
    data: message,
  });
}

async function processMessageClick(message) {
  sendToBroadcastChannel(message);
}
