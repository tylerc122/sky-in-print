// Thomson, Georgia. Monday, October 15, 1888, about 1 p.m.
// Painted in the house persona: an invented regional painter of the 1890s who
// gives the sky two thirds of the canvas, works in short dry strokes over a
// chalky ground, keeps to lead white, ochre, umber, cobalt, viridian and a
// little madder, and only paints what the sources say was there.
//
// From the record: midday, cotton harvest, Wilson picking cotton, the stone
// lands about thirty yards off and buries itself a few inches. Nobody reported
// a light, only the whizzing and the thunder, so there's no fireball.
window.SCENE_THOMSON = (() => {
  const HY = 0.6; // horizon
  const VP = [0.44, HY]; // where the cotton rows meet
  const ROWS = 30;
  const depth = (y) => Math.max(0, Math.min(1, (y - HY) / (1 - HY)));
  const towardVP = (x, y) => Math.atan2(VP[1] - y, VP[0] - x);

  // a point along cotton row k, t=0 at the vanishing point, t=1 at the bottom edge
  const rowPoint = (k, t) => {
    const bx = -0.9 + (k / (ROWS - 1)) * 2.7 + Math.sin(k * 2.3) * 0.012;
    return [VP[0] + (bx - VP[0]) * t, HY + (1 - HY) * t];
  };

  // capsule sampler for small shapes (house, figure), radius in canvas widths
  const inCapsule = (kit, c) => {
    const t = kit.r();
    const ang = kit.r() * Math.PI * 2;
    const rad = Math.sqrt(kit.r()) * c.rad;
    const x = c.p0[0] + (c.p1[0] - c.p0[0]) * t + Math.cos(ang) * rad;
    const y = c.p0[1] + (c.p1[1] - c.p0[1]) * t + Math.sin(ang) * rad * kit.aspect;
    return [x, y];
  };

  // drawn small, then scaled up around his feet
  const FA = [0.3, 0.8];
  const FS = 1.75;
  const fpt = ([x, y]) => [FA[0] + (x - FA[0]) * FS, FA[1] + (y - FA[1]) * FS];
  const FIGURE_RAW = [
    { p0: [0.286, 0.772], p1: [0.287, 0.808], rad: 0.0042, c: [218, 16, 24] }, // legs
    { p0: [0.297, 0.772], p1: [0.302, 0.806], rad: 0.0042, c: [218, 16, 22] },
    { p0: [0.289, 0.772], p1: [0.31, 0.748], rad: 0.0062, c: [206, 22, 52] }, // bent back, faded shirt
    { p0: [0.309, 0.752], p1: [0.317, 0.782], rad: 0.0024, c: [206, 18, 46] }, // arm down to the plant
    { p0: [0.316, 0.742], p1: [0.317, 0.744], rad: 0.0036, c: [24, 32, 36] }, // head
    { p0: [0.31, 0.737], p1: [0.323, 0.739], rad: 0.0048, c: [44, 42, 76] }, // straw hat
    { p0: [0.284, 0.778], p1: [0.248, 0.806], rad: 0.0058, c: [40, 14, 86] }, // cotton sack
  ];
  const FIGURE = FIGURE_RAW.map((c) => ({ ...c, p0: fpt(c.p0), p1: fpt(c.p1), rad: c.rad * FS }));

  return {
    aspect: 2.1,
    ground: [42, 22, 87],
    setup(kit) {
      return {
        tree: kit.noise(36),
        treeFine: kit.noise(140),
        clouds: [
          { cx: 0.2, base: 0.3, w: 0.2, h: 0.2 },
          { cx: 0.64, base: 0.24, w: 0.26, h: 0.2 },
          { cx: 0.93, base: 0.4, w: 0.1, h: 0.1 },
          { cx: 0.42, base: 0.47, w: 0.14, h: 0.06 },
          { cx: 0.08, base: 0.5, w: 0.08, h: 0.04 },
        ].map((c) => {
          // a row of round lobes, tallest in the middle, sitting on a flat base
          const n = 5 + Math.floor(kit.r() * 4);
          const lobes = [];
          for (let i = 0; i < n; i++) {
            const u = n === 1 ? 0 : i / (n - 1) - 0.5;
            const rad = (c.w / n) * (1.1 + kit.r() * 0.7) * (1 - Math.abs(u) * 0.8);
            const lift = c.h * (1 - Math.abs(u) * 1.6) * (0.55 + kit.r() * 0.5);
            lobes.push({ x: c.cx + u * c.w * 1.6 + (kit.r() - 0.5) * 0.01, y: c.base - Math.max(rad * kit.aspect * 0.6, lift), rad });
          }
          return { ...c, lobes };
        }),
        pines: Array.from({ length: 46 }, () => ({ x: kit.r(), h: 0.008 + Math.pow(kit.r(), 1.6) * 0.045, w: 0.007 + kit.r() * 0.007 })),
      };
    },
    passes: [
      {
        // the sky: deep cobalt at the top, pale and a touch warm at the horizon
        n: 1500,
        at: (k) => [k.r() * 1.04 - 0.02, k.r() * 0.64],
        color: (x, y, k) => {
          const t = y / HY;
          return [214 - t * 16 + k.gauss() * 3, 44 - t * 20, 58 + t * 25 + k.gauss() * 2];
        },
        angle: (x, y, k) => -0.06 + (k.r() - 0.5) * 0.3,
        len: 0.075,
        width: 0.024,
        alpha: 0.82,
      },
      {
        n: 1100,
        at: (k) => [k.r(), k.r() * 0.62],
        color: (x, y, k) => {
          const t = y / HY;
          return k.r() < 0.18 ? [46, 30, 88] : [206 - t * 10, 34 - t * 12, 66 + t * 20 + k.gauss() * 4];
        },
        angle: (x, y, k) => -0.1 + (k.r() - 0.5) * 0.5,
        len: 0.04,
        width: 0.012,
        alpha: 0.7,
      },
      {
        // cumulus, lit from above, flat grey-violet bottoms
        n: 2600,
        at: (k, e) => {
          const c = k.pick(e.clouds);
          const l = k.pick(c.lobes);
          const a = k.r() * Math.PI * 2;
          const rr = Math.sqrt(k.r()) * l.rad;
          const x = l.x + Math.cos(a) * rr;
          const y = l.y + Math.sin(a) * rr * k.aspect;
          if (y > c.base + k.r() * 0.008) return null;
          return [x, y];
        },
        color: (x, y, k, e) => {
          let best = e.clouds[0];
          let bd = 9;
          for (const c of e.clouds) {
            const d = Math.abs(x - c.cx) / c.w + Math.max(0, y - c.base) * 20;
            if (d < bd) (bd = d), (best = c);
          }
          // 0 at the top of the cloud, 1 at its base
          const top = Math.min(...best.lobes.map((l) => l.y - l.rad * k.aspect));
          const v = Math.max(0, Math.min(1, (y - top) / (best.base - top)));
          if (v > 0.72) return [228, 12, 66 + (1 - v) * 18 + k.gauss() * 3, 0.85];
          if (v > 0.5) return [40, 14, 86 + k.gauss() * 3, 0.85];
          return [46, 40, 96 - v * 6 + k.gauss() * 2, 0.88];
        },
        angle: (x, y, k) => (k.r() - 0.5) * 1.6,
        len: 0.032,
        width: 0.013,
        bend: 0.5,
      },
      {
        // far hills, blued by distance
        n: 500,
        at: (k, e) => {
          const x = k.r();
          const top = HY - 0.075 + e.tree(x * 0.6 + 0.2) * 0.03;
          return [x, top + k.r() * (HY - top)];
        },
        color: (x, y, k) => [214, 16, 66 + k.gauss() * 3],
        angle: (x, y, k) => (k.r() - 0.5) * 0.3,
        len: 0.03,
        width: 0.01,
        alpha: 0.7,
      },
      {
        // the pine line along the edge of the field
        n: 2600,
        at: (k, e) => {
          const x = k.r();
          const top = HY - 0.06 + e.tree(x) * 0.045 + e.treeFine(x) * 0.02;
          return [x, top + Math.pow(k.r(), 0.8) * (HY + 0.022 - top)];
        },
        color: (x, y, k) => {
          const lit = k.r() < 0.22;
          return lit ? [88 + k.gauss() * 10, 22, 40] : [150 + k.gauss() * 14, 16, 24 + k.r() * 11];
        },
        angle: (x, y, k) => Math.PI / 2 + (k.r() - 0.5) * 0.9,
        len: 0.016,
        width: 0.008,
      },
      {
        // loblolly trunks
        n: 160,
        at: (k, e) => {
          const p = k.pick(e.pines);
          return [p.x + k.gauss() * 0.0008, HY - 0.05 - k.r() * p.h * 0.7];
        },
        color: (x, y, k) => [24, 14, 22],
        angle: () => Math.PI / 2,
        len: 0.012,
        width: 0.0015,
      },
      {
        // and their crowns, clumped up high the way loblollies grow
        n: 1800,
        at: (k, e) => {
          const p = k.pick(e.pines);
          const cy = HY - 0.055 - p.h;
          const a = k.r() * Math.PI * 2;
          const rr = Math.sqrt(k.r());
          return [p.x + Math.cos(a) * rr * p.w * 1.6, cy + Math.sin(a) * rr * p.w * k.aspect * 1.1];
        },
        color: (x, y, k) => (k.r() < 0.25 ? [80 + k.gauss() * 8, 20, 38] : [148 + k.gauss() * 10, 18, 20 + k.r() * 10]),
        angle: (x, y, k) => (k.r() - 0.5) * 1.2,
        len: 0.007,
        width: 0.004,
      },
      {
        // a weathered house far off by the trees
        n: 140,
        at: (k) => {
          const roof = k.r() < 0.4;
          return roof
            ? [0.762 + k.r() * 0.036, 0.553 + k.r() * 0.014]
            : [0.766 + k.r() * 0.028, 0.567 + k.r() * 0.03];
        },
        color: (x, y, k) => (y < 0.567 ? [14, 22, 30 + k.r() * 6] : [34, 10, 62 + k.gauss() * 6]),
        angle: (x, y, k) => (y < 0.567 ? (k.r() - 0.5) * 0.2 : Math.PI / 2 + (k.r() - 0.5) * 0.2),
        len: 0.008,
        width: 0.004,
      },
      {
        // the far end of the field, flattened out by distance
        n: 900,
        at: (k) => [k.r() * 1.04 - 0.02, HY - 0.004 + Math.pow(k.r(), 1.4) * 0.07],
        color: (x, y, k) => k.pick([[30, 26, 62], [40, 22, 72], [24, 30, 54], [55, 14, 60]]),
        angle: (x, y, k) => (k.r() - 0.5) * 0.12,
        len: 0.03,
        width: 0.006,
      },
      {
        // red Georgia clay and dry stalks, laid along the rows
        n: 3000,
        at: (k) => [k.r() * 1.1 - 0.05, HY + Math.pow(k.r(), 0.85) * (1 - HY)],
        color: (x, y, k) => {
          const d = depth(y);
          const base = k.pick([
            [20, 40, 44],
            [28, 32, 52],
            [52, 14, 46],
            [38, 22, 62],
          ]);
          return [base[0], base[1] * (0.6 + d * 0.4), base[2] + (1 - d) * 14];
        },
        angle: (x, y, k) => towardVP(x, y) + (k.r() - 0.5) * 0.2,
        len: (x, y) => 0.012 + depth(y) * 0.075,
        width: (x, y) => 0.004 + depth(y) * 0.02,
      },
      {
        // furrows
        n: 1500,
        at: (k) => rowPoint(Math.floor(k.r() * ROWS), Math.pow(k.r(), 0.7)),
        color: (x, y, k) => [18, 30, 26 + (1 - depth(y)) * 18],
        angle: (x, y, k) => towardVP(x, y),
        len: (x, y) => 0.01 + depth(y) * 0.06,
        width: (x, y) => 0.002 + depth(y) * 0.008,
        alpha: 0.75,
      },
      {
        // cotton plants between the furrows
        n: 2200,
        at: (k) => rowPoint(Math.floor(k.r() * ROWS) + 0.5, Math.pow(k.r(), 0.7)),
        color: (x, y, k) => [46 + k.gauss() * 8, 18, 30 + (1 - depth(y)) * 20],
        angle: (x, y, k) => -Math.PI / 2 + (k.r() - 0.5) * 1.8,
        len: (x, y) => 0.004 + depth(y) * 0.022,
        width: (x, y) => 0.002 + depth(y) * 0.008,
      },
      {
        // open bolls
        n: 2300,
        at: (k) => {
          const [x, y] = rowPoint(Math.floor(k.r() * ROWS) + 0.5 + k.gauss() * 0.28, Math.pow(k.r(), 0.7));
          return [x, y - depth(y) * 0.012 * k.r()];
        },
        color: (x, y, k) => [44, 16, 90 - (1 - depth(y)) * 8 + k.gauss() * 3],
        angle: (x, y, k) => (k.r() - 0.5) * 3,
        len: (x, y) => 0.002 + depth(y) * 0.011,
        width: (x, y) => 0.002 + depth(y) * 0.008,
        alpha: 0.92,
      },
      {
        // B. F. Wilson, bent over the row with his sack behind him
        n: 900,
        at: (k) => {
          const c = k.pick(FIGURE);
          const p = inCapsule(k, c);
          p.push(c);
          return p;
        },
        color: (x, y, k) => {
          let best = FIGURE[0];
          let bd = 9;
          for (const c of FIGURE) {
            const mx = (c.p0[0] + c.p1[0]) / 2;
            const my = (c.p0[1] + c.p1[1]) / 2;
            const d = Math.hypot(x - mx, (y - my) / k.aspect) - c.rad;
            if (d < bd) (bd = d), (best = c);
          }
          return [best.c[0], best.c[1], best.c[2] + k.gauss() * 4, 0.95];
        },
        angle: (x, y, k) => (k.r() - 0.5) * 3,
        len: 0.006,
        width: 0.003,
      },
      {
        // where it went in: a dark scar in the row
        n: 60,
        at: (k) => [0.5 + k.gauss() * 0.008, 0.712 + k.gauss() * 0.004],
        color: (x, y, k) => [16, 32, 20],
        angle: (x, y, k) => (k.r() - 0.5) * 0.4,
        len: 0.007,
        width: 0.003,
      },
      {
        // and the dirt it threw up, the last thing painted
        n: 700,
        at: (k) => {
          const h = Math.pow(k.r(), 0.8);
          return [0.5 + k.gauss() * (0.005 + h * 0.024), 0.71 - h * 0.1];
        },
        color: (x, y, k) => (k.r() < 0.06 ? [16, 30, 30, 0.8] : [28, 22, 66 + k.gauss() * 6, 0.5]),
        angle: (x, y, k) => -Math.PI / 2 + (x - 0.5) * 14 + (k.r() - 0.5) * 0.7,
        len: 0.009,
        width: 0.004,
        bend: 0.4,
      },
    ],
  };
})();
