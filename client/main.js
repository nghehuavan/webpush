function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// VAPID keys should be generated only once. => same with variables.env
const publicVapidKey = 'BAJQxEDFDWhOHnjtXw2AqcYXJlS0oGYpfJvwsOxCTYq8gM1_vvkyyL4kl4rIdytt5zhvVPZHyGeP-CeD8Szc69Y';

let subscription;
async function registServiceWorker() {
  if ('serviceWorker' in navigator) {
    const register = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('waiting for acceptance');
    subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });
    console.log('acceptance complete');
  } else {
    console.error('Service workers are not supported in this browser');
  }
}
registBroadcastChannel=()=>{
  const channelGuilId="d235a86e-bc13-4539-b4a5-077de485a2fd";
  const broadcast = new BroadcastChannel(channelGuilId);
  broadcast.onmessage = (event) => {
    console.log(event);
  };
}
registServiceWorker();
registBroadcastChannel();

const triggerPush = document.querySelector('.trigger-push');
triggerPush.addEventListener('click', () => {
  tryPost();
});

async function tryPost() {
  await fetch('/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}


