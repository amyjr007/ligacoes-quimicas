/* Service worker da aula. Guarda tudo na instalação: a aula roda inteira
   sem rede, que é como ela costuma ser dada. */
const CACHE = 'ligacoes-v21-7';
const ARQUIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icone-192.png',
  './icone-512.png',
  './imagens/NaCl.png',
  './imagens/MgO.png',
  './imagens/Na2O.jpg',
  './imagens/MgCl2.jpg',
  './imagens/Al2O3.jpg',
  './imagens/Ramsey.png',
  './imagens/john_dalton.png',
  './imagens/lewis.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(ARQUIVOS))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* cache primeiro: abre instantâneo e funciona offline; o que faltar vai
   para o cache na primeira vez que for pedido */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      if (resp && (resp.status === 200 || resp.type === 'opaque')){
        const copia = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
      }
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
