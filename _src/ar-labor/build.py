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
    'langsw': '<span class="lang"><span>HU</span><a href="/ar-labor/en" id="langLink" hreflang="en">EN</a></span>',
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
    {'id': 'mol-campus', 'sec': True, 'sp': 'geo', 'anim': True, 'labelT': 25, 'orbit': '28deg 76deg 92%', 'kind': 'restart',
     'name': 'MOL Campus', 'act': 'Építsd fel!',
     'hook': '143 méter a Duna-parton – és a titka a föld alatt van.',
     'facts': [['143 m', 'magas a csúccsal'], ['135', 'cölöp a torony alatt'], ['16 m', 'mély munkagödör']],
     'info': 'Budapest legmagasabb épülete feltöltésen és dunai homokos kavicson áll, a talajvíz 8 m mélyen van. Előbb körbe a 21 m mély résfal készül el: ez tartja meg a földet, és kizárja a vizet. Utána jöhet a földkiemelés a négyszintes mélygarázshoz, majd a 2,2 m vastag alaplemez, amelyet 135 cölöp segít a kemény kiscelli agyagig. Csak ezután nőhet a torony. Hogy biztosan álljon, azt a geotechnikus mérnök tervezi meg.'},
    {'id': 'ferdekabeles-hid', 'sp': 'tart', 'anim': True, 'orbit': '26deg 70deg 70%', 'kind': 'labels',
     'name': 'Ferdekábeles híd', 'act': 'Mutasd, mi micsoda!',
     'hook': 'Kábelek tartják a pályát – a színük elárulja, melyikben mekkora az erő.',
     'facts': [['230 m', 'a főnyílás'], ['104 m', 'magas pilonok'], ['88', 'ferde kábel']],
     'info': 'A pálya súlyát és a forgalom terhét a ferde kábelek viszik át a pilonokra, onnan pedig a mederpillérek alapjain jut a teherbíró talajba. A hosszabb, laposabb kábelekben nagyobb az erő: ezt mutatja a sárgától a vörösig tartó szín. A tartószerkezet-tervező mérnök úgy hangolja a kábelerőket, hogy a pálya egyenes maradjon, és a szél, a forgalom és a hőmérséklet-változás se tegyen benne kárt.'},
    {'id': 'metro-pajzs', 'sec': True, 'sp': 'kozl', 'anim': True, 'labelT': 19, 'orbit': '24deg 76deg 72%', 'kind': 'restart',
     'name': 'Metróépítés pajzzsal', 'act': 'Indítsd a fúrást!',
     'hook': '21 méterrel az utca alatt fúr – fent senki sem veszi észre.',
     'facts': [['6 m', 'alagútátmérő'], ['21 m', 'mélyen az utca alatt'], ['1,5 m', 'egy gyűrű szélessége']],
     'info': 'A pajzsos alagútfúró elöl forgó vágókerékkel bontja a talajt, a pajzs védelmében pedig rögtön vasbeton elemekből, tübbingekből rakja össze az alagút gyűrűit. A kitermelt talajt szalag viszi hátra, az új elemeket az ellátó vonat hozza az indítóaknából, ahová a daru engedi le őket. A közlekedésmérnök tervezi a vonalat, az állomásokat és a vágányt, a geotechnikussal közösen pedig azt, hogy fent ne mozduljon meg az utca.'},
    {'id': 'hajozsilip', 'sec': True, 'sp': 'viz', 'anim': True, 'labelT': 12, 'orbit': '22deg 66deg 72%', 'kind': 'restart',
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
    {'id': 'felhokarcolo-tmd', 'sp': 'tart', 'anim': True, 'labelT': 16, 'orbit': '24deg 74deg 92%', 'kind': 'restart',
     'name': 'Felhőkarcoló szélben', 'act': 'Indítsd a szelet!',
     'hook': '300 méter magasan egy óriás inga fogja meg a lengést.',
     'facts': [['300 m', 'magas torony'], ['≈ 4 s', 'egy lengés ideje'], ['5×', 'kisebb kilengés az ingával']],
     'info': 'A magas, karcsú tornyot a szél lengésbe hozza: a felső szinteken ez kellemetlen, erős szélben akár ijesztő is lehet. A csúcsban ezért egy több száz tonnás ingát függesztenek fel, amelynek a lengésideje a toronyéval egyezik. Amikor a torony kilendül, az inga az ellenkező irányba leng, és visszahúzza: a kilengés a töredékére csökken. A tartószerkezet-tervező mérnök szélcsatorna-kísérletekkel és számítással hangolja be a rendszert.'},
    {'id': 'autopalya-csomopont', 'sp': 'kozl', 'anim': True, 'labelT': 5, 'orbit': '30deg 56deg 70%', 'kind': 'labels',
     'name': 'Autópálya-csomópont', 'act': 'Mutasd, mi micsoda!',
     'hook': 'Lóhere alakú csomópont: mindenki kanyarodhat, senki sem áll meg.',
     'facts': [['2 × 3', 'sáv az autópályán'], ['4', 'hurokág'], ['0', 'jelzőlámpa']],
     'info': 'A lóhere-csomópontban a főút hídon halad át az autópálya fölött, a négy hurokág pedig keresztezés nélkül vezeti át a balra kanyarodókat: egy háromnegyed körrel jobbra fordulva kerülnek a másik útra. Így nem kell jelzőlámpa, a forgalom folyamatos. A közlekedésmérnök tervezi meg a nyomvonalat, az ívek sugarát, az emelkedőket és a csatlakozó sávokat úgy, hogy nagy sebességnél is biztonságos maradjon.'},
    {'id': 'gat-vizeromu', 'sec': True, 'sp': 'viz', 'anim': True, 'labelT': 6, 'orbit': '26deg 70deg 78%', 'kind': 'restart',
     'name': 'Völgyzáró gát', 'act': 'Nyisd ki a zsilipet!',
     'hook': 'Egy betonfal 42 méter mély vizet tart vissza – és közben áramot termel.',
     'facts': [['42 m', 'mély tározó'], ['48 m', 'magas gát'], ['1', 'turbina és generátor']],
     'info': 'A gravitációs gát a saját súlyával áll ellen a víz nyomásának, ezért a szelvénye alul széles, háromszög alakú. A tározóból a víz a nyomócsövön zúdul le a gát lábánál álló erőműházba, ott megforgatja a turbinát, a turbina pedig a generátort, az áram pedig a távvezetéken jut el a városba. Ha túl sok a víz, kinyitják az árapasztó zsilipjét. A vízmérnök tervezi a tározót, a gátat és az árvízi biztonságot, a geotechnikussal közösen pedig a gát alapozását és azt, hogy a víz ne szivárogjon el alatta.'},
    {'id': 'mobilgat', 'sec': True, 'sp': 'viz', 'anim': True, 'labelT': 15, 'orbit': '24deg 66deg 74%', 'kind': 'restart',
     'name': 'Mobilgát', 'act': 'Jön az árvíz!',
     'hook': 'Pár óra alatt felépül, és megvédi a várost a megáradt folyótól.',
     'facts': [['7,6 m', 'vízszint-emelkedés'], ['13', 'gerenda egymáson'], ['4 m', 'oszloptávolság']],
     'info': 'Ahol a folyópartot nem akarják állandó fallal elzárni, mobilgátat terveznek: a rakpartba betonalapot és csatlakozókat építenek, árvíz előtt pedig a dolgozók gyorsan felállítják az acéloszlopokat, és beengedik közéjük az alumínium gerendákat. A gerendák között tömítés van, a víznyomás pedig csak még jobban összeszorítja őket. A víz levonulása után az egészet elbontják, és a part újra szabad. A vízmérnök tervezi a védvonal magasságát, a geotechnikus pedig azt, hogy a víz ne szivárogjon át alatta.'},
    {'id': 'nagysebessegu-vasut', 'sp': 'kozl', 'anim': True, 'labelT': 2.35, 'orbit': '26deg 72deg 72%', 'kind': 'restart',
     'name': 'Nagysebességű vasút', 'act': 'Jön a vonat!',
     'hook': '300 km/h: a szerelvény alig két másodperc alatt suhan át a völgyhídon.',
     'facts': [['300 km/h', 'sebesség'], ['25 kV', 'a felsővezetékben'], ['≈ 2 s', 'alatt ér át a hídon']],
     'info': 'Nagy sebességnél minden centiméter számít: a vágánynak nagyon pontosan kell feküdnie, az íveknek nagy sugarúnak, az emelkedőknek enyhének kell lenniük. Ezért a pálya völgyhídon szeli át a völgyet, és alagúton át a dombot. A sínek betonlemezen fekszenek, fölöttük 25 kV-os felsővezeték adja az áramot. A közlekedésmérnök tervezi meg a nyomvonalat és a pályaszerkezetet, a hidat és az alagutat pedig a tartószerkezet-tervező és a geotechnikus mérnök.'},
    {'id': 'bim-epitkezes', 'sp': 'eti', 'anim': True, 'labelT': 22, 'orbit': '30deg 66deg 80%', 'kind': 'restart',
     'name': 'Épülő ház BIM-mel', 'act': 'Építsd fel!',
     'hook': 'Előbb digitálisan épül fel – a valóság szintről szintre utoléri.',
     'facts': [['6', 'szintes épület'], ['1', 'közös digitális modell'], ['3', 'réteg: szerkezet, gépészet, homlokzat']],
     'info': 'A BIM (épületinformációs modellezés) azt jelenti, hogy az épület előbb a számítógépben készül el, minden elemével együtt: pillérek, födémek, csövek, légcsatornák, ablakok. A modellből számolják a mennyiségeket és a költséget, ütemezik az építést, és még a kivitelezés előtt kiszűrik, ha egy cső belefutna egy gerendába. A helyszínen tableten nézik, mi következik. Az építéstechnológus mérnök ebből a közös modellből irányítja a kivitelezést, a daru mozgásától a homlokzat szereléséig.'},
    {'id': 'cfa', 'sec': True, 'f': 'cfa-makett', 'img': 'cfa-makett', 'sp': 'geo', 'anim': True, 'orbit': '28deg 74deg 100%', 'kind': 'labels',
     'name': 'CFA-cölöp fúrás közben', 'act': 'Mutasd, mi micsoda!',
     'hook': 'Becsavarja magát a talajba – béléscső és zagy nélkül.',
     'facts': [['80 cm', 'cölöpátmérő'], ['10 m', 'fúrásmélység'], ['20 m', 'spirálhossz']],
     'info': 'A CFA-cölöp folyamatos spirálfúróval készül. A spirál 10 m mélyen jár, a menetei tele vannak talajjal: ez a talaj támasztja meg a furat falát, ezért nem kell béléscső vagy zagy. A betont tömlő hozza a forgatófejig, onnan a spirál üreges szárán jut le a talpig, és a spirál visszahúzásával kitölti a furatot; a vasalást utána engedik bele a friss betonba. A gépet a fülkében ülő gépkezelő irányítja. A geotechnikus mérnök tervezi meg, milyen hosszú és vastag cölöpök kellenek, hogy biztonságosan elbírják az épület terhét.'},
    {'id': 'pisa', 'sec': True, 'f': 'pisa-makett', 'img': 'pisa-makett', 'sp': 'geo', 'anim': False, 'orbit': '40deg 78deg 108%', 'kind': 'labels',
     'name': 'A pisai ferde torony', 'act': 'Mutasd, mi micsoda!',
     'hook': '800 éve dől – geotechnikusok állították meg.',
     'facts': [['≈ 3 m', 'átlagos süllyedés'], ['14 500 t', 'a torony tömege'], ['0,5°', 'ennyit billentették vissza']],
     'info': 'A torony alatt puha, összenyomható agyag van, és a déli oldalon kissé gyengébb a talaj, mint az északin: ezért már az építés közben dőlni kezdett. 1999 és 2001 között az északi oldal alól ferde fúrásokkal óvatosan talajt termeltek ki. Az észak felé süllyedő torony így kb. 0,5°-kal visszabillent, és azóta stabil. A metszeteken látszik a rétegsor és a tál alakban lehajlott agyagréteg.'},
  ],
}


