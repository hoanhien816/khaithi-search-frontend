const CACHE_NAME = 'khaithi-search-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/logo.png', // Đảm bảo file logo.png tồn tại
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&display=swap',
    'https://fonts.gstatic.com/s/notoserif/v21/ga6iaw1B5ht6emJ5l3_Xh_2Egsg3.woff2', // Ví dụ font Noto Serif WOFF2
    // Thêm các tài nguyên khác mà bạn muốn cache ở đây
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Trả về từ cache nếu có
                if (response) {
                    return response;
                }
                // Nếu không có trong cache, fetch từ mạng
                return fetch(event.request).then(
                    (response) => {
                        // Kiểm tra nếu chúng ta nhận được phản hồi hợp lệ
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // QUAN TRỌNG: Nhân bản phản hồi vì nó là một Stream và chỉ có thể được đọc một lần.
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
