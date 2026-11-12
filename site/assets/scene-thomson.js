// Thomson, Georgia. Monday, October 15, 1888, about 1 p.m.
// Painted in the house persona: an invented regional painter of the 1890s who
// gives the sky two thirds of the canvas, works in short dry strokes over a
// chalky ground, keeps to lead white, ochre, umber, cobalt, viridian and a
// little madder, and only paints what the sources say was there.
//
// From the record: about 1 p.m. on a Monday (Lincolnton News), Ben Wilson at work
// in a cotton field on the place of Mrs. M. A. Wilson, four miles south of Thomson
// (his letter), which the deed books make his late father's homestead. He heard it
// "whizzing as a minnie ball" and it buried itself three or four inches deep, about
// thirty yards off (Savannah Morning News, and the letter). Nobody reported a light,
// so there's no fireball. The weather, the look of the house and the fence are mine:
// a McDuffie County farm in October the way they generally were.
window.SCENE_THOMSON = (() => {
  const A = 2.1;
  const HY = 0.6; // horizon
  const VP = [0.44, HY]; // where the cotton rows meet
  const ROWS = 30;
  const depth = (y) => Math.max(0, Math.min(1, (y - HY) / (1 - HY)));
  const towardVP = (x, y) => Math.atan2(VP[1] - y, VP[0] - x);
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  // a point along cotton row k, t=0 at the vanishing point, t=1 at the bottom edge
  const rowPoint = (k, t) => {
    const bx = -0.9 + (k / (ROWS - 1)) * 2.7 + Math.sin(k * 2.3) * 0.012;
    return [VP[0] + (bx - VP[0]) * t, HY + (1 - HY) * t];
  };

  // capsules filled with short dabs, each dab coloured by the capsule it came from and
  // lit a little from the upper left, where the sun is
  const parts = (list, { n, len = 0.0022, width = 0.0013, shade = 6, alpha = 0.95 }) => {
    const area = list.map((p) => (Math.hypot(p.p1[0] - p.p0[0], (p.p1[1] - p.p0[1]) / A) + p.rad * 2) * p.rad);
    const total = area.reduce((a, b) => a + b, 0);
    let last = list[0];
    return {
      n,
      at: (k) => {
        let t = k.r() * total;
        let c = list[list.length - 1];
        for (let i = 0; i < list.length; i++) if ((t -= area[i]) <= 0) { c = list[i]; break; }
        last = c;
        const u = k.r();
        const a = k.r() * Math.PI * 2;
        const rad = Math.sqrt(k.r()) * c.rad;
        return [c.p0[0] + (c.p1[0] - c.p0[0]) * u + Math.cos(a) * rad, c.p0[1] + (c.p1[1] - c.p0[1]) * u + Math.sin(a) * rad * A];
      },
      color: (x, y, k) => {
        const c = last;
        const mx = (c.p0[0] + c.p1[0]) / 2;
        const my = (c.p0[1] + c.p1[1]) / 2;
        const lit = clamp((my - y) / (c.rad * A + 1e-6) + ((mx - x) / (c.rad + 1e-6)) * 0.5, -1, 1);
        return [c.c[0], c.c[1], c.c[2] + lit * shade + k.gauss() * 2, c.c[3] ?? alpha];
      },
      angle: (x, y, k) => (k.r() - 0.5) * 3,
      len,
      width,
    };
  };

  // capsule sampler for small shapes (house, figure), radius in canvas widths
  const inCapsule = (kit, c) => {
    const t = kit.r();
    const ang = kit.r() * Math.PI * 2;
    const rad = Math.sqrt(kit.r()) * c.rad;
    const x = c.p0[0] + (c.p1[0] - c.p0[0]) * t + Math.cos(ang) * rad;
    const y = c.p0[1] + (c.p1[1] - c.p0[1]) * t + Math.sin(ang) * rad * A;
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
    aspect: A,
    ground: [42, 22, 87],
    setup(kit) {
      const clouds = [
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
          lobes.push({ x: c.cx + u * c.w * 1.6 + (kit.r() - 0.5) * 0.01, y: c.base - Math.max(rad * A * 0.6, lift), rad });
        }
        // smaller turrets boiling up off the top of the bigger lobes
        for (const l of lobes.slice()) {
          if (l.rad < 0.02) continue;
          const m = 1 + Math.floor(kit.r() * 3);
          for (let j = 0; j < m; j++) {
            const a = -Math.PI / 2 + (kit.r() - 0.5) * 1.8;
            const rad = l.rad * (0.35 + kit.r() * 0.25);
            lobes.push({ x: l.x + Math.cos(a) * l.rad * 0.8, y: l.y + Math.sin(a) * l.rad * A * 0.8, rad, small: true });
          }
        }
        return { ...c, lobes };
      });
      // where the hardwoods stand among the pines
      const hard = kit.noise(22);
      return {
        tree: kit.noise(36),
        treeFine: kit.noise(140),
        hard,
        clouds,
        // the jets of dirt out of the hole, mostly upward, a couple low and wide
        jets: Array.from({ length: 9 }, (_, i) => ({ a: (i / 8 - 0.5) * 2.2 + (kit.r() - 0.5) * 0.18, L: 0.034 + kit.r() * 0.036 })).map((j) => ({ ...j, L: j.L * (1 - Math.abs(j.a) * 0.4) })),
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
        // a few high mares' tails, dragged thin with a dry brush
        n: 320,
        at: (k) => {
          const band = k.pick([[0.12, 0.05], [0.45, 0.1], [0.82, 0.07]]);
          const x = band[0] + (k.r() - 0.5) * 0.3;
          return [x, band[1] + (x - band[0]) * -0.12 + k.gauss() * 0.012];
        },
        color: (x, y, k) => [212, 30, 86 + k.gauss() * 3, 0.32],
        angle: (x, y, k) => -0.12 + (k.r() - 0.5) * 0.12,
        len: 0.05,
        width: 0.003,
        bend: 0.3,
      },
      {
        // cumulus, lit from above, flat grey-violet bottoms
        n: 3200,
        at: (k, e) => {
          const c = k.pick(e.clouds);
          const l = k.pick(c.lobes);
          const a = k.r() * Math.PI * 2;
          const rr = Math.sqrt(k.r()) * l.rad;
          const x = l.x + Math.cos(a) * rr;
          const y = l.y + Math.sin(a) * rr * A;
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
          const top = Math.min(...best.lobes.map((l) => l.y - l.rad * A));
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
        // shadow in the folds between lobes, on the side away from the sun
        n: 1100,
        at: (k, e) => {
          const c = k.pick(e.clouds);
          const l = k.pick(c.lobes);
          const a = Math.PI * (0.05 + k.r() * 0.6); // lower right of each lobe
          const rr = l.rad * (0.55 + k.r() * 0.45);
          const y = l.y + Math.sin(a) * rr * A;
          if (y > c.base) return null;
          return [l.x + Math.cos(a) * rr, y];
        },
        color: (x, y, k) => [226, 14, 76 + k.gauss() * 3, 0.42],
        angle: (x, y, k) => (k.r() - 0.5) * 2,
        len: 0.018,
        width: 0.007,
        bend: 0.5,
      },
      {
        // and the sunlit caps, the brightest white in the picture, upper left of each lobe
        n: 1300,
        at: (k, e) => {
          const c = k.pick(e.clouds);
          const l = k.pick(c.lobes);
          const a = Math.PI * (1.05 + k.r() * 0.6);
          const rr = l.rad * (0.45 + k.r() * 0.5);
          return [l.x + Math.cos(a) * rr, l.y + Math.sin(a) * rr * A];
        },
        color: (x, y, k) => [44, 60, 97 + k.gauss(), 0.8],
        angle: (x, y, k) => (k.r() - 0.5) * 1.8,
        len: 0.014,
        width: 0.006,
        bend: 0.6,
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
        // the tree line along the edge of the field, pines mostly, with the hardwoods
        // starting to turn: sweetgum going to madder, hickory to ochre
        n: 3400,
        at: (k, e) => {
          const x = k.r();
          const top = HY - 0.06 + e.tree(x) * 0.045 + e.treeFine(x) * 0.02;
          return [x, top + Math.pow(k.r(), 0.8) * (HY + 0.022 - top)];
        },
        color: (x, y, k, e) => {
          const top = HY - 0.06 + e.tree(x) * 0.045 + e.treeFine(x) * 0.02;
          const low = (y - top) / (HY + 0.022 - top); // 0 at the crown, 1 at the ground
          if (e.hard(x) > 0.62 && k.r() < 0.45) {
            const leaf = k.pick([[12, 46, 38], [22, 50, 44], [42, 52, 52], [34, 40, 40], [90, 20, 34]]);
            return [leaf[0], leaf[1], leaf[2] - low * 12 + (k.r() < 0.25 ? 12 : 0)];
          }
          const lit = k.r() < 0.22 * (1 - low);
          return lit ? [88 + k.gauss() * 10, 22, 40] : [150 + k.gauss() * 14, 16, 24 + k.r() * 11 - low * 8];
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
          return [p.x + Math.cos(a) * rr * p.w * 1.6, cy + Math.sin(a) * rr * p.w * A * 1.1];
        },
        color: (x, y, k, e) => {
          const p = e.pines.reduce((b, q) => (Math.abs(q.x - x) < Math.abs(b.x - x) ? q : b));
          const cy = HY - 0.055 - p.h;
          // sun on the upper left of each crown
          const lit = (cy - y) / (p.w * A) + (p.x - x) / p.w > 0.4 && k.r() < 0.6;
          return lit ? [80 + k.gauss() * 8, 24, 40] : [148 + k.gauss() * 10, 18, 18 + k.r() * 10];
        },
        angle: (x, y, k) => (k.r() - 0.5) * 1.2,
        len: 0.007,
        width: 0.004,
      },
      // the Wilson place, off by the trees: a big oak, the house with its chimney and
      // porch, and a log crib
      parts([{ p0: [0.758, 0.535], p1: [0.775, 0.54], rad: 0.017, c: [130, 20, 24] }], { n: 360, len: 0.006, width: 0.004, shade: 10 }),
      parts([{ p0: [0.756, 0.528], p1: [0.765, 0.53], rad: 0.008, c: [84, 24, 40] }], { n: 60, len: 0.005, width: 0.003 }),
      parts(
        [
          { p0: [0.7695, 0.548], p1: [0.7695, 0.574], rad: 0.0026, c: [12, 42, 36] }, // brick chimney at the gable end
          { p0: [0.776, 0.574], p1: [0.806, 0.574], rad: 0.0045, c: [30, 10, 58] }, // weatherboard wall
          { p0: [0.776, 0.585], p1: [0.806, 0.585], rad: 0.0035, c: [30, 10, 56] },
          { p0: [0.772, 0.572], p1: [0.772, 0.588], rad: 0.0022, c: [30, 10, 40] }, // gable end, in shade
        ],
        { n: 220, len: 0.0035, width: 0.002, shade: 4 },
      ),
      {
        // the roof, rusted tin, light along the ridge
        n: 140,
        at: (k) => {
          const u = k.r();
          const v = k.r();
          return [0.769 + u * 0.041 - v * 0.003, 0.557 + v * 0.011];
        },
        color: (x, y, k) => (y < 0.56 ? [30, 22, 62] : [16, 34, 28 + k.gauss() * 3]),
        angle: (x, y, k) => (k.r() - 0.5) * 0.15,
        len: 0.007,
        width: 0.0025,
      },
      {
        // the porch, deep shade under its roof
        n: 160,
        at: (k) => [0.778 + k.r() * 0.027, 0.577 + k.r() * 0.01],
        color: (x, y, k) => [26, 16, 20 + k.gauss() * 3],
        angle: (x, y, k) => (k.r() - 0.5) * 0.2,
        len: 0.005,
        width: 0.002,
      },
      {
        // with the posts standing out in front of it
        n: 50,
        at: (k) => [0.7785 + Math.floor(k.r() * 5) * 0.0065, 0.577 + k.r() * 0.01],
        color: () => [34, 12, 64],
        angle: () => Math.PI / 2,
        len: 0.004,
        width: 0.0009,
      },
      parts(
        [
          { p0: [0.787, 0.573], p1: [0.787, 0.575], rad: 0.0013, c: [220, 20, 16] }, // windows
          { p0: [0.799, 0.573], p1: [0.799, 0.575], rad: 0.0013, c: [220, 20, 16] },
          { p0: [0.832, 0.58], p1: [0.846, 0.58], rad: 0.0045, c: [26, 24, 34] }, // log crib
          { p0: [0.83, 0.571], p1: [0.848, 0.571], rad: 0.0022, c: [24, 20, 48] }, // its roof
        ],
        { n: 90, len: 0.003, width: 0.0018, shade: 6 },
      ),
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
        // shade along the foot of the trees
        n: 260,
        at: (k) => [k.r() * 1.02 - 0.01, HY + 0.012 + k.r() * 0.01],
        color: (x, y, k) => [24, 20, 40, 0.5],
        angle: (x, y, k) => (k.r() - 0.5) * 0.1,
        len: 0.03,
        width: 0.004,
      },
      {
        // a worm fence of split rails zigzagging along the field edge
        n: 900,
        at: (k) => {
          const x = 0.52 + k.r() * 0.5;
          const zig = Math.abs(((x * 90) % 2) - 1); // 0..1 back and forth
          const rail = Math.floor(k.r() * 4);
          return [x, HY + 0.02 + zig * 0.01 - rail * 0.004];
        },
        color: (x, y, k) => (k.r() < 0.25 ? [36, 14, 70] : [28, 10, 36 + k.gauss() * 4]),
        angle: (x) => (Math.floor(x * 90) % 2 ? 0.48 : -0.48),
        len: 0.006,
        width: 0.0016,
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
        // the rows running on out to the trees, just flecks of white by the far end
        n: 1600,
        at: (k) => rowPoint(Math.floor(k.r() * ROWS) + 0.5, 0.03 + Math.pow(k.r(), 1.3) * 0.3),
        color: (x, y, k) => (k.r() < 0.35 ? [30, 24, 40] : [42, 14, 84 + k.gauss() * 3]),
        angle: (x, y, k) => towardVP(x, y) + (k.r() - 0.5) * 0.6,
        len: (x, y) => 0.003 + depth(y) * 0.02,
        width: (x, y) => 0.0015 + depth(y) * 0.005,
      },
      {
        // cotton plants between the furrows, the stalks gone red-brown, the leaves
        // half dropped and turning
        n: 2600,
        at: (k) => rowPoint(Math.floor(k.r() * ROWS) + 0.5, Math.pow(k.r(), 0.7)),
        color: (x, y, k) => {
          const f = 30 + (1 - depth(y)) * 20;
          const r = k.r();
          if (r < 0.3) return [14, 36, f - 8];
          if (r < 0.45) return [28, 40, f + 2];
          return [56 + k.gauss() * 8, 18, f];
        },
        angle: (x, y, k) => -Math.PI / 2 + (k.r() - 0.5) * 1.8,
        len: (x, y) => 0.004 + depth(y) * 0.022,
        width: (x, y) => 0.002 + depth(y) * 0.008,
      },
      {
        // open bolls, sunlit on top, blue-grey in their own shade
        n: 2600,
        at: (k) => {
          const [x, y] = rowPoint(Math.floor(k.r() * ROWS) + 0.5 + k.gauss() * 0.28, Math.pow(k.r(), 0.7));
          return [x, y - depth(y) * 0.012 * k.r()];
        },
        color: (x, y, k) => (k.r() < 0.22 ? [220, 12, 72 - (1 - depth(y)) * 4] : [44, 18, 90 - (1 - depth(y)) * 8 + k.gauss() * 3]),
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
            const d = Math.hypot(x - mx, (y - my) / A) - c.rad;
            if (d < bd) (bd = d), (best = c);
          }
          return [best.c[0], best.c[1], best.c[2] + k.gauss() * 4, 0.95];
        },
        angle: (x, y, k) => (k.r() - 0.5) * 3,
        len: 0.006,
        width: 0.003,
      },
      {
        // fresh red clay spattered over the white cotton all round the hole
        n: 260,
        at: (k) => {
          const a = k.r() * Math.PI * 2;
          const rr = 0.006 + Math.pow(k.r(), 0.9) * 0.032;
          return [0.5 + Math.cos(a) * rr, 0.713 + Math.sin(a) * rr * 0.32];
        },
        color: (x, y, k) => [14 + k.gauss() * 4, 46, 30 + k.gauss() * 5, 0.85],
        angle: (x, y, k) => Math.atan2(y - 0.713, x - 0.5) + (k.r() - 0.5) * 0.5,
        len: 0.005,
        width: 0.003,
      },
      {
        // where it went in: a dark hole in the row
        n: 120,
        at: (k) => [0.5 + k.gauss() * 0.007, 0.713 + k.gauss() * 0.0025],
        color: (x, y, k) => [12, 40, 12 + k.gauss() * 3],
        angle: (x, y, k) => (k.r() - 0.5) * 0.4,
        len: 0.006,
        width: 0.003,
      },
      {
        // dust rolling out low along the row from the hole
        n: 260,
        at: (k) => {
          const u = k.gauss();
          return [0.5 + u * 0.03, 0.708 - Math.abs(k.gauss()) * 0.012 * (1 - Math.min(1, Math.abs(u)) * 0.5)];
        },
        color: (x, y, k) => [26, 26, 62 + k.gauss() * 4, 0.4],
        angle: (x, y, k) => (k.r() - 0.5) * 0.4,
        len: 0.012,
        width: 0.005,
        bend: 0.4,
      },
      {
        // the dirt it threw up: jets of clay fanning out of the hole, dark and thick
        // at the bottom, breaking into clumps and paling to dust toward the ends
        n: 1500,
        at: (k, e) => {
          const jet = k.pick(e.jets);
          const t = Math.pow(k.r(), 0.75);
          const spread = (0.001 + t * 0.0035) * k.gauss();
          const dx = Math.sin(jet.a);
          const dy = -Math.cos(jet.a);
          const pt = [0.5 + dx * jet.L * t - dy * spread, 0.712 + (dy * jet.L * t + dx * spread) * A];
          pt.push(t);
          return pt;
        },
        color: (x, y, k, e) => {
          const t = clamp(Math.hypot(x - 0.5, (y - 0.712) / A) / 0.06);
          return [14 + t * 12, 48 - t * 22, 22 + t * 40 + k.gauss() * 4, 0.95 - t * 0.45];
        },
        angle: (x, y, k) => Math.atan2(y - 0.712, (x - 0.5) * A || 1e-4) + (k.r() - 0.5) * 0.15,
        len: 0.011,
        width: 0.0024,
        bend: 0.2,
      },
      {
        // clods flying off the ends of the jets, the last thing painted
        n: 110,
        at: (k, e) => {
          const jet = k.pick(e.jets);
          const t = 0.8 + k.r() * 0.7;
          const a = jet.a + k.gauss() * 0.12;
          // falling away a little past the end of each jet
          const drop = Math.max(0, t - 1) * Math.max(0, t - 1) * 0.05;
          return [0.5 + Math.sin(a) * jet.L * t, 0.712 - Math.cos(a) * jet.L * t * A + drop];
        },
        color: (x, y, k) => [14, 42, 16 + k.gauss() * 4, 0.95],
        angle: (x, y, k) => k.r() * Math.PI,
        len: 0.0028,
        width: 0.0026,
      },
    ],
  };
})();
