"""Release integrity checks, including privacy boundaries and reconstruction geometry."""
import contextlib
import csv
import io
import json
import math
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from skyinprint import export_public as export

class PublicReleaseTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.out = Path(cls.temp.name)
        with patch.object(export, 'OUT', cls.out), contextlib.redirect_stdout(io.StringIO()):
            export.main()
        cls.falls = json.loads((cls.out/'fall_reports.json').read_text())
        cls.events = json.loads((cls.out/'fireball_events.json').read_text())

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def test_selection_and_csv_parity(self):
        raw = json.loads((export.ROOT/'results/fireballs/events.json').read_text())
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
        self.assertTrue(all(s in export.STATUSES for s in statuses.values()))
        for e in self.events:
            for q in e['quotes']:
                self.assertLessEqual(len(q['quote'].split()),39)
                self.assertTrue(q['url'].startswith('https://www.loc.gov/resource/'))

    def test_private_material_excluded(self):
        texts='\n'.join(p.read_text() for p in self.out.rglob('*') if p.is_file()).lower()
        for private in ['anatole brown','vishi garig','jason robilio','drafts/emails','outreach_log','@gmail.com']:
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

    def test_export_deterministic_and_missing_coverage_supported(self):
        before=(self.out/'catalog.js').read_bytes()
        with patch.object(export,'OUT',self.out), contextlib.redirect_stdout(io.StringIO()):
            export.main()
        self.assertEqual(before,(self.out/'catalog.js').read_bytes())
        actual_glob=Path.glob
        def no_sweep(path, pattern):
            if path == export.ROOT/'data/sweep': return iter([])
            return actual_glob(path,pattern)
        with patch.object(export,'OUT',self.out),patch.object(Path,'glob',no_sweep),contextlib.redirect_stdout(io.StringIO()):
            export.main()
        self.assertEqual(json.loads((self.out/'coverage.json').read_text()),[])

    def test_scan_retains_issue_edition(self):
        self.assertEqual(export.scan('faro_1880/1880-01-01_p2_sn12345678_reel_1880010102_0001.json#4'),'https://www.loc.gov/resource/sn12345678/1880-01-01/ed-2/?sp=2')

if __name__=='__main__':unittest.main()
