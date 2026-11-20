# A data/tihany_gen.js előállítása: a Belső-tó környékének műholdképéből (Esri World Imagery, z17 csempék, 1 m/px mozaik: esri.png)
# és az OpenStreetMap-adatokból (osm.json = data/tihany_data.js). A képet nem tároljuk a repóban.
import json, math, colorsys, pickle
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from skimage import measure
from shapely.geometry import Polygon, MultiPolygon, box, Point, LineString
from shapely.ops import unary_union
D=json.load(open('osm.json'))
im=np.asarray(Image.open('esri.png')).astype(float)
H,W=im.shape[:2]; MX,MZ=-640,-580
AX0,AX1,AZ0,AZ1=-220,1180,-500,400
AREA=box(AX0,AZ0,AX1,AZ1)
def rc(p): return (p[0]-MX, p[1]-MZ)
def poly_mask(pts, w=None):
    m=Image.new('L',(W,H),0); d=ImageDraw.Draw(m)
    if w: d.line([rc(p) for p in pts],fill=255,width=w)
    else: d.polygon([rc(p) for p in pts],fill=255)
    return np.asarray(m)>0
def geom_mask(g):
    m=Image.new('L',(W,H),0); d=ImageDraw.Draw(m)
    for q in (g.geoms if hasattr(g,'geoms') else [g]):
        if q.geom_type!='Polygon' or q.is_empty: continue
        d.polygon([rc(p) for p in q.exterior.coords],fill=255)
        for h in q.interiors: d.polygon([rc(p) for p in h.coords],fill=0)
    return np.asarray(m)>0
lakeP=Polygon(D['BELSO_TO']).buffer(0); reedP=Polygon(D['NADAS']).buffer(0)
villageP=Polygon(D['FALU']).buffer(0)
kulsoP=Polygon([[-700,-280]]+D['KULSO_TO_EDGE']+[[-6,-900],[-700,-900]]).buffer(0)
lake=geom_mask(lakeP); reed=geom_mask(reedP)&~lake; village=geom_mask(villageP); kulso=geom_mask(kulsoP)
barrier=np.zeros((H,W),bool)
for l in D['UTAK']: barrier|=poly_mask(l,4)
for l in D['UTCAK']: barrier|=poly_mask(l,6)
tree=np.load('tree.npy'); coh=np.load('coh.npy')
for (x0,z0,x1,z1) in [(-470,-150,-310,5),(-90,-505,60,-360)]: tree[z0-MZ:z1-MZ, x0-MX:x1-MX]=False
osmforest=np.zeros((H,W),bool)
for e in D['ERDO']: osmforest|=poly_mask(e)
tree=(tree|(osmforest&(ndi.uniform_filter(im[...,1],9)<110)))&~lake
def boost(c, v=1.38):
    h,s,vv=colorsys.rgb_to_hsv(*(np.array(c)/255)); vv=min(0.92,vv*v+0.05); s=min(0.75,s*1.1)
    return '#%02x%02x%02x'%tuple(round(x*255) for x in colorsys.hsv_to_rgb(h,s,vv))
def polys(g):
    out=[]
    for q in (g.geoms if hasattr(g,'geoms') else [g]):
        if q.geom_type=='Polygon' and q.area>40:
            q=q.simplify(0.8)
            out.append([[round(x,1),round(z,1)] for x,z in list(q.exterior.coords)[:-1]])
    return out
