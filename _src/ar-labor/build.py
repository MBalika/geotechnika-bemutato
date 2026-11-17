#!/usr/bin/env python3
# ar-labor/index.html (magyar) – a sablon (page.tpl.html) + a szövegek és a modellek adatai + a formázás-őr (../guard.js)
# Futtatás: python3 _src/ar-labor/build.py
import json, pathlib
here = pathlib.Path(__file__).resolve().parent
root = here.parent.parent
tpl = (here / 'page.tpl.html').read_text(encoding='utf-8')
guard = (here.parent / 'guard.js').read_text(encoding='utf-8')

SPEC_C = {'tart': '#ff8a3d', 'geo': '#b8e04a', 'eti': '#b48cff', 'kozl': '#ffd23f', 'viz': '#4f8dff', 'geoinf': '#3fd0e8', 'foldr': '#5ccf7a'}

HU = {
  'lang': 'hu',
  'S': {
    'title': 'AR Labor – Mit építenél? | BME Építőmérnöki Kar',
    'desc': 'Forgasd, nagyítsd, és nézd meg a telefonodon AR-ben: hidak, tornyok, alagutak, zsilipek – mozgó 3D-modellek a BME Építőmérnöki Kar minden specializációjáról.',
    'brand': 'AR Labor', 'brand2': 'Mit építenél?',
    'nav_models': 'Modellek', 'nav_specs': 'Specializációk', 'nav_back': 'Geotechnika bemutató', 'nav_aula': 'Aula mód',
    'prev': 'Előző modell', 'next': 'Következő modell', 'hint': 'Forgasd · nagyíts · próbáld ki a gombot',
    'ar': 'Nézd meg a szobádban', 'pause': 'Szünet', 'labels': 'Feliratok', 'rotate': 'Körbeforgatás', 'fullscreen': 'Teljes képernyő',
    'abrand': '<b>BME Építőmérnöki Kar</b> · AR Labor', 'aqr_t': 'Próbáld ki AR-ben!', 'aqr_s': 'Olvasd be, és tedd le a modellt az asztalra.',
    'aula_exit': 'Kilépés az aula módból',
    'models_h': 'Válassz <em>modellt!</em>',
    'qr_t': 'Vidd magaddal', 'qr_s': 'Olvasd be a telefonoddal, és nézd meg a modellt AR-ben a saját asztalodon.',
    'specs_h': 'Melyik <em>a tiéd?</em>',
    'foot': 'BME Építőmérnöki Kar · AR Labor. A modellek oktatási célú, egyszerűsített makettek.',
    'foot_link': 'Vissza a geotechnika-bemutatóhoz',
    'langsw': '',
  },
  'T': {
    'all': 'Mind', 'soon': 'Hamarosan', 'learn': 'Ezt tanulod', 'play': 'Lejátszás', 'pause': 'Szünet',
    'manual': 'Te irányítasz · {s} mp múlva továbblépek', 'fsHint': 'F: teljes képernyő · ←/→: léptetés',
  },
  'BSC': {
    'ep': {'n': 'Építőmérnök BSc', 'd': '8 félév · 5 specializáció'},
    'fm': {'n': 'Földmérő és földrendező mérnök BSc', 'd': '7 félév · 2027 szeptemberétől'},
  },
  'SPECS': {
    'tart': {'n': 'Tartószerkezetek', 'short': 'Tartószerkezetek', 'b': 'ep', 'd': 'Hidak, tornyok, csarnokok: hogy elbírják a terhet, a szelet és a földrengést – és közben még szépek is legyenek.'},
    'geo': {'n': 'Geotechnika', 'short': 'Geotechnika', 'b': 'ep', 'd': 'Ami a felszín alatt van: alapozás, munkagödrök, alagutak, földművek. Minden épület a talajon áll – valakinek ki kell találnia, hogyan.'},
    'eti': {'n': 'Építéstechnológia és építmény\u00adinformációs menedzsment', 'short': 'Építéstechnológia', 'b': 'ep', 'd': 'Hogyan épül fel valóban: daruk, robotok, 3D-nyomtatott beton, és a digitális BIM-modell, amelyből az egész építkezést vezetik.'},
    'kozl': {'n': 'Közlekedési létesítmények', 'short': 'Közlekedés', 'b': 'ep', 'd': 'Utak, vasutak, metró, csomópontok: hogy gyorsan, biztonságosan és fenntarthatóan jussunk el A-ból B-be.'},
    'viz': {'n': 'Vízmérnöki', 'short': 'Vízmérnöki', 'b': 'ep', 'd': 'Gátak, zsilipek, árvízvédelem, ivóvíz és szennyvíz. A klímaváltozás korában az egyik legfontosabb mérnöki terület.'},
    'geoinf': {'n': 'Geoinformatika', 'short': 'Geoinformatika', 'b': 'fm', 'd': 'Drón, lézerszkenner, műholdas helymeghatározás: a világ centiméterpontos digitális mása, térképek és térinformatikai rendszerek.'},
    'foldr': {'n': 'Földrendező', 'short': 'Földrendező', 'b': 'fm', 'd': 'Földrészletek, birtokrendezés, területhasználat: kié mi és hol, és hogyan lehet a földet okosabban felosztani és használni.'},
  },
  'M': [
    {'id': 'mol-campus', 'sp': 'geo', 'anim': True, 'labelT': 25, 'orbit': '28deg 76deg 92%', 'kind': 'restart',
     'name': 'MOL Campus', 'act': 'Építsd fel!',
     'hook': '143 méter a Duna-parton – és a titka a föld alatt van.',
     'facts': [['143 m', 'magas a csúccsal'], ['135', 'cölöp a torony alatt'], ['16 m', 'mély munkagödör']],
     'info': 'Budapest legmagasabb épülete feltöltésen és dunai homokos kavicson áll, a talajvíz 8 m mélyen van. Előbb körbe a 21 m mély résfal készül el: ez tartja meg a földet, és kizárja a vizet. Utána jöhet a földkiemelés a négyszintes mélygarázshoz, majd a 2,2 m vastag alaplemez, amelyet 135 cölöp segít a kemény kiscelli agyagig. Csak ezután nőhet a torony. Hogy biztosan álljon, azt a geotechnikus mérnök tervezi meg.'},
    {'id': 'ferdekabeles-hid', 'sp': 'tart', 'anim': True, 'orbit': '26deg 70deg 70%', 'kind': 'labels',
     'name': 'Ferdekábeles híd', 'act': 'Mutasd, mi micsoda!',
     'hook': 'Kábelek tartják a pályát – a színük elárulja, melyikben mekkora az erő.',
     'facts': [['230 m', 'a főnyílás'], ['104 m', 'magas pilonok'], ['88', 'ferde kábel']],
     'info': 'A pálya súlyát és a forgalom terhét a ferde kábelek viszik át a pilonokra, onnan pedig a mederpillérek alapjain jut a teherbíró talajba. A hosszabb, laposabb kábelekben nagyobb az erő: ezt mutatja a sárgától a vörösig tartó szín. A tartószerkezet-tervező mérnök úgy hangolja a kábelerőket, hogy a pálya egyenes maradjon, és a szél, a forgalom és a hőmérséklet-változás se tegyen benne kárt.'},
    {'id': 'metro-pajzs', 'sp': 'kozl', 'anim': True, 'labelT': 19, 'orbit': '24deg 76deg 72%', 'kind': 'restart',
     'name': 'Metróépítés pajzzsal', 'act': 'Indítsd a fúrást!',
     'hook': '21 méterrel az utca alatt fúr – fent senki sem veszi észre.',
     'facts': [['6 m', 'alagútátmérő'], ['21 m', 'mélyen az utca alatt'], ['1,5 m', 'egy gyűrű szélessége']],
     'info': 'A pajzsos alagútfúró elöl forgó vágókerékkel bontja a talajt, a pajzs védelmében pedig rögtön vasbeton elemekből, tübbingekből rakja össze az alagút gyűrűit. A kitermelt talajt szalag viszi hátra, az új elemeket az ellátó vonat hozza az indítóaknából, ahová a daru engedi le őket. A közlekedésmérnök tervezi a vonalat, az állomásokat és a vágányt, a geotechnikussal közösen pedig azt, hogy fent ne mozduljon meg az utca.'},
    {'id': 'hajozsilip', 'sp': 'viz', 'anim': True, 'labelT': 12, 'orbit': '22deg 66deg 72%', 'kind': 'restart',
     'name': 'Hajózsilip', 'act': 'Emeld meg a hajót!',
     'hook': 'Lift a hajónak: 8 méter emelés, szivattyú nélkül.',
     'facts': [['8 m', 'emelés'], ['≈ 100 m', 'hosszú kamra'], ['0', 'szivattyú kell hozzá']],
     'info': 'A zsilip két eltérő vízszint között viszi át a hajót. Bezárul mögötte az alsó kapu, a kamrába a felvízből folyik be a víz, és a hajót a vízzel együtt emeli meg. Amikor a két szint kiegyenlítődik, kinyílik a felső kapu. A busókapu két szárnya a felvíz felé csúcsosan zár, így a víznyomás összeszorítja és tömíti őket. A vízmérnök tervezi a kamrát, a töltést és az ürítést, a kapukat és a partfalakat.'},
    {'id': 'nyomtatott-haz', 'sp': 'eti', 'anim': True, 'labelT': 23, 'orbit': '32deg 62deg 80%', 'kind': 'restart',
     'name': '3D-nyomtatott ház', 'act': 'Nyomtasd ki!',
     'hook': 'Zsalu nélkül, rétegről rétegre: a falat egy óriás 3D-nyomtató húzza fel.',
     'facts': [['0 m²', 'zsaluzat kell hozzá'], ['≈ 3 cm', 'vastag egy nyomtatott réteg'], ['70 m²', 'a ház alapterülete']],
     'info': 'A portálos nyomtató a digitális tervből dolgozik: a fej pontosan a fal vonalán halad, és rétegről rétegre rakja le a gyorsan szilárduló betont. Nem kell zsaluzat, kevesebb az anyagveszteség, és a gép olyan formákat is meg tud építeni, amelyek hagyományos módon drágák lennének. Az építéstechnológus mérnök tervezi meg a gyártás menetét, a betonkeveréket és az ütemezést. Az építményinformációs menedzsment pedig azt jelenti, hogy az egész folyamat egyetlen közös digitális modellből, a BIM-modellből fut.'},
    {'id': 'foldrenges-razoasztal', 'sp': 'tart', 'anim': True, 'labelT': 8.3, 'orbit': '20deg 70deg 74%', 'kind': 'restart',
     'name': 'Földrengés-rázóasztal', 'act': 'Rázd meg!',
     'hook': 'Két egyforma ház, ugyanaz a rengés: az egyik táncol, a másik alig mozdul.',
     'facts': [['6', 'szintes modellház'], ['4', 'gumi-acél saru'], ['± 25 cm', 'mozog a rázóasztal']],
     'info': 'A laborban rázóasztallal utánozzák a földrengést, és kicsinyített épületmodelleken figyelik, mi történik. A bal oldali ház mereven áll az asztalon: a rengés teljes erővel rázza, a felső szintek nagyot lengenek. A jobb oldali ház gumi-acél sarukon áll: a saruk nyíródnak, elnyelik a mozgás nagy részét, így a ház alig mozdul. A tartószerkezet-tervező mérnök számítással és kísérlettel dönti el, hogyan álljon meg egy épület, egy híd vagy egy torony a rengésben.'},
    {'id': 'dron-pontfelho', 'sp': 'geoinf', 'anim': True, 'labelT': 21.5, 'orbit': '26deg 58deg 80%', 'kind': 'restart',
     'name': 'Drón és pontfelhő', 'act': 'Szkenneld be!',
     'hook': 'Egy repülés, és kész a város centiméterpontos digitális ikre.',
     'facts': [['2', 'repülési sáv'], ['30 m', 'repülési magasság'], ['1–2 cm', 'pontosság GNSS-szel']],
     'info': 'A drón lézerszkennere másodpercenként több százezer pontot mér be, és mindegyiknek tudjuk a térbeli helyét. A pontfelhőből – itt a szín a magasságot mutatja – elkészül a terület digitális ikre: épületek, terep, fák és utak, centiméteres pontossággal. A földmérő GNSS-vevővel méri be az illesztőpontokat, így a modell valós koordinátákban áll. A geoinformatikus mérnök ebből tervezési alaptérképet, 3D-városmodellt vagy éppen árvízi elöntési térképet készít.'},
    {'id': 'birtokrendezes', 'sp': 'foldr', 'anim': True, 'labelT': 19, 'orbit': '22deg 56deg 82%', 'kind': 'restart',
     'name': 'Birtokrendezés', 'act': 'Rendezd el!',
     'hook': 'Sok keskeny csíkból néhány nagy tábla – és mindegyikhez út vezet.',
     'facts': [['46', 'keskeny parcella előtte'], ['6', 'nagy tábla utána'], ['3', 'új dűlőút']],
     'info': 'Az örökléssel és adásvételekkel szétaprózott, sokszor csak néhány méter széles parcellákat nehéz megművelni és megközelíteni. A birtokrendezés során a földmérők bemérik a régi határokat, felmérik a tulajdonokat és a földek értékét, majd a tulajdonosokkal egyeztetve új, összevont táblákat alakítanak ki. Mindegyikhez dűlőút vezet, a fasorok védenek a széltől, az árok elvezeti a vizet. A földrendező mérnök a mérést, a jogot, a gazdaságot és a tájat együtt látja.'},
    {'id': 'pisa', 'f': 'pisa-makett', 'img': 'pisa-makett', 'sp': 'geo', 'anim': False, 'orbit': '40deg 78deg 108%', 'kind': 'labels',
     'name': 'A pisai ferde torony', 'act': 'Mutasd, mi micsoda!',
     'hook': '800 éve dől – geotechnikusok állították meg.',
     'facts': [['≈ 3 m', 'átlagos süllyedés'], ['14 500 t', 'a torony tömege'], ['0,5°', 'ennyit billentették vissza']],
     'info': 'A torony alatt puha, összenyomható agyag van, és a déli oldalon kissé gyengébb a talaj, mint az északin: ezért már az építés közben dőlni kezdett. 1999 és 2001 között az északi oldal alól ferde fúrásokkal óvatosan talajt termeltek ki. Az észak felé süllyedő torony így kb. 0,5°-kal visszabillent, és azóta stabil. A metszeteken látszik a rétegsor és a tál alakban lehajlott agyagréteg.'},
  ],
}

