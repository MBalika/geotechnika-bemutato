# Ami a felszín alatt van – geotechnika bemutató animáció

Statikus bemutató oldal a BME Építőmérnöki Kar geotechnika animációjához (17–20 éveseknek).

- `index.html` – nyitóoldal (a `_src/index.tpl.html` + `_src/guard.js` összefűzése: `python3 _src/build.py`)
- `video/geotechnika.html` – a 3D animáció egyetlen önálló HTML-fájlban (three.js, saját zene); `#autoplay` hash-sel indul
- `img/` – poszter, OG-kép, fejezetképek · `fonts/` – Barlow Condensed, Inter (latin + latin-ext) · `vendor/hyphenopoly/` – magyar elválasztás

Állapot: **1. vázlat** – hideg nyitás, címkártya, 1. fejezet (0:42). A további fejezetek a forgatókönyv szerint készülnek.

Telepítés: Vercel, build nélkül (statikus), `vercel.json` – `cleanUrls`, gyorsítótár-fejlécek.