# ---- rendezési terület (kézzel, a kiterített műholdkép alapján) ----
A=np.array([0.563,0.826]); A/=np.linalg.norm(A); Pp=np.array([A[1],-A[0]]); O=np.array([0,100.])
def su(s,u): return list(O+s*Pp+u*A)
def quad(s0,s1,u0,u1): return Polygon([su(s0,u0),su(s1,u0),su(s1,u1),su(s0,u1)])
# blokkok: (név, s0, s1, u0(s0), u0(s1), u1(s0), u1(s1))
def blk(s0,s1,ua0,ub0,ua1,ub1): return Polygon([su(s0,ua0),su(s1,ub0),su(s1,ub1),su(s0,ua1)])
BW=blk(-143,-66,-87,-92,92,93)
BN=blk(-47,117,-100,-102,103,107)
BS=blk(-57,116,113,114,315,329)
def band(B,s0,s1): return B.intersection(Polygon([su(s0,-400),su(s1,-400),su(s1,600),su(s0,600)]))
# a mai csíkok: (blokk, s0, s1, fajta)
STR=[(BW,-143,-108,'lev'),(BW,-108,-100,'gyep'),(BW,-100,-66,'lev'),
     (BN,-47,-17,'gyep'),(BN,-17,17,'szolo'),(BN,17,57,'lev'),(BN,57,83,'szolo'),(BN,83,117,'parlag'),
     (BS,-57,8,'szolo'),(BS,8,62,'gyep'),(BS,62,102,'gyep2'),(BS,102,116,'szolo')]
def medcol(g):
    m=geom_mask(g)&~tree; return np.median(im[m],0) if m.sum()>20 else np.array([100,105,80])
areas=[band(B,s0,s1).area for (B,s0,s1,k) in STR]; blkid=[0,0,0,1,1,1,1,1,2,2,2,2]
AW,AN,AS=BW.area,BN.area,BS.area
import itertools
rng0=np.random.default_rng(11); best=None
splits=[]
for x in range(5):
    rest=[q for q in range(5) if q!=x]
    for pair in itertools.combinations(rest,2):
        splits.append((x,pair,tuple(q for q in rest if q not in pair)))
for it in range(60000):
    o=rng0.integers(0,5,12)
    ok=True
    for q in range(5):
        idx=np.nonzero(o==q)[0]
        if len(idx)<2 or len(set(blkid[i] for i in idx))<2: ok=False; break
    if not ok: continue
    if any(o[i]==o[i+1] and blkid[i]==blkid[i+1] for i in range(11)): continue
    tot=np.bincount(o,weights=areas,minlength=5)
    for x,pn,ps in splits:
        cost=abs(tot[x]-AW)+abs(tot[list(pn)].sum()-AN)
        if best is None or cost<best[0]: best=(cost,o.copy(),x,pn,ps)
cost,o,x,pn,ps=best
# betűk: a nyugati blokk tulajdonosa A, az északié B, C, a délié D, E
name={x:'A',pn[0]:'B',pn[1]:'C',ps[0]:'D',ps[1]:'E'}
OWN=[name[i] for i in o]
print('tulajdonosok', OWN, 'eltérés m2', round(cost))
mai=[]
for (B,s0,s1,kind),o in zip(STR,OWN):
    g=band(B,s0,s1); mai.append({'p':polys(g),'c':boost(medcol(g)),'k':kind,'o':o,'s':[s0,s1],'a':round(g.area)})
# utána: A → nyugati blokk, D → déli blokk, B, C, E → északi blokk (arányosan)
area={o:sum(m['a'] for m in mai if m['o']==o) for o in 'ABCDE'}
uj=[]
KIND={}
for m in mai: KIND.setdefault(m['o'],[]).append((m['a'],m['k']))
def kind_of(o): return max(KIND[o])[1].replace('gyep2','gyep').replace('parlag','gyep')
g=band(BW,-143,-66); uj.append({'p':polys(g),'o':'A','k':kind_of('A'),'a':round(g.area)})
def split(B,s0,s1,owners):
    s=s0
    for i,o in enumerate(owners):
        if i==len(owners)-1: e=s1
        else:
            lo,hi=s,s1
            for _ in range(40):
                mid=(lo+hi)/2
                if band(B,s,mid).area<area[o]: lo=mid
                else: hi=mid
            e=(lo+hi)/2
        g=band(B,s,e); uj.append({'p':polys(g),'o':o,'k':kind_of(o),'a':round(g.area),'s':[s,e]}); s=e
