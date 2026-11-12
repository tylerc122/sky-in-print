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
  // the angle of a segment as it lands on the canvas (y is in heights, x in widths)
  const segAngle = (x0, y0, x1, y1) => Math.atan2((y1 - y0) / A, x1 - x0);

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

  // Ben Wilson, bent over the row picking, sack strap over his shoulder and the long
  // sack dragging in the furrow behind him. His head has come up at the noise.
  // Built in head units, about 7.5 to a man, facing right toward where it hit.
  const FEET = [0.275, 0.84];
  const U = 0.19 / 7.5; // one head, in canvas heights
  const P = ([hx, hy]) => [FEET[0] + (hx * U) / A, FEET[1] - hy * U];
  const seg = (a, b, r, c) => ({ p0: P(a), p1: P(b), rad: (r * U) / A, c });
  const SHIRT = [210, 30, 58];
  const SHIRT_DK = [214, 26, 40];
  const PANTS = [24, 24, 18];
  const PANTS_DK = [24, 20, 12];
  const SKIN = [22, 38, 40];
  const STRAW = [44, 44, 72];
  const STRAW_DK = [38, 34, 48];
  const SACK = [38, 20, 74];
  const SACK_DK = [32, 16, 54];
  const BOOT = [20, 22, 13];
  const FIG_BACK = [
    // the sack, from his hip down into the furrow and back along it, stuffed lumpy
    seg([-0.1, 3.9], [-0.9, 2.4], 0.42, SACK),
    seg([-0.9, 2.4], [-2.1, 1.0], 0.62, SACK),
    seg([-2.1, 0.75], [-3.8, 0.55], 0.72, SACK),
    seg([-3.8, 0.5], [-5.4, 0.45], 0.62, SACK),
    seg([-5.4, 0.42], [-5.9, 0.4], 0.45, SACK),
    // the far arm, hanging down on the other side of him
    seg([1.95, 5.15], [2.25, 4.0], 0.2, SHIRT_DK),
    seg([2.25, 4.0], [2.55, 3.15], 0.17, SHIRT_DK),
    seg([2.6, 3.0], [2.6, 3.0], 0.16, [20, 34, 30]),
    // the far leg, weight on it
    seg([0.0, 3.8], [-0.32, 2.0], 0.36, PANTS_DK),
    seg([-0.32, 2.0], [-0.5, 0.28], 0.27, PANTS_DK),
    seg([-0.78, 0.12], [-0.22, 0.09], 0.16, BOOT),
  ];
  const FIG_BODY = [
    // near leg, knee bent forward
    seg([0.35, 3.8], [0.95, 2.05], 0.37, PANTS),
    seg([0.95, 2.05], [0.82, 0.28], 0.27, PANTS),
    seg([0.62, 0.12], [1.25, 0.08], 0.16, BOOT),
    // seat and hips
    seg([0.0, 3.95], [0.45, 4.0], 0.58, PANTS),
    // the back, bent well over, shirt pulled across it
    seg([0.2, 4.15], [1.2, 4.85], 0.62, SHIRT),
    seg([1.2, 4.85], [2.2, 5.3], 0.7, SHIRT),
    // neck, lifted
    seg([2.45, 5.5], [2.8, 5.9], 0.21, SKIN),
    // head, turned up and to the right
    seg([3.05, 6.2], [3.05, 6.2], 0.44, SKIN),
    seg([3.45, 6.12], [3.52, 6.08], 0.1, SKIN),
    seg([3.25, 5.85], [3.4, 5.85], 0.14, [22, 30, 30]),
    // the hat, brim tipped back by the lift of his head
    seg([2.35, 6.62], [3.85, 6.42], 0.11, STRAW),
    seg([2.75, 6.88], [3.3, 6.8], 0.3, STRAW),
    seg([2.8, 6.62], [3.25, 6.58], 0.07, STRAW_DK),
  ];
  const FIG_FRONT = [
    // near arm, down into the plant, the hand on a boll
    seg([2.35, 5.05], [2.8, 3.85], 0.21, SHIRT),
    seg([2.8, 3.85], [3.05, 2.9], 0.17, SHIRT),
    seg([3.1, 2.72], [3.12, 2.66], 0.17, SKIN),
    // the strap, over his near shoulder and down to the sack
    seg([2.05, 5.6], [1.1, 4.95], 0.07, SACK_DK),
    seg([1.1, 4.95], [-0.05, 4.05], 0.07, SACK_DK),
  ];
  const FIG_LIGHT = [
    // where the sun catches the top of his back, his shoulder and the hat crown
    seg([0.45, 4.6], [1.3, 5.25], 0.12, [44, 30, 90]),
    seg([1.3, 5.25], [2.2, 5.75], 0.13, [44, 30, 90]),
    seg([2.8, 7.08], [3.25, 7.0], 0.09, [46, 60, 86]),
    seg([2.35, 6.7], [2.9, 6.64], 0.05, [46, 60, 84]),
  ];
  const FIG_SHADOW = [
    // the sack's underside, shaded and dirtied where it drags
    seg([-2.1, 0.45], [-5.6, 0.25], 0.3, [30, 18, 44]),
    seg([-0.9, 2.1], [-2.0, 0.7], 0.25, SACK_DK),
  ];

  // the near cotton plants, one at the foot of each row, coming up into the bottom of the frame
  const nearPlants = (kit) => {
    const plants = [];
    for (let k = 0; k < ROWS; k++) {
      const [x, y] = rowPoint(k + 0.5, 1.0 + kit.r() * 0.05);
      if (x < -0.03 || x > 1.03) continue;
      const h = 0.2 + kit.r() * 0.09;
      const stalk = [];
      const bolls = [];
      const leaves = [];
      const lean = (kit.r() - 0.5) * 0.025;
      const top = [x + lean, y - h];
      stalk.push([x, y, top[0], top[1]]);
      // fruiting branches off alternate sides, shorter toward the top
      const nb = 5 + Math.floor(kit.r() * 3);
      for (let i = 0; i < nb; i++) {
        const f = 0.22 + (i / nb) * 0.72;
        const sx = x + lean * f;
        const sy = y - h * f;
        const side = (i + k) % 2 ? 1 : -1;
        const bl = (0.026 + kit.r() * 0.018) * (1.15 - f * 0.55);
        const ex = sx + side * bl;
        const ey = sy - bl * A * (0.2 + kit.r() * 0.3);
        stalk.push([sx, sy, ex, ey]);
        if (kit.r() < 0.85) bolls.push([ex, ey - 0.008, 0.0085 + kit.r() * 0.004]);
        if (kit.r() < 0.4) bolls.push([sx + side * bl * 0.45, sy - bl * A * 0.12 - 0.008, 0.007 + kit.r() * 0.003]);
        for (let j = 0; j < 3; j++) leaves.push([sx + side * bl * kit.r(), sy - kit.r() * 0.03]);
      }
      bolls.push([top[0], top[1] - 0.006, 0.008]);
      plants.push({ stalk, bolls, leaves });
    }
    return plants;
  };

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
        pines: Array.from({ length: 46 }, () => ({ x: kit.r(), h: 0.008 + Math.pow(kit.r(), 1.6) * 0.045, w: 0.007 + kit.r() * 0.007 })),
        near: nearPlants(kit),
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
        // his shadow, short at one o'clock, thrown off to the right along the row
        n: 160,
        at: (k) => {
          const u = k.r();
          return [FEET[0] - 0.012 + u * 0.06 + k.gauss() * 0.003, FEET[1] + 0.004 - u * 0.012 + k.gauss() * 0.003];
        },
        color: () => [16, 30, 18, 0.45],
        angle: () => -0.2,
        len: 0.01,
        width: 0.004,
      },
      parts(FIG_SHADOW, { n: 160, len: 0.003, width: 0.0018 }),
      parts(FIG_BACK, { n: 2000, len: 0.003, width: 0.0018, shade: 8 }),
      parts(FIG_BODY, { n: 2400, len: 0.0028, width: 0.0017, shade: 8 }),
      parts(FIG_FRONT, { n: 700, len: 0.0026, width: 0.0015, shade: 8 }),
      parts(FIG_LIGHT, { n: 120, len: 0.002, width: 0.0011, shade: 2, alpha: 0.7 }),
      {
        // lumps of picked cotton showing at the sack's mouth
        n: 50,
        at: (k) => {
          const [x, y] = P([-0.15, 3.95]);
          return [x + k.gauss() * 0.004, y + k.gauss() * 0.006];
        },
        color: (x, y, k) => [44, 20, 93],
        angle: (x, y, k) => (k.r() - 0.5) * 3,
        len: 0.003,
        width: 0.0022,
      },
      {
        // the row he's standing in, leaves and bolls in front of his shins
        n: 130,
        at: (k) => {
          const u = (k.r() - 0.4) * 0.07;
          return [FEET[0] + u, FEET[1] - 0.002 - Math.pow(k.r(), 2) * 0.03];
        },
        color: (x, y, k) => {
          const r = k.r();
          if (r < 0.2) return [44, 18, 90 + k.gauss() * 3];
          return r < 0.65 ? [14, 36, 28] : [56, 20, 36];
        },
        angle: (x, y, k) => (k.r() - 0.5) * 3,
        len: 0.0055,
        width: 0.004,
      },
      {
        // where it went in: a dark scar in the row
        n: 70,
        at: (k) => [0.5 + k.gauss() * 0.008, 0.712 + k.gauss() * 0.004],
        color: (x, y, k) => [16, 32, 20],
        angle: (x, y, k) => (k.r() - 0.5) * 0.4,
        len: 0.007,
        width: 0.003,
      },
      {
        // the dirt it threw up
        n: 700,
        at: (k) => {
          const h = Math.pow(k.r(), 1.1);
          return [0.5 + k.gauss() * (0.004 + h * 0.022), 0.71 - h * 0.095];
        },
        color: (x, y, k) => {
          const h = (0.71 - y) / 0.095;
          if (k.r() < 0.08) return [16, 30, 26, 0.85];
          return [22 + h * 8, 36 - h * 16, 42 + h * 30 + k.gauss() * 5, 0.62 - h * 0.18];
        },
        angle: (x, y, k) => -Math.PI / 2 + (x - 0.5) * 14 + (k.r() - 0.5) * 0.7,
        len: 0.009,
        width: 0.004,
        bend: 0.4,
      },
      {
        // the dust of it drifting off to the right on the breeze
        n: 90,
        at: (k) => {
          const u = k.r();
          return [0.505 + u * 0.035 + k.gauss() * 0.005, 0.65 - u * 0.008 + k.gauss() * 0.01];
        },
        color: (x, y, k) => [30, 20, 72, 0.12],
        angle: (x, y, k) => -0.1 + (k.r() - 0.5) * 0.4,
        len: 0.016,
        width: 0.006,
        bend: 0.4,
      },
      {
        // clods and knocked-loose cotton thrown out in arcs, the last thing painted
        n: 60,
        at: (k) => {
          // each one on its own arc out of the hole
          const a = (k.r() - 0.5) * 1.8;
          const v = 0.04 + k.r() * 0.05;
          const s = 0.15 + k.r() * 0.85;
          return [0.5 + Math.sin(a) * v * s * 0.5, 0.712 - (Math.cos(a) * v * s - v * 0.7 * s * s)];
        },
        color: (x, y, k) => (k.r() < 0.3 ? [44, 16, 92, 0.9] : [18, 34, 24 + k.gauss() * 4, 0.9]),
        angle: (x, y, k) => k.r() * Math.PI,
        len: 0.0025,
        width: 0.0022,
      },
      // the near plants, big at the bottom edge: stalks, a few turned leaves, burs and bolls
      {
        n: 3600,
        fixed: true,
        at: (k, e) => {
          const p = k.pick(e.near);
          const s = k.pick(p.stalk);
          const t = k.r();
          return [s[0] + (s[2] - s[0]) * t, s[1] + (s[3] - s[1]) * t];
        },
        color: (x, y, k) => (k.r() < 0.2 ? [18, 30, 40] : [12 + k.gauss() * 4, 36, 20 + k.gauss() * 4]),
        angle: (x, y, k, e) => {
          // find the stalk this dab sits on so the stroke runs along it
          let best = null;
          let bd = 9;
          for (const p of e.near)
            for (const s of p.stalk) {
              const vx = s[2] - s[0];
              const vy = (s[3] - s[1]) / A;
              const wx = x - s[0];
              const wy = (y - s[1]) / A;
              const t = clamp((wx * vx + wy * vy) / (vx * vx + vy * vy || 1));
              const d = Math.hypot(wx - vx * t, wy - vy * t);
              if (d < bd) (bd = d), (best = s);
            }
          return segAngle(best[0], best[1], best[2], best[3]);
        },
        len: 0.012,
        width: 0.0032,
      },
      {
        n: 1500,
        fixed: true,
        at: (k, e) => {
          const p = k.pick(e.near);
          const l = k.pick(p.leaves);
          return [l[0] + k.gauss() * 0.008, l[1] + k.gauss() * 0.014];
        },
        color: (x, y, k) => {
          const c = k.pick([[14, 42, 30], [10, 38, 24], [32, 44, 38], [62, 22, 30], [24, 30, 20]]);
          return [c[0], c[1], c[2] + (k.r() < 0.2 ? 14 : 0)];
        },
        angle: (x, y, k) => (k.r() - 0.5) * 3,
        len: 0.011,
        width: 0.008,
        bend: 0.5,
      },
      {
        // the burs, dried and split open, dark points behind each boll
        n: 1100,
        fixed: true,
        at: (k, e) => {
          const p = k.pick(e.near);
          const b = k.pick(p.bolls);
          const a = (Math.floor(k.r() * 5) / 5) * Math.PI * 2 + 0.3;
          const rr = b[2] * (0.8 + k.r() * 0.5);
          return [b[0] + Math.cos(a) * rr, b[1] + Math.sin(a) * rr * A + 0.003];
        },
        color: (x, y, k) => [18, 38, 15 + k.gauss() * 3],
        angle: (x, y, k) => k.r() * Math.PI,
        len: 0.007,
        width: 0.0028,
      },
      {
        // the locks of lint, four or five to a boll, white where the sun hits
        n: 3400,
        fixed: true,
        at: (k, e) => {
          const p = k.pick(e.near);
          const b = k.pick(p.bolls);
          const lock = Math.floor(k.r() * 4);
          const a = (lock / 4) * Math.PI * 2 + 0.6;
          const c = [b[0] + Math.cos(a) * b[2] * 0.55, b[1] + Math.sin(a) * b[2] * 0.55 * A];
          const a2 = k.r() * Math.PI * 2;
          const rr = Math.sqrt(k.r()) * b[2] * 0.6;
          const pt = [c[0] + Math.cos(a2) * rr, c[1] + Math.sin(a2) * rr * A];
          pt.push(b);
          return pt;
        },
        color: (x, y, k, e) => {
          // nearest boll, to shade the lower right of each one
          let b = null;
          let bd = 9;
          for (const p of e.near)
            for (const q of p.bolls) {
              const d = Math.hypot(x - q[0], (y - q[1]) / A);
              if (d < bd) (bd = d), (b = q);
            }
          const lower = (x - b[0]) / b[2] + (y - b[1]) / (b[2] * A);
          if (lower > 0.7) return [222, 12, 70 + k.gauss() * 3, 0.95];
          if (lower > 0.1) return [40, 14, 86 + k.gauss() * 2, 0.95];
          return [46, 40, 96 + k.gauss(), 0.95];
        },
        angle: (x, y, k) => (k.r() - 0.5) * 3,
        len: 0.0065,
        width: 0.0048,
        bend: 0.6,
      },
    ],
  };
})();
