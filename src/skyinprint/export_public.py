"""Export an allowlisted, static public release. Run: python -m skyinprint.export_public.

Never crawl drafts, correspondence, attachments or outreach logs. The curated
public brief is the authority for fall statuses, not older grading outputs.
"""
import csv
import hashlib
import json
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'site' / 'data'
STATUSES = {
 'recognized': 'Matches a meteorite in the Meteoritical Bulletin.',
 'not a meteorite': 'Identified as a terrestrial object by a contemporary or modern examination.',
 'hoax': 'Retracted or documented as invented.',
 'likely hoax': 'Has the hoax pattern, but no retraction has been found.',
 'unresolved': 'Credible report; no outcome found.',
 'under investigation': 'An institution is currently checking records or objects.',
}

def scan(key):
    m = re.search(r'(\d{4}-\d\d-\d\d)_p(\d+|None)_(sn\d+)', key)
    if not m:
        return ''
    date, page, lccn = m.groups()
    issue = re.search(r'_' + date.replace('-', '') + r'(\d{2})_', key)
    edition = int(issue[1]) if issue else 1
    return f'https://www.loc.gov/resource/{lccn}/{date}/ed-{edition}/' + (f'?sp={page}' if page != 'None' else '')

def source(label, url):
    return {'label': label, 'url': url}

def loc(lccn, date, page):
    return f'https://www.loc.gov/resource/{lccn}/{date}/ed-1/?sp={page}'

