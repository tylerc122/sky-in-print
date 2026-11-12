"""Release integrity checks, including privacy boundaries and reconstruction geometry."""
import csv
import json
import math
from pathlib import Path
import unittest
ROOT = Path(__file__).resolve().parents[1]

class PublicReleaseTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.out = ROOT / 'site/data'
        cls.falls = json.loads((cls.out/'fall_reports.json').read_text())
        cls.events = json.loads((cls.out/'fireball_events.json').read_text())
        text = (cls.out/'catalog.js').read_text()
        cls.catalog = json.loads(text[text.index('{'):text.rindex('}')+1])

    def test_selection_and_csv_parity(self):
        src = ROOT/'results/fireballs/events_all.json'
        raw = json.loads((src if src.exists() else ROOT/'results/fireballs/events.json').read_text())
        self.assertEqual(len(self.events), sum(e.get('independent_cities',0)>=2 or bool(e.get('vetted')) for e in raw))
        self.assertEqual(len(self.falls),13)
        for name, rows in [('fall_reports',self.falls),('fireball_events',self.events)]:
            with (self.out/f'{name}.csv').open() as f:
                csv_rows=list(csv.DictReader(f))
            self.assertEqual([r['id'] for r in csv_rows],[r['id'] for r in rows])
            self.assertEqual(len(set(r['id'] for r in rows)),len(rows))
            for r,c in zip(rows,csv_rows):
                self.assertEqual(json.loads(c['sources']),r['sources'])
                self.assertTrue(r['sources'])
                if r['lat'] is not None:
                    self.assertTrue(24 <= r['lat'] <= 50)
                    self.assertTrue(-125 <= r['lon'] <= -66)

    def test_statuses_and_quote_limits(self):
        statuses={r['id']:r['status'] for r in self.falls}
        self.assertEqual(statuses['saco'],'under investigation')
        self.assertEqual(statuses['middleburg'],'not a meteorite')
        self.assertEqual(statuses['st-joseph'],'likely hoax')
        self.assertEqual(statuses['schroon'],'hoax')
        self.assertTrue(all(s in self.catalog['statuses'] for s in statuses.values()))
        for e in self.events:
            for q in e['quotes']:
                self.assertLessEqual(len(q['quote'].split()),39)
                self.assertTrue(q['url'].startswith('https://www.loc.gov/resource/'))

    def test_private_material_excluded(self):
        texts='\n'.join(p.read_text() for p in self.out.rglob('*') if p.is_file()).lower()
        for private in ['drafts/emails','@gmail.com','-----begin private key-----']:
            self.assertNotIn(private,texts)
        evidence=set(p.name for p in (self.out/'evidence').iterdir())
        self.assertNotIn('saco_trail.md',evidence)
        self.assertNotIn('middleburg_trail.md',evidence)
        for row in self.falls+self.events:
            for source in row['sources']:
                url=source['url']
                self.assertTrue(url.startswith(('https://','evidence/')))
                if url.startswith('evidence/'):
                    self.assertTrue((self.out/url).is_file())

    def test_track_is_fitted_great_circle(self):
        import numpy as np
        from skyinprint.track import fit, vec, offset_km
        t=json.loads((self.out/'track.json').read_text())
        self.assertEqual(len(t['witnesses']),7)
        n=fit([(w['lat'],w['lon']) for w in t['witnesses']])
        for lon,lat in t['coordinates']:
            self.assertLess(abs(float(vec(lat,lon)@n)),1e-10)
        self.assertLess(t['coordinates'][0][0],t['coordinates'][-1][0])
        self.assertAlmostEqual(abs(offset_km(n,t['rochester']['lat'],t['rochester']['lon'])),17,delta=.6)
        rms=math.sqrt(np.mean([offset_km(n,w['lat'],w['lon'])**2 for w in t['witnesses']]))
        self.assertAlmostEqual(rms,t['fit_rms_km'],delta=.6)

    def test_catalog_matches_downloads(self):
        arrays = [v for v in self.catalog.values() if isinstance(v, list)]
        self.assertIn(self.falls, arrays)
        self.assertIn(self.events, arrays)

    def test_local_page_links(self):
        import re
        from urllib.parse import urlsplit
        site = ROOT / 'site'
        for page in site.glob('*.html'):
            for url in re.findall(r'(?:href|src)="([^"<>]+)"', page.read_text()):
                parsed = urlsplit(url)
                if parsed.scheme or parsed.netloc: continue
                path = parsed.path
                if not path.startswith('/') or path.startswith('//'):
                    continue
                target = site / path.lstrip('/')
                if path == '/': target = site / 'index.html'
                elif path.startswith('/cases/'): target = site / 'case.html'
                elif not target.suffix: target = target.with_suffix('.html')
                self.assertTrue(target.is_file(), f'{page.name}: {url}')

if __name__=='__main__':unittest.main()
