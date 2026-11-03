#!/usr/bin/env python3
# index.html = index.tpl.html + a formázás-őr (GUARD/RAG3) a /*GUARD*/ helyére
import pathlib, re
here = pathlib.Path(__file__).resolve().parent
tpl = (here / 'index.tpl.html').read_text(encoding='utf-8')
guard = (here / 'guard.js').read_text(encoding='utf-8')
assert '/*GUARD*/' in tpl
(here.parent / 'index.html').write_text(tpl.replace('/*GUARD*/', guard.strip()), encoding='utf-8')
print('index.html', len(tpl) + len(guard))
