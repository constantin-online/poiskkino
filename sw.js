const CACHE_NAME = 'kino-search-v2'; // Версия кэша (можно менять при обновлениях)

// Файлы, которые мы сохраняем для работы офлайн
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './offline.html',
    './manifest.json',
    './favicons/icon-192.png',
    './favicons/icon-512.png'
    // Если у вас есть style.css или app.js отдельными файлами, добавьте их сюда
];

// 1. Установка Service Worker и кэширование файлов
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    // Активируем новый SW сразу
    self.skipWaiting();
});

// 2. Очистка старого кэша при обновлении
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. Перехват запросов и показ заглушки при отсутствии интернета
self.addEventListener('fetch', (event) => {
    // Игнорируем запросы не с нашего домена или нестандартные запросы
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Если файл есть в кэше, отдаем его
            if (cachedResponse) {
                return cachedResponse;
            }

            // Если нет в кэше, пробуем загрузить из сети
            return fetch(event.request).catch(() => {
                // Если сеть недоступна И это запрос на получение HTML-страницы (навигация)
                if (event.request.mode === 'navigate') {
                    // Показываем нашу заглушку
                    return caches.match('./offline.html');
                }
                
                // Для остальных ресурсов (картинок, API) возвращаем ошибку
                return new Response('Нет интернета', { status: 503, statusText: 'Service Unavailable' });
            });
        })
    );
});