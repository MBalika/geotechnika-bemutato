# Ami a felszín alatt van – geotechnika bemutató animáció

Statikus bemutató oldal a BME Építőmérnöki Kar geotechnika animációjához (17–20 éveseknek).

- `index.html` – nyitóoldal (a `_src/index.tpl.html` + `_src/guard.js` összefűzése: `python3 _src/build.py`)
- `video/geotechnika.html` – a 3D animáció egyetlen önálló HTML-fájlban (three.js, saját zene); `#autoplay` hash-sel indul
- `img/` – poszter, OG-kép, fejezetképek · `fonts/` – Barlow Condensed, Inter (latin + latin-ext) · `vendor/hyphenopoly/` – magyar elválasztás

Állapot: **teljes változat (3:12)** – nyolc fejezet. Zene: valódi hangszerek mintáiból (Salamander Grand Piano – Alexander Holm; tonejs-instruments – VSCO2, Karoryfer, Iowa, Freesound; CC BY 3.0).

Telepítés: Vercel, build nélkül (statikus), `vercel.json` – `cleanUrls`, gyorsítótár-fejlécek.