def curated_falls(events):
    rows = [
      ('saco','Saco, Maine','1870-10','under investigation',43.50,-70.44,
       'A newspaper donation notice leads to two museum accession records. The stones have not yet been located or examined; neither is confirmed as a meteorite.',
       [('Daily Kennebec Journal, Nov. 20, 1873, p. 3',loc('sn82014248','1873-11-20',3)),('Saco Museum: dated project update','evidence/public_updates.md')], 'presented to the York Institute a meteoric stone'),
      ('middleburg','Middleburg, Florida','1888-01','not a meteorite',30.07,-81.86,
       'A stone sent to the Sub-Tropical Exposition was identified by G. F. Kunz as limonite. The report date is January 1888; accounts place the find in late 1887.',
       [('Palatka Daily News, Jan. 7, 1888, p. 4',loc('sn89070049','1888-01-07',4)),('Kunz, Transactions of the N.Y. Academy of Sciences 7:135 (1888)','https://archive.org/details/transactionsofne78788newy/page/135/mode/1up')], 'only a mass of limonite'),
      ('schroon','Schroon Lake, New York','1880-09','hoax',43.84,-73.76,
       'A reported red-hot stone was later described as quartz covered with kerosene oil and sulphur.',
       [('Daily Dispatch, Sept. 28, 1880, p. 2',loc('sn84024738','1880-09-28',2)),('Perrysburg Journal, Nov. 26, 1880, p. 3',loc('sn87076843','1880-11-26',3))], 'merely a piece of quartz covered with kerosene oil and sulphur'),
      ('northport','Northport, Maine','1850','not a meteorite',44.34,-68.96,
       'Fragments collected in 1881–84 were identified as copper slag by F. C. Robinson. The reported 1850 fireball does not establish that the fragments came from it.',
       [('F. C. Robinson, On the so-called Northport, Maine, meteorite, American Journal of Science, series 3, 35:212 (1888)','https://doi.org/10.2475/ajs.s3-35.207.212')], ''),
      ('thomson','Thomson, Georgia','1888-10-15','recognized',33.47,-82.50,
       'A recognized meteorite: contemporary evidence describes an observed fall, although the frozen catalogue lists a find. This is a possible record correction, not a new meteorite.',
       [('Savannah Morning News, Nov. 7, 1888', 'https://www.loc.gov/resource/sn86063034/1888-11-07/ed-1/'),('G. P. Merrill, Smithsonian Miscellaneous Collections 52:473 (1910)','https://archive.org/details/smithsonianmisce521910smit/page/473/mode/1up')], ''),
      ('newton','Newtown, Indiana','1879-01','hoax',40.20,-87.15,
       'The widely reprinted story of a farmer killed in bed by a meteorite was a documented hoax.',
       [('Plymouth Democrat, Jan. 23, 1879, p. 1',loc('sn87056243','1879-01-23',1)),('Vatican Observatory: newspaper retraction history','https://www.vaticanobservatory.org/sacred-space-astronomy/1879-hoosiers-and-humility-death-and-deception/')], ''),
      ('st-joseph','St. Joseph, Indiana','1887-06-12','likely hoax',38.06,-87.65,
       'The alleged two-ton aerolite spread through many papers. No stone, analysis or retraction has been found. Likely hoax remains distinct from proven hoax.',
       [('Kimball Graphic, June 24, 1887, p. 1',loc('sn99068076','1887-06-24',1))], ''),
      ('amsterdam','Amsterdam, New York','1887-11','hoax',42.94,-74.19,
       'A reported three-ton aerolite was later explained as a stone that fell from a wagon.',
       [('Caldwell Tribune, Jan. 28, 1888, p. 3',loc('sn86091092','1888-01-28',3))], ''),
      ('jonesboro','Jonesboro, Illinois','1914','under investigation',37.45,-89.27,
       'A library gift notice says A. V. Cook saw the stone fall and donated it. An inquiry is pending; no specimen identification is confirmed.',
       [('Cairo Bulletin, Dec. 11, 1914, p. 2',loc('sn93055779','1914-12-11',2))], 'Mr. Cook saw this meteorite fall.'),
      ('laclede','Laclede Station, Missouri','1872','under investigation',38.59,-90.35,
       'A metal object dug from the ground was reportedly intended for the Mercantile Library. An intended gift does not establish that the library received it.',
       [('Daily State Journal, Aug. 10, 1872, p. 3',loc('sn84024670','1872-08-10',3))], ''),
    ]
    with (ROOT/'reference/metbull/Meteorite_Landings.csv').open() as handle:
        catalogue = {r['name']:r for r in csv.DictReader(handle)}
    for slug,name,date in [('estherville','Estherville','1879-05-10'),('homestead','Homestead','1875-02-12'),('rochester','Rochester','1876-12-21')]:
        c = catalogue[name]
        matches = [e for e in events if e['date_lo'] == date]
        links = [(q['paper'] or 'Contemporary newspaper',scan(q['key'])) for e in matches for q in e.get('quotes',[]) if scan(q.get('key',''))][:2]
        links.append(('Meteoritical Bulletin entry',f'https://www.lpi.usra.edu/meteor/metbull.php?code={c["id"]}'))
        rows.append((slug, name+{'Estherville':', Iowa','Homestead':', Iowa','Rochester':', Indiana'}[name],date,'recognized',float(c['reclat']),float(c['reclong']), 'A recognized meteorite fall recovered by the pilot newspaper search.',links,''))
    result=[]
    for slug,place,date,status,lat,lon,summary,sources,quote in rows:
        result.append(dict(id=slug,kind='fall',place=place,date_lo=date,date_hi=date,year=int(date[:4]),status=status,lat=lat,lon=lon,location_basis='Approximate reported locality; not an exact recovery site.',summary=summary,sources=[source(*s) for s in sources],quote=quote,story=slug if slug in ['saco','middleburg','schroon'] else None))
    return result