EN_S = {
    'title': 'AR Lab – What would you build? | BME Faculty of Civil Engineering',
    'desc': 'Rotate, zoom and view them in AR on your phone: bridges, towers, tunnels, locks – moving 3D models from every specialisation of the BME Faculty of Civil Engineering.',
    'brand': 'AR Lab', 'brand2': 'What would you build?',
    'nav_models': 'Models', 'nav_specs': 'Specialisations', 'nav_back': 'Geotechnics showcase', 'nav_aula': 'Hall mode',
    'prev': 'Previous model', 'next': 'Next model', 'hint': 'Rotate · zoom · try the button',
    'ar': 'View it in your room', 'pause': 'Pause', 'labels': 'Labels', 'rotate': 'Rotate', 'fullscreen': 'Full screen',
    'abrand': '<b>BME Faculty of Civil Engineering</b> · AR Lab', 'aqr_t': 'Try it in AR!', 'aqr_s': 'Scan the code and put the model on the table.',
    'aula_exit': 'Exit hall mode',
    'models_h': 'Pick a <em>model!</em>',
    'qr_t': 'Take it with you', 'qr_s': 'Scan it with your phone and view the model in AR on your own desk.',
    'specs_h': 'Which one <em>is yours?</em>',
    'foot': 'BME Faculty of Civil Engineering · AR Lab. The models are simplified, for teaching purposes.',
    'foot_link': 'Back to the geotechnics showcase',
    'langsw': '<span class="lang"><a href="/ar-labor" id="langLink" hreflang="hu">HU</a><span>EN</span></span>',
}
EN_T = {'all': 'All', 'soon': 'Coming soon', 'learn': 'You study this', 'play': 'Play', 'pause': 'Pause',
        'manual': 'You’re in control · moving on in {s} s', 'fsHint': 'F: full screen · ←/→: browse'}