split(BN,-47,117,['B','C']); split(BS,-57,116,['D','E'])
print('területek ma', area, 'utána', {u['o']:u['a'] for u in uj})
ZONE=unary_union([BW,BN,BS]).buffer(1)
# ---- a többi mező: OSM-blokkok, automatikus sávokkal ----
free=geom_mask(AREA)&~lake&~reed&~village&~kulso&~barrier&~geom_mask(ZONE)
lab,n=ndi.label(free)
L_=0.3*im[...,0]+0.59*im[...,1]+0.11*im[...,2]
gx=ndi.gaussian_filter(L_,1.0,order=(0,1)); gz=ndi.gaussian_filter(L_,1.0,order=(1,0))
def poly_of(mask):
    cs=measure.find_contours(np.pad(mask,1).astype(float),0.5)
    ps=[Polygon([(c[1]-1+MX,c[0]-1+MZ) for c in cc]).buffer(0) for cc in cs if len(cc)>8]
    if not ps: return None
    ps.sort(key=lambda p:-p.area); outer=ps[0]
    for p in ps[1:]:
        if outer.contains(p.representative_point()): outer=outer.difference(p)
    return outer.simplify(1.2).intersection(AREA)
mezo=[]
for k in range(1,n+1):
    m=lab==k
    if m.sum()<200: continue
    P=poly_of(m)
    if P is None or P.is_empty: continue
    ys,xs=np.nonzero(m)
    if tree[m].mean()>0.55: mezo.append({'p':polys(P),'c':'#4c7a3e','k':'erdo'}); continue
    sel=~tree[ys,xs]
    wx=gx[ys[sel],xs[sel]]; wz=gz[ys[sel],xs[sel]]; a=np.arctan2(wz,wx); wg=wx*wx+wz*wz
    th=0.5*math.atan2((wg*np.sin(2*a)).sum(),(wg*np.cos(2*a)).sum())
    g=np.array([math.cos(th),math.sin(th)]); t=(xs+MX)*g[0]+(ys+MZ)*g[1]
    tt=t[sel]; cols=im[ys[sel],xs[sel]]
    t0,t1=tt.min(),tt.max(); nb=int(t1-t0)+1; bi=(tt-t0).astype(int)
    cnt=np.bincount(bi,minlength=nb).astype(float); prof=np.stack([np.bincount(bi,cols[:,i],minlength=nb) for i in range(3)],1)
    kern=np.ones(5); cs=np.convolve(cnt,kern,'same'); ps=np.stack([np.convolve(prof[:,i],kern,'same') for i in range(3)],1)/np.maximum(cs,1)[:,None]
    w=7; dif=np.zeros(nb)
    for i in range(w,nb-w):
        l=ps[i-w:i][cs[i-w:i]>5]; r=ps[i:i+w][cs[i:i+w]>5]
        if len(l)>2 and len(r)>2: dif[i]=np.linalg.norm(l.mean(0)-r.mean(0))
    cuts=[]
    for i in np.argsort(-dif):
        if dif[i]<7: break
        if all(abs(i-c)>=10 for c in cuts) and 8<i<nb-8: cuts.append(i)
    edges=[t0-1]+[t0+c for c in sorted(cuts)]+[t1+1]
    tg=np.array([-g[1],g[0]])
    for a0,a1 in zip(edges[:-1],edges[1:]):
        bnd=Polygon([tuple(g*a0-tg*3000),tuple(g*a1-tg*3000),tuple(g*a1+tg*3000),tuple(g*a0+tg*3000)])
        sp=P.intersection(bnd)
        if sp.is_empty or sp.area<80: continue
        mm=(t>=a0)&(t<a1)&sel
        if mm.sum()<30: continue
        c=np.median(im[ys[mm],xs[mm]],0); ch=float(coh[ys[mm],xs[mm]].mean())
        kind='sor' if ch>0.42 else 'sima'
        mezo.append({'p':polys(sp),'c':boost(c),'k':kind,'d':round(math.degrees(th)+90,1)})
