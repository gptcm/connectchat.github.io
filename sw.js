// ConnectChat service worker: PWA shell cache + Firebase Cloud Messaging.
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyDgafD-CDcaiam_Efh9kJZuEBSZ0kUM9Jw",
  authDomain: "connectchat-6309c.firebaseapp.com",
  projectId: "connectchat-6309c",
  storageBucket: "connectchat-6309c.firebasestorage.app",
  messagingSenderId: "983109078249",
  appId: "1:983109078249:web:aff21aa205b8a4c8b6b478"
};
if (!Object.values(firebaseConfig).some(value => String(value).includes("YOUR_"))) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(payload => {
  const title = payload.data?.title || payload.notification?.title || "ConnectChat";
  const options = {
    body: payload.data?.body || payload.notification?.body || "You have a new message.",
    tag: `connectchat-${payload.data?.messageId || Date.now()}`,
    data: { url: payload.data?.url || "./" }
  };
    return self.registration.showNotification(title, options);
  });
}

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "./", self.location.origin).href;
  event.waitUntil((async () => {
    const clientsList = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of clientsList) {
      if ("focus" in client) { await client.focus(); if ("navigate" in client) await client.navigate(target); return; }
    }
    if (clients.openWindow) await clients.openWindow(target);
  })());
});

const CACHE = "connectchat-shell-v2";
const FILES = ["./", "./index.html", "./styles.css", "./manifest.webmanifest"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES))));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
