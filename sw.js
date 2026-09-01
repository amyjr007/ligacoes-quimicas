/* Service worker da aula. Guarda tudo na instalação: a aula roda inteira
   sem rede, que é como ela costuma ser dada. */
const CACHE = 'ligacoes-v23-5';
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
  './imagens/lewis.jpg',
  './imagens/clivagem.png',
  './videos/solubilidade_8ca9.mp4'
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

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  /* A PÁGINA vem da rede quando há rede. Antes ela vinha do cache, e uma
     versão nova só aparecia no segundo recarregamento — nem o Ctrl+Shift+R
     resolvia, porque quem respondia era o cache, não o servidor.
     Sem rede, o cache assume e a aula abre igual. */
  if (e.request.mode === 'navigate'){
    e.respondWith(
      fetch(e.request).then(resp => {
        const copia = resp.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copia));
        return resp;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  /* o resto (imagens, ícones, fontes) sai do cache, que é o que faz a
     abertura ser instantânea */
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