print('mezők',len(mezo))
# ---- fák a fakoronák helyén (8 m-es, rácson szórva) ----
rng=np.random.default_rng(7); fak=[]
zone_m=geom_mask(ZONE.buffer(-2))
hedge_ok=geom_mask(unary_union([band(BN,-60,-47),band(BN,117,140),band(BW,-170,-143)]))
for z in range(AZ0+3,AZ1-3,7):
    for x in range(AX0+3,AX1-3,7):
        xx=x+rng.uniform(-2.5,2.5); zz=z+rng.uniform(-2.5,2.5); r_,c_=int(zz-MZ),int(xx-MX)
        if not tree[r_,c_] or lake[r_,c_] or village[r_,c_] and rng.random()<0.6: continue
        if zone_m[r_,c_] and not hedge_ok[r_,c_]: continue
        dens=ndi.uniform_filter(tree.astype(float),15)[r_,c_] if False else 1
        fak.append([round(xx,1),round(zz,1),round(float(rng.uniform(7,13)),1)])
print('fák',len(fak))
# ---- sziget a tóban (a világos foltból) ----
br=(L_>150)&lake; lb,nn=ndi.label(br); sz=None
if nn:
    k=np.argmax(np.bincount(lb.ravel())[1:])+1; P=poly_of(lb==k); sz=polys(P.buffer(1))[0]
    print('sziget', P.centroid, P.area)
water=lakeP.buffer(-9)
data={'AREA':[AX0,AX1,AZ0,AZ1],'MAI':mai,'UJ':uj,'MEZO':mezo,'FAK':fak,'SZIGET':sz,'VIZ':polys(water)[0],'ZONA':polys(ZONE)[0]}
open('/home/claude/geotechnika-bemutato/_src/ar/data/tihany_gen.js','w').write('// GENERÁLT FÁJL (gen.py): a Belső-tó környékének mezői, fái és a birtokrendezés csíkjai\n// a műholdkép (Esri World Imagery) és az OpenStreetMap alapján. Koordináták: lásd tihany_data.js.\nexport const G = '+json.dumps(data,separators=(',',':'))+';\n')
pickle.dump(data,open('gen.pkl','wb'))
# előnézet
vis=Image.new('RGB',(AX1-AX0,AZ1-AZ0),(150,170,110)); d=ImageDraw.Draw(vis)
T=lambda p:(p[0]-AX0,p[1]-AZ0)
for m in mezo:
    for q in m['p']: d.polygon([T(p) for p in q],fill=m['c'],outline=(90,90,60))
for m in mai:
    for q in m['p']: d.polygon([T(p) for p in q],fill=m['c'],outline=(255,255,255))
d.polygon([T(p) for p in D['NADAS']],fill=(120,130,80)); d.polygon([T(p) for p in data['VIZ']],fill=(80,140,110))
if sz: d.polygon([T(p) for p in sz],fill=(220,215,200))
for x,z,h in fak: d.ellipse([x-AX0-3,z-AZ0-3,x-AX0+3,z-AZ0+3],fill=(50,90,45))
for l in D['UTAK']: d.line([T(p) for p in l],fill=(200,185,150),width=3)
for l in D['UTCAK']: d.line([T(p) for p in l],fill=(160,160,160),width=5)
vis.save('prev.png')

# ---- színek kvantálása, sorok, házak ----
from scipy.cluster.vq import kmeans2
def h2r(h): return np.array([int(h[i:i+2],16) for i in (1,3,5)],float)
cols=np.array([h2r(m['c']) for m in mezo if m['k']!='erdo'])
cent,labl=kmeans2(cols,14,seed=3,minit='++')
j=0
for m in mezo:
    if m['k']=='erdo': continue
    c=cent[labl[j]]; j+=1; m['c']='#%02x%02x%02x'%tuple(int(v) for v in c.clip(0,255))
def rows_in(polyl, ang_vec, sp=5.0, inset=1.6):
    P=unary_union([Polygon(q) for q in polyl]).buffer(-inset)
    if P.is_empty: return []
    a=np.array(ang_vec,float); a/=np.linalg.norm(a); nrm=np.array([a[1],-a[0]])
    c=np.array(P.centroid.coords[0]); R=600; segs=[]
    for k in np.arange(-R,R,sp):
        o=c+nrm*k; ln=LineString([tuple(o-a*R),tuple(o+a*R)]); x=P.intersection(ln)
        for g in (x.geoms if hasattr(x,'geoms') else [x]):
            if g.geom_type=='LineString' and g.length>4:
                (x0,z0),(x1,z1)=g.coords[0],g.coords[-1]; segs.append([round(x0,1),round(z0,1),round(x1,1),round(z1,1)])
    return segs