EN_BSC = {'ep': {'n': 'Civil Engineering BSc', 'd': '8 semesters · 5 specialisations'},
          'fm': {'n': 'Surveying and Land Management Engineering BSc', 'd': '7 semesters · from September 2027'}}
EN_SPECS = {
    'tart': {'n': 'Structural Engineering', 'short': 'Structures', 'b': 'ep', 'd': 'Bridges, towers and halls: they must carry the loads, the wind and earthquakes – and look good while doing it.'},
    'geo': {'n': 'Geotechnical Engineering', 'short': 'Geotechnics', 'b': 'ep', 'd': 'What lies beneath the surface: foundations, excavations, tunnels and earthworks. Every building stands on the ground – someone has to work out how.'},
    'eti': {'n': 'Construction Technology and Building Information Management', 'short': 'Construction', 'b': 'ep', 'd': 'How it actually gets built: cranes, robots, 3D-printed concrete, and the digital BIM model that runs the whole construction site.'},
    'kozl': {'n': 'Transport Infrastructure', 'short': 'Transport', 'b': 'ep', 'd': 'Roads, railways, metro lines and interchanges: getting from A to B quickly, safely and sustainably.'},
    'viz': {'n': 'Water Engineering', 'short': 'Water', 'b': 'ep', 'd': 'Dams, locks, flood defence, drinking water and wastewater. In an age of climate change, one of the most important fields of engineering.'},
    'geoinf': {'n': 'Geoinformatics', 'short': 'Geoinformatics', 'b': 'fm', 'd': 'Drones, laser scanners and satellite positioning: a centimetre-accurate digital copy of the world, maps and geographic information systems.'},
    'foldr': {'n': 'Land Management', 'short': 'Land Management', 'b': 'fm', 'd': 'Land parcels, land consolidation and land use: who owns what and where, and how land can be divided and used more wisely.'},
}
EN_M = {
  'mol-campus': ('MOL Campus', 'Build it!', '143 metres on the Danube bank – and its secret lies underground.',
    [['143 m', 'tall including the spire'], ['135', 'piles under the tower'], ['16 m', 'deep excavation']],
    'Budapest’s tallest building stands on made ground and Danube sandy gravel, with groundwater 8 m below the surface. First the 21 m deep diaphragm wall goes in all around: it retains the soil and keeps the water out. Then comes the excavation for the four-level basement, followed by the 2.2 m thick raft, supported by 135 piles reaching down to the stiff Kiscell clay. Only then can the tower rise. Making sure it stands safely is the geotechnical engineer’s job.'),
  'ferdekabeles-hid': ('Cable-stayed bridge', 'Show me what’s what!', 'Cables hold up the deck – their colour shows how much force each one carries.',
    [['230 m', 'main span'], ['104 m', 'tall pylons'], ['88', 'stay cables']],
    'The weight of the deck and the traffic is carried by the stay cables to the pylons, and from there through the foundations of the river piers into the bearing ground. The longer, flatter cables carry more force: that is what the colour from yellow to red shows. The structural engineer tunes the cable forces so that the deck stays straight and is not harmed by wind, traffic or changes in temperature.'),
  'metro-pajzs': ('Building a metro with a TBM', 'Start boring!', 'It bores 21 metres below the street – and nobody up there notices.',
    [['6 m', 'tunnel diameter'], ['21 m', 'below the street'], ['1.5 m', 'width of one ring']],
    'The tunnel boring machine excavates the ground with a rotating cutterhead at the front, and under the protection of its shield it immediately assembles the tunnel rings from precast concrete segments. A conveyor carries the spoil back, and the supply train brings new segments from the launch shaft, where the crane lowers them. The transport engineer designs the route, the stations and the track, and together with the geotechnical engineer makes sure that the street above does not move.'),
  'nyomtatott-haz': ('3D-printed house', 'Print it!', 'No formwork, layer by layer: a giant 3D printer builds up the walls.',
    [['0 m²', 'of formwork needed'], ['≈ 3 cm', 'thick printed layer'], ['70 m²', 'floor area of the house']],
    'The gantry printer works from the digital design: the print head follows the line of the wall precisely and lays down fast-setting concrete layer by layer. No formwork is needed, less material is wasted, and the machine can build shapes that would be expensive to make the traditional way. The construction engineer plans the production process, the concrete mix and the schedule. Building information management means that the whole process runs from one shared digital model, the BIM model.'),
  'hajozsilip': ('Navigation lock', 'Lift the ship!', 'A lift for ships: an 8-metre rise with no pumps.',
    [['8 m', 'lift'], ['≈ 100 m', 'long chamber'], ['0', 'pumps needed']],
    'A lock carries ships between two different water levels. The lower gate closes behind the ship, water flows into the chamber from the upper pool, and the ship rises with it. When the two levels are equal, the upper gate opens. The two leaves of a mitre gate close in a point facing the upper pool, so the water pressure presses them together and seals them. The water engineer designs the chamber, the filling and emptying system, the gates and the lock walls.'),
  'dron-pontfelho': ('Drone and point cloud', 'Scan it!', 'One flight, and the town’s centimetre-accurate digital twin is ready.',
    [['2', 'flight strips'], ['30 m', 'flying height'], ['1–2 cm', 'accuracy with GNSS']],
    'The drone’s laser scanner measures hundreds of thousands of points every second, and the position of each one in space is known. From the point cloud – here the colour shows height – the area’s digital twin is created: buildings, terrain, trees and roads, with centimetre accuracy. The surveyor measures control points with a GNSS receiver, so the model sits in real-world coordinates. From this, the geoinformatics engineer produces base maps for design, 3D city models or even flood inundation maps.'),
  'foldrenges-razoasztal': ('Earthquake shake table', 'Shake it!', 'Two identical buildings, the same earthquake: one dances, the other barely moves.',
    [['6', 'storey model buildings'], ['4', 'rubber–steel bearings'], ['± 25 cm', 'table movement']],
    'In the laboratory a shake table recreates an earthquake, and engineers watch what happens to scale models of buildings. The building on the left stands rigidly on the table: the earthquake shakes it at full strength, and the upper storeys sway a lot. The building on the right stands on rubber–steel bearings: the bearings deform in shear and absorb most of the motion, so the building barely moves. The structural engineer uses calculation and testing to decide how a building, a bridge or a tower can withstand an earthquake.'),
  'birtokrendezes': ('Land consolidation', 'Sort it out!', 'A few large fields from many narrow strips – and a road to every one.',
    [['46', 'narrow parcels before'], ['6', 'large fields after'], ['3', 'new farm roads']],
    'Parcels split up by inheritance and sales, often only a few metres wide, are hard to farm and hard to reach. In land consolidation, surveyors measure the old boundaries and assess ownership and land values, then, in agreement with the owners, create new, consolidated fields. Every field gets a farm road, rows of trees shelter it from the wind and a ditch drains the water. The land management engineer sees surveying, law, economics and the landscape together.'),
  'autopalya-csomopont': ('Motorway interchange', 'Show me what’s what!', 'A cloverleaf interchange: everyone can turn, nobody has to stop.',
    [['2 × 3', 'motorway lanes'], ['4', 'loop ramps'], ['0', 'traffic lights']],
    'In a cloverleaf interchange the main road crosses over the motorway on a bridge, and the four loop ramps take left-turning traffic across without any crossing movements: vehicles turn right through three-quarters of a circle to join the other road. No traffic lights are needed and traffic keeps flowing. The transport engineer designs the alignment, the curve radii, the gradients and the slip lanes so that it stays safe even at high speed.'),
  'gat-vizeromu': ('Valley dam', 'Open the gate!', 'A concrete wall holds back 42 metres of water – and generates electricity too.',
    [['42 m', 'deep reservoir'], ['48 m', 'tall dam'], ['1', 'turbine and generator']],
    'A gravity dam resists the water pressure with its own weight, so its cross-section is wide at the bottom and triangular. Water from the reservoir rushes down the penstock to the powerhouse at the foot of the dam, where it turns the turbine; the turbine drives the generator, and the electricity reaches the town along the power line. If there is too much water, the spillway gate is opened. The water engineer designs the reservoir, the dam and its flood safety, and together with the geotechnical engineer the dam’s foundation and how to stop water seeping underneath it.'),
  'felhokarcolo-tmd': ('Skyscraper in the wind', 'Start the wind!', '300 metres up, a giant pendulum tames the sway.',
    [['300 m', 'tall tower'], ['≈ 4 s', 'one sway'], ['5×', 'less sway with the pendulum']],
    'Wind sets a tall, slender tower swaying: on the upper floors this is unpleasant, and in a strong wind it can even be frightening. So a pendulum weighing several hundred tonnes is hung at the top, tuned to swing with the same period as the tower. When the tower sways one way, the pendulum swings the other way and pulls it back: the sway drops to a fraction. The structural engineer tunes the system with wind tunnel tests and calculations.'),
  'bim-epitkezes': ('Building with BIM', 'Build it!', 'It is built digitally first – then reality catches up, storey by storey.',
    [['6', 'storey building'], ['1', 'shared digital model'], ['3', 'layers: structure, services, façade']],
    'BIM (building information modelling) means that the building is completed in the computer first, with every element: columns, slabs, pipes, ducts and windows. The model is used to calculate quantities and costs, to schedule the works, and to spot before construction whether a pipe would run into a beam. On site, the team checks on a tablet what comes next. The construction engineer runs the works from this shared model, from the crane movements to the installation of the façade.'),
  'mobilgat': ('Demountable flood wall', 'Here comes the flood!', 'Put up in a few hours, it protects the town from the swollen river.',
    [['7.6 m', 'rise in water level'], ['13', 'beams stacked'], ['4 m', 'post spacing']],
    'Where the riverbank should not be closed off by a permanent wall, engineers design a demountable flood wall: a concrete foundation with fixings is built into the embankment, and before a flood the crews quickly put up the steel posts and slide the aluminium beams between them. There are seals between the beams, and the water pressure only presses them tighter. Once the water has gone down, the whole wall is taken away and the riverbank is open again. The water engineer designs the height of the defence line, and the geotechnical engineer makes sure that water does not seep through underneath.'),
  'nagysebessegu-vasut': ('High-speed railway', 'Here comes the train!', '300 km/h: the train flashes across the viaduct in barely two seconds.',
    [['300 km/h', 'speed'], ['25 kV', 'in the overhead line'], ['≈ 2 s', 'to cross the bridge']],
    'At high speed every centimetre counts: the track must be laid very precisely, the curves must have large radii and the gradients must be gentle. That is why the line crosses the valley on a viaduct and goes through the hill in a tunnel. The rails sit on a concrete slab, and a 25 kV overhead line above supplies the power. The transport engineer designs the alignment and the track structure, while the structural and geotechnical engineers design the bridge and the tunnel.'),
  'cfa': ('CFA pile during drilling', 'Show me what’s what!', 'It screws itself into the ground – no casing, no slurry.',
    [['80 cm', 'pile diameter'], ['10 m', 'drilling depth'], ['20 m', 'auger length']],
    'A CFA pile is made with a continuous flight auger. The auger is 10 m deep, and its flights are full of soil: this soil supports the borehole wall, which is why no casing or slurry is needed. The concrete is brought by a hose to the rotary head, and from there it runs down the hollow stem of the auger to the base, filling the borehole as the auger is withdrawn; the reinforcement cage is then pushed into the fresh concrete. The rig is controlled by the operator sitting in the cab. The geotechnical engineer works out how long and how thick the piles need to be to carry the load of the building safely.'),
  'pisa': ('The Leaning Tower of Pisa', 'Show me what’s what!', 'Leaning for 800 years – geotechnical engineers stopped it.',
    [['≈ 3 m', 'average settlement'], ['14,500 t', 'mass of the tower'], ['0.5°', 'tilted back by']],
    'Beneath the tower lies soft, compressible clay, and the ground on the south side is slightly weaker than on the north: that is why it started to lean during construction. Between 1999 and 2001, soil was carefully extracted from beneath the north side through inclined boreholes. The tower, settling towards the north, tilted back by about 0.5°, and it has been stable ever since. The cross-sections show the soil layers and the clay layer bent down into a bowl shape.'),
}
import copy
EN = {'lang': 'en', 'S': EN_S, 'T': EN_T, 'BSC': EN_BSC, 'SPECS': EN_SPECS, 'M': []}
for m in HU['M']:
    e = copy.deepcopy(m); n, a, h, f, i = EN_M[m['id']]; e.update({'name': n, 'act': a, 'hook': h, 'facts': f, 'info': i}); EN['M'].append(e)