HYPH = '<script src="../vendor/hyphenopoly/Hyphenopoly_Loader.js"></script>\n<script>Hyphenopoly.config({ require: { "hu": "FORCEHYPHENOPOLY" }, setup: { hide: "none", selectors: { ".hyphenate": { minWordLength: 6, compound: "auto" } } } });</script>'

# a bemutató (és az aula-túra) sorrendje: a specializációk váltakoznak
ORDER = ['mol-campus', 'ferdekabeles-hid', 'metro-pajzs', 'nyomtatott-haz', 'hajozsilip', 'dron-pontfelho', 'foldrenges-razoasztal', 'birtokrendezes', 'pisa']

def page(L, out):
    L['M'].sort(key=lambda m: ORDER.index(m['id']) if m['id'] in ORDER else 99)
    for k, v in L['SPECS'].items(): v['c'] = SPEC_C[k]
    data = {'lang': L['lang'], 'SPECS': L['SPECS'], 'BSC': L['BSC'], 'M': L['M'], 'T': L['T']}
    s = tpl.replace('{{lang}}', L['lang']).replace('{{hyph}}', HYPH)
    for k, v in L['S'].items(): s = s.replace('{{' + k + '}}', v)
    assert '{{' not in s, s[s.index('{{'):s.index('{{') + 40]
    assert '/*DATA*/null' in s and '/*GUARD*/' in s
    s = s.replace('/*DATA*/null', json.dumps(data, ensure_ascii=False)).replace('/*GUARD*/', guard.strip())
    (root / 'ar-labor' / out).write_text(s, encoding='utf-8'); print(out, len(s))

page(HU, 'index.html')