def bluish(h): c=h2r(h); return c[2]>c[0]-6
ROWS={'szolo':[],'lev':[],'mas':[]}
for m in mezo:
    if m['k']!='sor': continue
    t=math.radians(m['d']); key='lev' if bluish(m['c']) else 'szolo'
    ROWS[key]+=rows_in(m['p'],[math.cos(t),math.sin(t)])
MROWS={'szolo':[],'lev':[]}; UROWS={'szolo':[],'lev':[]}
for m in mai:
    if m['k'] in ('szolo','lev'): MROWS[m['k']]+=rows_in(m['p'],A,4.5)
for m in uj:
    if m['k'] in ('szolo','lev'): UROWS[m['k']]+=rows_in(m['p'],A,4.5)
print('sorok', {k:len(v) for k,v in ROWS.items()}, {k:len(v) for k,v in MROWS.items()}, {k:len(v) for k,v in UROWS.items()})
# házak: a legközelebbi utca irányához igazítva
segs=[]
for l in D['UTCAK']+D['UTAK']:
    for p,q in zip(l[:-1],l[1:]): segs.append((np.array(p,float),np.array(q,float)))
def near_ang(x,z):
    best=(1e9,0)
    for p,q in segs:
        d=q-p; L=np.dot(d,d)
        t=0 if L==0 else max(0,min(1,np.dot(np.array([x,z])-p,d)/L)); e=np.linalg.norm(p+t*d-np.array([x,z]))
        if e<best[0]: best=(e,math.atan2(d[1],d[0]))
    return best
HAZ=[]
for x,z in D['EPULET']:
    if not (AX0+8<x<AX1-8 and AZ0+8<z<AZ1-8): continue
    e,a=near_ang(x,z); HAZ.append([x,z,round(-a,3)])
print('házak',len(HAZ))
kul=kulsoP.intersection(AREA)
for m in mai+uj: m['pi']=polys(unary_union([Polygon(q) for q in m['p']]).buffer(-2.0))
def clip_lines(ls):
    out=[]; Bx=AREA.buffer(-2)
    for l in ls:
        g=LineString(l).intersection(Bx)
        for q in (g.geoms if hasattr(g,'geoms') else [g]):
            if q.geom_type=='LineString' and q.length>3: out.append([[round(x,1),round(z,1)] for x,z in q.coords])
    return out
def polys_h(g):
    out=[]
    for q in (g.geoms if hasattr(g,'geoms') else [g]):
        if q.geom_type=='Polygon' and q.area>40:
            q=q.simplify(0.8); out.append([[[round(x,1),round(z,1)] for x,z in list(q.exterior.coords)[:-1]],[[[round(x,1),round(z,1)] for x,z in list(h.coords)[:-1]] for h in q.interiors]])
    return out
data.update({'UTAK':clip_lines(D['UTAK']),'UTCAK':clip_lines(D['UTCAK']),'NADASH':polys_h(reedP.difference(lakeP.buffer(-9)).intersection(AREA)),'ROWS':ROWS,'MROWS':MROWS,'UROWS':UROWS,'HAZ':HAZ,'KULSO':polys(kul),'MEZO':mezo,'NADAS':polys(reedP.difference(lakeP.buffer(-9)).intersection(AREA)),'FALU':polys(villageP.intersection(AREA))})
open('/home/claude/geotechnika-bemutato/_src/ar/data/tihany_gen.js','w').write('// GENERÁLT FÁJL (gen.py): a Belső-tó környékének mezői, fái és a birtokrendezés csíkjai\n// a műholdkép (Esri World Imagery) és az OpenStreetMap alapján. Koordináták: lásd tihany_data.js.\nexport const G = '+json.dumps(data,separators=(',',':'))+';\n')
import os; print(os.path.getsize('/home/claude/geotechnika-bemutato/_src/ar/data/tihany_gen.js'))