HYPH = '<script src="../vendor/hyphenopoly/Hyphenopoly_Loader.js"></script>\n<script>Hyphenopoly.config({ require: { "hu": "FORCEHYPHENOPOLY" }, setup: { hide: "none", selectors: { ".hyphenate": { minWordLength: 6, compound: "auto" } } } });</script>'

# a bemutató (és az aula-túra) sorrendje: a specializációk váltakoznak
ORDER = ['mol-campus', 'ferdekabeles-hid', 'metro-pajzs', 'nyomtatott-haz', 'hajozsilip', 'dron-pontfelho', 'cfa', 'foldrenges-razoasztal', 'birtokrendezes', 'autopalya-csomopont', 'gat-vizeromu', 'felhokarcolo-tmd', 'bim-epitkezes', 'mobilgat', 'nagysebessegu-vasut', 'pisa']

def page(L, out):
    L['M'].sort(key=lambda m: ORDER.index(m['id']) if m['id'] in ORDER else 99)
    for k, v in L['SPECS'].items(): v['c'] = SPEC_C[k]
    data = {'lang': L['lang'], 'SPECS': L['SPECS'], 'BSC': L['BSC'], 'M': L['M'], 'T': L['T']}
    s = tpl.replace('{{lang}}', L['lang']).replace('{{hyph}}', HYPH if L['lang'] == 'hu' else '')
    for k, v in L['S'].items(): s = s.replace('{{' + k + '}}', v)
    assert '{{' not in s, s[s.index('{{'):s.index('{{') + 40]
    assert '/*DATA*/null' in s and '/*GUARD*/' in s
    s = s.replace('/*DATA*/null', json.dumps(data, ensure_ascii=False)).replace('/*GUARD*/', guard.strip())
    (root / 'ar-labor' / out).write_text(s, encoding='utf-8'); print(out, len(s))

page(HU, 'index.html')
page(EN, 'en.html')
