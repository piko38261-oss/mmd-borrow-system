// sw.js
const CACHE_NAME = 'mmd-borrow-cache-v1';

self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activated');
    return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // โค้ดพื้นฐาน ยอมให้โหลดข้อมูลผ่านเน็ตตามปกติ
    event.respondWith(
        fetch(event.request).catch(() => {
            console.log('You are offline.');
        })
    );
});