def make_track():
    # Same least-squares great circle as the research code, not a straight map line.
    from .track import EVENTS, fit, vec
    import numpy as np
    raw=EVENTS['1876-12-21']; n=fit([(a,b) for a,b,_ in raw['overhead'].values()])
    center=np.mean([vec(a,b) for a,b,_ in raw['overhead'].values()],axis=0)
    center-=np.dot(center,n)*n;center/=np.linalg.norm(center)
    direction=np.cross(n,center)
    if direction[1] < 0: direction=-direction
    coordinates=[]
    for angle in np.linspace(-.13,.12,100):
        p=center*math.cos(angle)+direction*math.sin(angle)
        coordinates.append([math.degrees(math.atan2(p[1],p[0])),math.degrees(math.asin(p[2]))])
    if coordinates[0][0]>coordinates[-1][0]: coordinates.reverse()
    witnesses=[dict(place=k,lat=v[0],lon=v[1],source=v[2]) for k,v in raw['overhead'].items()]
    return dict(**json.loads((ROOT/'results/fireballs/tracks.json').read_text())['1876-12-21'],coordinates=coordinates,witnesses=witnesses,rochester={'lat':41.08,'lon':-86.21})

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    raw=json.loads((ROOT/'results/fireballs/events.json').read_text())
    with (ROOT/'reference/newspapers/lccn_places.csv').open() as handle:
        places={r['lccn']:r for r in csv.DictReader(handle)}
    events=[]
    for e in raw:
        if e.get('independent_cities',0)<2 and not e.get('vetted'):continue
        quotes=[]
        for q in e.get('quotes',[]):
            url=scan(q.get('key',''))
            if not url:continue
            words=q.get('quote','').split()
            quotes.append(dict(quote=' '.join(words[:38])+(' …' if len(words)>38 else ''),url=url,label=q.get('paper') or 'Newspaper page',date=q.get('date'),where=q.get('where','')))
        keys=[k for family in e.get('family_keys',[]) for k in family]
        points=[]
        for key in keys:
            m=re.search(r'_(sn\d+)_',key);p=places.get(m[1]) if m else None
            if p and p.get('lat') and p.get('lon'):
                a,b=float(p['lat']),float(p['lon'])
                if 24<=a<=50 and -125<=b<=-66:points.append((a,b,p['city'],p['state']))
        if points:
            # Medoid is an actual publishing town, never an invented midpoint observation.
            lat,lon,city,state=min(points,key=lambda p:sum((p[0]-q[0])**2+(p[1]-q[1])**2 for q in points))
            place=', '.join(x for x in [city.title(),state] if x)
        else:lat=lon=None;place='Location not resolved'
        ident='fireball-'+hashlib.sha256(json.dumps([e['date_lo'],e['date_hi'],sorted(keys)],sort_keys=True).encode()).hexdigest()[:12]
        events.append(dict(id=ident,kind='fireball',place=place,date_lo=e['date_lo'],date_hi=e['date_hi'],year=int(e['date_lo'][:4]),lat=lat,lon=lon,location_basis='Representative newspaper publishing town, not a meteor position or confirmed witness location.',status='human reviewed' if e.get('vetted') else 'candidate grouping',summary=f"{e['reports']} reports in {e['papers']} newspapers. Grouped publishing-city count: {e.get('independent_cities',0)}. Multiple papers can repeat the same witness.",reports=e['reports'],papers=e['papers'],independent_cities=e.get('independent_cities',0),dated=e.get('dated',False),vetted=e.get('vetted',False),quotes=quotes,sources=[source(q['label'],q['url']) for q in quotes],cities=e.get('cities',[])))
    falls=curated_falls(raw)
    coverage=[]
    for path in sorted((ROOT/'data/sweep').glob('*/stats.json')):
        s=json.loads(path.read_text());coverage.append({k:s.get(k) for k in ['year','newspapers','articles']})
    bundle=dict(falls=falls,events=events,coverage=coverage,track=make_track(),statuses=STATUSES,release='Pilot + curated follow-up, 22 October 2026',notes='Missing coverage years are unknown, not zero. Fireball selection: independent_cities >= 2 or vetted. Publishing-city counts are not verified witness independence.')
    for name,data in [('fall_reports',falls),('fireball_events',events),('coverage',coverage),('track',bundle['track'])]:
        (OUT/f'{name}.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
        if name in ['fall_reports','fireball_events']:
            fields=list(data[0])
            with (OUT/f'{name}.csv').open('w',newline='') as f:
                writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader()
                for row in data:writer.writerow({k:json.dumps(v,ensure_ascii=False) if isinstance(v,(list,dict)) else v for k,v in row.items()})
    # Classic script intentionally supports opening index.html via file:// without fetch/CORS.
    (OUT/'catalog.js').write_text('window.SKY_DATA='+json.dumps(bundle,ensure_ascii=False).replace('<','\\u003c')+';\n')
    (OUT/'README.md').write_text('''# Sky In Print · public pilot release

Regenerate from the project root: `python -m skyinprint.export_public` (install the project first with `pip install -e .`). No sweep is required; missing local sweep statistics produce an empty coverage series. The fireball input remains the curated pilot events.json; running a sweep does not automatically re-cluster or vet new events. Refresh that upstream file deliberately before exporting a larger event release.

## Files and columns
- fall_reports.csv / .json: curated public-brief cases.
- fireball_events.csv / .json: pilot groups with independent_cities >= 2 or vetted.
- coverage.json: year, newspapers (digitized titles in the available sweep statistics), articles (processed corpus articles). Absent years are unknown, never zero.
- track.json: fitted great-circle coordinates [longitude, latitude], seven overhead witnesses, Rochester holdout coordinates, azimuth_deg (degrees clockwise from north), fit_rms_km, fit_residuals_km, checks_km_north_of_track, and the failed single-observer height estimate.
- catalog.js: browser bundle of the same records for serverless file opening.
- geography.js: US Atlas 3.0.1 state boundaries for the local map.

Shared fields: id (stable record identifier); kind (fall or fireball); place (display locality); date_lo/date_hi (ISO date or partial year/month, with original precision retained); year (filter year from date_lo); lat/lon (decimal degrees, nullable); location_basis (coordinate meaning); status (see below); summary (curated description); sources (JSON array of label and URL).
Fall-only: quote (short historical excerpt), story (article anchor or null).
Fireball-only: reports (articles), papers (newspaper titles), independent_cities (upstream grouped publishing-city proxy, NOT verified independent witnesses), dated (upstream date-resolution flag), vetted (upstream human-review flag), quotes (JSON array of short uncorrected OCR excerpts, URL, label, publication date and reported place), cities (upstream city labels).
CSV nested values are JSON. Blank coordinates mean unresolved, not 0,0. Fall coordinates are approximate localities, not exact recovery sites. A fireball marker is one representative publishing town, selected as the medoid of resolved newspaper coordinates, NOT an observation, trajectory, or impact location. Events without coordinates remain in the list/download. Selection by independent_cities does not establish true witness independence. Fireball dates may span a window; filtering uses interval overlap. Some grouped records contain other sky phenomena; this remains a pilot candidate catalogue.

## Status definitions
'''+''.join(f'- **{k}:** {v}\n' for k,v in STATUSES.items())+'''
Fireball review labels are separate: human reviewed or candidate grouping. They are not fall outcomes.

## Coverage and limits
More dots in a year can reflect more digitized newspapers, changing selection, or reprints, not more meteors. This release cannot measure meteor frequency. A fall case and a fireball group may refer to the same event; record totals are not unique event totals. The 1770–1964 axis is a research scope, not a claim of continuous coverage. No new meteorite is confirmed. Saco accession information is attributed to the institution in the public brief; correspondence, staff identities, attachments and outreach logs are excluded. The statements about current investigation are a dated snapshot, not live updates.

## Sources and credit
Newspapers: Library of Congress / Chronicling America through American Stories (Dell et al., 2023), CC BY 4.0. Derived data: CC BY 4.0. Reference meteorites: NASA frozen Meteorite Landings snapshot / Meteoritical Bulletin. Geography: US Atlas 3.0.1 (ISC), derived from US Census Bureau cartography. D3 7.9.0 and topojson-client 3.1.0 (ISC) are vendored in assets; their license notices are included there. The source project documents are included only through an explicit public evidence allowlist.
''')
    evidence=OUT/'evidence';evidence.mkdir(exist_ok=True)
    (evidence/'public_updates.md').write_text((ROOT/'docs/PUBLIC_UPDATES.md').read_text())
    for rel in ['results/fireballs/tracks.md','results/PILOT_REPORT.md','results/validation/known_falls_1870s.md','results/falls/ranker_blind_check.md','results/falls/credibility_test.md','results/falls/literature_check_2026-10-22.md','results/eyecheck/RESULTS.md']:
        (evidence/Path(rel).name).write_text((ROOT/rel).read_text())
    print(f'Exported {len(falls)} fall cases, {len(events)} fireball groups, {len(coverage)} coverage years.')

if __name__=='__main__':main()
