// The paintings, one per case, all by the same invented hand: a regional painter of the 1890s who
// gives the sky most of the canvas, works in short dry strokes over a chalky ground, keeps to a
// small palette, and only paints what the sources back up. If a case is a hoax, nothing falls.
// If the record doesn't give the hour or the season, the caption says the painting guessed.
//
// Everything is in canvas fractions: x across, y down, both 0..1. Stroke lengths and widths are
// fractions of the canvas width. Colours are [hue, saturation, lightness, alpha?].
(() => {
  const A = 2.1; // every scene shares this aspect

  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function noise(r, n = 32) {
    const v = Array.from({ length: n + 2 }, () => r());
    return (x) => {
      const f = Math.max(0, Math.min(n, x * n));
      const i = Math.floor(f);
      const t = f - i;
      const s = t * t * (3 - 2 * t);
      return v[i] * (1 - s) + v[i + 1] * s;
    };
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t), a[3] ?? b[3]];
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const jit = (c, k, h = 4, l = 3) => [c[0] + k.gauss() * h, c[1], c[2] + k.gauss() * l, c[3]];
  const toRgb = ([h, s, l]) => {
    s /= 100;
    l /= 100;
    const f = (n) => {
      const k = (n + h / 30) % 12;
      return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    return [f(0), f(8), f(4)];
  };
  const toHsl = ([r, g, b]) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l * 100];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s * 100, l * 100];
  };
  // blend in RGB, the way paint on a palette does: blue into yellow goes grey, not green
  const blend = (a, b, t) => {
    const x = toRgb(a);
    const y = toRgb(b);
    return toHsl([lerp(x[0], y[0], t), lerp(x[1], y[1], t), lerp(x[2], y[2], t)]);
  };
  // a colour from a list of [y, colour] stops
  const ramp = (stops, y) => {
    if (y <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++)
      if (y <= stops[i][0]) return blend(stops[i - 1][1], stops[i][1], (y - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
    return stops[stops.length - 1][1];
  };
  const angleOf = (x0, y0, x1, y1) => Math.atan2((y1 - y0) / A, x1 - x0);

  const K = {};

  // the sky in two layers: broad strokes, then smaller broken ones over the top
  K.sky = ({ stops, hy, n = 1500, tilt = -0.05, len = 0.075, width = 0.024, flecks = null }) => [
    {
      n,
      at: (k) => [k.r() * 1.04 - 0.02, k.r() * (hy + 0.04)],
      color: (x, y, k) => jit(ramp(stops, y), k, 3, 2),
      angle: (x, y, k) => tilt + (k.r() - 0.5) * 0.3,
      len,
      width,
      alpha: 0.82,
    },
    {
      n: Math.round(n * 0.75),
      at: (k) => [k.r(), k.r() * (hy + 0.02)],
      color: (x, y, k) => (flecks && k.r() < 0.06 ? jit(flecks, k) : jit(ramp(stops, y), k, 4, 3)),
      angle: (x, y, k) => tilt * 1.5 + (k.r() - 0.5) * 0.5,
      len: len * 0.55,
      width: width * 0.5,
      alpha: 0.7,
    },
    {
      // a last glaze of small broken touches, so the sky has a surface up close
      n: Math.round(n * 0.7),
      at: (k) => [k.r(), k.r() * (hy + 0.01)],
      color: (x, y, k) => {
        const c = ramp(stops, y);
        return [c[0] + k.gauss() * 5, c[1] + k.gauss() * 4, c[2] + (k.r() < 0.5 ? 3 : -3) + k.gauss() * 2];
      },
      angle: (x, y, k) => tilt * 2 + (k.r() - 0.5) * 0.8,
      len: len * 0.2,
      width: width * 0.22,
      alpha: 0.45,
    },
  ];

  K.stars = ({ hy, n = 240, color = [52, 30, 90], seed = 1 }) => {
    const r = rng(seed);
    const pts = Array.from({ length: n }, () => [r(), Math.pow(r(), 1.25) * hy * 0.92, 0.35 + r() * 0.6]);
    // the brightest handful, a touch bigger, some warm and some cold
    const big = Array.from({ length: Math.max(3, Math.round(n / 28)) }, () => [r(), Math.pow(r(), 1.4) * hy * 0.85, r() < 0.4 ? 40 : 210]);
    let i = 0;
    let j = 0;
    let h = 0;
    return [
      {
        n,
        fixed: true,
        at: () => pts[i++ % n],
        color: (x, y, k) => [color[0], color[1], color[2] + k.gauss() * 4, pts[(i - 1) % n][2]],
        angle: (x, y, k) => k.r() * 3,
        len: 0.0022,
        width: 0.0016,
      },
      {
        n: big.length * 10,
        fixed: true,
        at: (k) => {
          const b = big[h++ % big.length];
          const a = k.r() * Math.PI * 2;
          const rr = Math.pow(k.r(), 1.5) * 0.007;
          return [b[0] + Math.cos(a) * rr, b[1] + Math.sin(a) * rr * A];
        },
        color: (x, y, k) => [big[(h - 1) % big.length][2], 30, 80, 0.07],
        angle: (x, y, k) => k.r() * Math.PI,
        len: 0.004,
        width: 0.003,
      },
      {
        n: big.length * 3,
        fixed: true,
        at: () => big[j++ % big.length],
        color: (x, y, k) => [big[(j - 1) % big.length][2], 40, 94, 0.95],
        angle: (x, y, k) => k.r() * 3,
        len: 0.003,
        width: 0.0026,
      },
    ];
  };

  // cumulus as rows of round lobes on a flat base, lit from above
  K.clouds = ({ seed, list, lit, mid, shade, n = 2200, len = 0.032, width = 0.013, flat = 1 }) => {
    const r = rng(seed);
    const clouds = list.map((c) => {
      const m = 5 + Math.floor(r() * 4);
      const lobes = [];
      for (let i = 0; i < m; i++) {
        const u = i / (m - 1) - 0.5;
        const rad = (c.w / m) * (1.1 + r() * 0.7) * (1 - Math.abs(u) * 0.8);
        const lift = c.h * (1 - Math.abs(u) * 1.6) * (0.55 + r() * 0.5);
        lobes.push({ x: c.cx + u * c.w * 1.6 + (r() - 0.5) * 0.01, y: c.base - Math.max(rad * A * 0.6 * flat, lift), rad });
      }
      // smaller turrets boiling up off the bigger lobes
      for (const l of lobes.slice()) {
        if (l.rad < 0.02 || flat < 1) continue;
        const t = 1 + Math.floor(r() * 3);
        for (let j = 0; j < t; j++) {
          const a = -Math.PI / 2 + (r() - 0.5) * 1.8;
          const rad = l.rad * (0.35 + r() * 0.25);
          lobes.push({ x: l.x + Math.cos(a) * l.rad * 0.8, y: Math.min(c.base - rad * A * 0.5, l.y + Math.sin(a) * l.rad * A * 0.8), rad });
        }
      }
      const top = Math.min(...lobes.map((l) => l.y - l.rad * A * flat));
      return { ...c, lobes, top };
    });
    return [
    {
      n,
      at: (k) => {
        const c = k.pick(clouds);
        const l = k.pick(c.lobes);
        const a = k.r() * Math.PI * 2;
        const rr = Math.sqrt(k.r()) * l.rad;
        const x = l.x + Math.cos(a) * rr;
        const y = l.y + Math.sin(a) * rr * A * flat;
        if (y > c.base + k.r() * 0.008) return null;
        return [x, y, c];
      },
      color: (x, y, k) => {
        let best = clouds[0];
        let bd = 9;
        for (const c of clouds) {
          const d = Math.abs(x - c.cx) / c.w + Math.max(0, y - c.base) * 20;
          if (d < bd) (bd = d), (best = c);
        }
        const v = clamp((y - best.top) / (best.base - best.top));
        if (v > 0.72) return jit(shade, k, 3, 3);
        if (v > 0.5) return jit(mid, k, 3, 3);
        return jit(lit, k, 3, 2);
      },
      angle: (x, y, k) => (k.r() - 0.5) * 1.6,
      len,
      width,
      bend: 0.5,
      alpha: 0.86,
    },
    {
      // shade in the folds, lower right of each lobe, away from the light
      n: Math.round(n * 0.35),
      at: (k) => {
        const c = k.pick(clouds);
        const l = k.pick(c.lobes);
        const a = Math.PI * (0.05 + k.r() * 0.6);
        const rr = l.rad * (0.55 + k.r() * 0.45);
        const y = l.y + Math.sin(a) * rr * A * flat;
        if (y > c.base) return null;
        return [l.x + Math.cos(a) * rr, y];
      },
      color: (x, y, k) => [mid[0] * 0.5 + shade[0] * 0.5 + k.gauss() * 3, (mid[1] + shade[1]) / 2, (mid[2] + shade[2]) / 2 + k.gauss() * 2, 0.42],
      angle: (x, y, k) => (k.r() - 0.5) * 2,
      len: len * 0.55,
      width: width * 0.55,
      bend: 0.5,
    },
    {
      // and the lit caps, upper left of each lobe
      n: Math.round(n * 0.4),
      at: (k) => {
        const c = k.pick(clouds);
        const l = k.pick(c.lobes);
        const a = Math.PI * (1.05 + k.r() * 0.6);
        const rr = l.rad * (0.45 + k.r() * 0.5);
        return [l.x + Math.cos(a) * rr, l.y + Math.sin(a) * rr * A * flat];
      },
      color: (x, y, k) => [lit[0], lit[1] * 1.2, Math.min(98, lit[2] + 3) + k.gauss(), 0.75],
      angle: (x, y, k) => (k.r() - 0.5) * 1.8,
      len: len * 0.45,
      width: width * 0.45,
      bend: 0.6,
    },
    ];
  };

  // a long low band of cloud, for overcast or dusk streaks
  K.bands = ({ seed, rows, n = 900, len = 0.09, width = 0.012 }) => {
    const r = rng(seed);
    const shapes = rows.map((b) => ({ ...b, edge: noise(r, 12) }));
    return {
      n,
      at: (k) => {
        const b = k.pick(shapes);
        const x = b.x0 + k.r() * (b.x1 - b.x0);
        const thick = b.h * (0.3 + b.edge(x) * 0.9) * Math.sin(((x - b.x0) / (b.x1 - b.x0)) * Math.PI);
        return [x, b.y + k.gauss() * thick * 0.5, b];
      },
      color: (x, y, k) => {
        let best = shapes[0];
        let bd = 9;
        for (const b of shapes) {
          const d = Math.abs(y - b.y) + (x < b.x0 || x > b.x1 ? 1 : 0);
          if (d < bd) (bd = d), (best = b);
        }
        return jit(y < best.y ? best.lit : best.color, k, 3, 3);
      },
      angle: (x, y, k) => -0.03 + (k.r() - 0.5) * 0.12,
      len,
      width,
      alpha: 0.8,
    };
  };

  // distant hills or a far shore
  K.hills = ({ seed, hy, height, color, top = null, n = 700, x0 = 0, x1 = 1, bumps = 10, len = 0.03, width = 0.01 }) => {
    const r = rng(seed);
    const prof = noise(r, bumps);
    const fine = noise(r, bumps * 4);
    const edge = (x) => hy - height * (0.35 + 0.5 * prof(x) + 0.15 * fine(x));
    return {
      n,
      at: (k) => {
        const x = x0 + k.r() * (x1 - x0);
        const e = edge(x);
        return [x, e + Math.pow(k.r(), 0.9) * (hy + 0.008 - e)];
      },
      color: (x, y, k) => {
        const e = edge(x);
        return top && y < e + height * 0.15 ? jit(top, k, 3, 3) : jit(color, k, 3, 3);
      },
      angle: (x, y, k) => (k.r() - 0.5) * 0.5,
      len,
      width,
      alpha: 0.9,
    };
  };

  // a mass of trees along the horizon; leafy, spruce spires, or bare winter branches
  K.trees = ({ seed, hy, height, color, light = null, kind = "leafy", n = 2000, x0 = 0, x1 = 1, base = 0.02, count = 40 }) => {
    const r = rng(seed);
    const prof = noise(r, 30);
    const fine = noise(r, 120);
    if (kind === "spruce") {
      const spires = Array.from({ length: count }, () => ({ x: x0 + r() * (x1 - x0), h: height * (0.5 + r() * 0.8), w: 0.006 + r() * 0.008 }));
      return [
        {
          n: Math.round(n * 0.35),
          at: (k) => [x0 + k.r() * (x1 - x0), hy - height * 0.35 * k.r() + base * k.r()],
          color: (x, y, k) => jit(color, k, 4, 3),
          angle: (x, y, k) => Math.PI / 2 + (k.r() - 0.5) * 0.6,
          len: 0.012,
          width: 0.007,
        },
        {
          n: Math.round(n * 0.65),
          at: (k) => {
            const s = k.pick(spires);
            const t = Math.sqrt(k.r()); // more paint at the wide bottom
            const y = hy - s.h * (1 - t);
            return [s.x + (k.r() - 0.5) * s.w * t * 2, y];
          },
          color: (x, y, k) => (light && k.r() < 0.18 ? jit(light, k) : jit(color, k, 4, 3)),
          angle: (x, y, k) => (k.r() < 0.5 ? 0.35 : Math.PI - 0.35) + (k.r() - 0.5) * 0.3,
          len: 0.006,
          width: 0.003,
        },
      ];
    }
    if (kind === "bare") {
      const trunks = Array.from({ length: count }, () => ({ x: x0 + r() * (x1 - x0), h: height * (0.5 + r() * 0.7) }));
      return [
        {
          // the fuzz of twigs
          n: Math.round(n * 0.6),
          at: (k) => {
            const t = k.pick(trunks);
            const a = k.r() * Math.PI;
            const rr = Math.sqrt(k.r());
            return [t.x + Math.cos(a) * rr * t.h * 0.22, hy - t.h * 0.62 - Math.sin(a) * rr * t.h * 0.42 * A * 0.5];
          },
          color: (x, y, k) => [color[0], color[1], color[2] + k.gauss() * 3, 0.35],
          angle: (x, y, k) => -Math.PI / 2 + (k.r() - 0.5) * 2,
          len: 0.01,
          width: 0.0018,
        },
        {
          // trunks and the main limbs
          n: Math.round(n * 0.4),
          at: (k) => {
            const t = k.pick(trunks);
            const u = k.r();
            return [t.x + (k.r() - 0.5) * 0.004 * u, hy - t.h * u * 0.75];
          },
          color: (x, y, k) => jit(color, k, 2, 2),
          angle: (x, y, k) => -Math.PI / 2 + (k.r() - 0.5) * 1.1,
          len: 0.014,
          width: 0.0018,
        },
        {
          // limbs forking up and out off each trunk
          n: count * 8,
          at: (k) => {
            const t = k.pick(trunks);
            const u = 0.35 + k.r() * 0.45;
            const side = k.r() < 0.5 ? -1 : 1;
            const d = k.r() * t.h * 0.12;
            const p = [t.x + side * d * 0.5, hy - t.h * u - d * A * 0.6];
            p.push(side);
            return p;
          },
          color: (x, y, k) => jit(color, k, 2, 2),
          angle: (x, y, k) => -Math.PI / 2 + (k.r() < 0.5 ? -1 : 1) * (0.4 + k.r() * 0.5),
          len: height * 0.09,
          width: 0.0013,
        },
        {
          n: Math.round(n * 0.3),
          at: (k) => [x0 + k.r() * (x1 - x0), hy - k.r() * height * 0.12],
          color: (x, y, k) => jit(color, k, 2, 2),
          angle: (x, y, k) => (k.r() - 0.5) * 0.3,
          len: 0.02,
          width: 0.005,
        },
      ];
    }
    const edge = (x) => hy - height * (0.45 + 0.4 * prof(x) + 0.15 * fine(x));
    const lit = light || [color[0], color[1], color[2] + 8];
    // rounded crowns sitting along the top of the mass
    const crowns = [];
    for (let x = x0; x < x1; x += 0.006 + r() * 0.01) {
      const rad = height * (0.12 + r() * 0.16);
      crowns.push({ x, y: edge(x) + rad * A * 0.45, rad: rad * 0.9 });
    }
    return [
      {
        n,
        at: (k) => {
          const x = x0 + k.r() * (x1 - x0);
          const e = edge(x);
          return [x, e + Math.pow(k.r(), 0.8) * (hy + base - e)];
        },
        color: (x, y, k) => (light && k.r() < 0.22 && y < edge(x) + height * 0.4 ? jit(light, k, 6, 3) : jit(color, k, 8, 4)),
        angle: (x, y, k) => Math.PI / 2 + (k.r() - 0.5) * 0.9,
        len: 0.016,
        width: 0.008,
      },
      {
        n: Math.round(n * 0.6),
        at: (k) => {
          const c = k.pick(crowns);
          const a = k.r() * Math.PI * 2;
          const rr = Math.sqrt(k.r()) * c.rad;
          const p = [c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr * A * 0.8];
          // upper left of the crown catches the light
          p.push(Math.cos(a) * -0.6 + Math.sin(a) * -0.8 > 0.35 && rr > c.rad * 0.4);
          return p;
        },
        color: (x, y, k) => {
          const c = crowns.reduce((b, q) => (Math.abs(q.x - x) < Math.abs(b.x - x) ? q : b));
          const up = (c.y - y) / (c.rad * A * 0.8) + (c.x - x) / c.rad;
          if (up > 0.6 && k.r() < 0.7) return jit(lit, k, 5, 3);
          if (up < -0.6) return jit([color[0], color[1], color[2] - 4], k, 5, 2);
          return jit(color, k, 7, 3);
        },
        angle: (x, y, k) => (k.r() - 0.5) * 1.6,
        len: 0.007,
        width: 0.004,
        bend: 0.4,
      },
      {
        // a few trunks showing in the shade at the foot
        n: Math.round(count * 3),
        at: (k) => [x0 + k.r() * (x1 - x0), hy + base * 0.4 - k.r() * height * 0.25],
        color: (x, y, k) => [color[0], color[1] * 0.6, Math.max(4, color[2] - 8), 0.8],
        angle: () => Math.PI / 2,
        len: height * 0.12,
        width: 0.0014,
      },
    ];
  };

  // tall pines with crowns up top (loblolly, slash pine)
  K.pines = ({ seed, hy, x0 = 0, x1 = 1, count = 14, height = 0.3, color, trunk, n = 1600 }) => {
    const r = rng(seed);
    const pines = Array.from({ length: count }, () => {
      const p = { x: x0 + r() * (x1 - x0), h: height * (0.6 + r() * 0.5), w: 0.008 + r() * 0.008 };
      p.clumps = Array.from({ length: 3 + Math.floor(r() * 3) }, (_, i) => ({
        dx: (r() - 0.5) * p.w * 3,
        dy: -p.h + i * p.h * 0.09 + r() * 0.01,
        w: p.w * (0.7 + r() * 0.6),
      }));
      return p;
    });
    return [
      {
        n: count * 14,
        at: (k) => {
          const p = k.pick(pines);
          return [p.x + k.gauss() * 0.0008, hy - k.r() * p.h * 0.85];
        },
        color: (x, y, k) => jit(trunk, k, 2, 3),
        angle: () => Math.PI / 2,
        len: 0.016,
        width: 0.0022,
      },
      {
        n,
        at: (k) => {
          const p = k.pick(pines);
          const c = k.pick(p.clumps);
          const a = k.r() * Math.PI * 2;
          const rr = Math.sqrt(k.r());
          return [p.x + c.dx + Math.cos(a) * rr * c.w * 1.5, hy + c.dy + Math.sin(a) * rr * c.w * A * 0.45];
        },
        color: (x, y, k) => jit(color, k, 8, 5),
        angle: (x, y, k) => (k.r() - 0.5) * 1.2,
        len: 0.008,
        width: 0.004,
      },
    ];
  };

  // ground, either flat bands or laid toward a vanishing point
  K.ground = ({ y0, y1 = 1, colors, n = 2600, vp = null, len = [0.02, 0.07], width = [0.005, 0.018], light = 0, x0 = -0.05, x1 = 1.05 }) => ({
    n,
    at: (k) => [x0 + k.r() * (x1 - x0), y0 + Math.pow(k.r(), 0.85) * (y1 - y0)],
    color: (x, y, k) => {
      const d = clamp((y - y0) / (y1 - y0));
      const c = k.pick(colors);
      return jit([c[0], c[1], c[2] + (1 - d) * light, c[3]], k, 4, 3);
    },
    angle: (x, y, k) => (vp ? Math.atan2((vp[1] - y) / A, vp[0] - x) : 0) + (k.r() - 0.5) * (vp ? 0.15 : 0.12),
    len: (x, y) => lerp(len[0], len[1], clamp((y - y0) / (y1 - y0))),
    width: (x, y) => lerp(width[0], width[1], clamp((y - y0) / (y1 - y0))),
  });

  // still water: long flat strokes in the sky's colours, upside down and a little darker
  K.water = ({ y0, y1 = 1, stops, hy, n = 2200, dark = 6 }) => ({
    n,
    at: (k) => [k.r() * 1.06 - 0.03, y0 + Math.pow(k.r(), 0.8) * (y1 - y0)],
    color: (x, y, k) => {
      const mirror = clamp(hy - (y - y0) * 1.4, 0, hy);
      const c = ramp(stops, mirror);
      return jit([c[0], c[1] * 0.85, c[2] - dark], k, 3, 3);
    },
    angle: (x, y, k) => (k.r() - 0.5) * 0.04,
    len: (x, y) => 0.03 + clamp((y - y0) / (y1 - y0)) * 0.06,
    width: (x, y) => 0.003 + clamp((y - y0) / (y1 - y0)) * 0.008,
  });

  // the small lit ripples on the water, finer and closer together toward the far shore
  K.ripples = ({ y0, y1 = 1, stops, hy, n = 700, lift = 8 }) => ({
    n,
    at: (k) => [k.r() * 1.04 - 0.02, y0 + Math.pow(k.r(), 1.4) * (y1 - y0)],
    color: (x, y, k) => {
      const c = ramp(stops, clamp(hy - (y - y0) * 1.4, 0, hy));
      return [c[0], c[1] * 0.9, c[2] + lift + k.gauss() * 2, 0.55];
    },
    angle: (x, y, k) => (k.r() - 0.5) * 0.03,
    len: (x, y) => 0.006 + clamp((y - y0) / (y1 - y0)) * 0.03,
    width: (x, y) => 0.0008 + clamp((y - y0) / (y1 - y0)) * 0.0022,
  });

  // grass in tufts, small and dense at the back, long separate blades up front
  K.grass = ({ y0, y1 = 1, colors, n = 1600, x0 = -0.02, x1 = 1.02, tall = 0.03, alpha = 0.9 }) => ({
    n,
    at: (k) => [x0 + k.r() * (x1 - x0), y0 + Math.pow(k.r(), 0.6) * (y1 - y0)],
    color: (x, y, k) => {
      const c = k.pick(colors);
      return [c[0] + k.gauss() * 5, c[1], c[2] + k.gauss() * 4, alpha];
    },
    angle: (x, y, k) => -Math.PI / 2 + (k.r() - 0.5) * 0.9,
    len: (x, y) => 0.002 + clamp((y - y0) / (y1 - y0)) * tall,
    width: (x, y) => 0.0008 + clamp((y - y0) / (y1 - y0)) * 0.0025,
    bend: 0.4,
  });

  // one tree standing on its own: trunk, a few limbs, and a crown lit from the upper left
  K.tree = ({ x, base, h, w, color, light, trunk, n = 400 }) => {
    const cy = base - h * 0.62;
    const ry = h * 0.42;
    return [
      K.lines({ segs: [[x, base, x + w * 0.05, cy, Math.max(0.0012, w * 0.12), trunk]], reps: 3 }),
      {
        n,
        at: (k) => {
          const a = k.r() * Math.PI * 2;
          const rr = Math.sqrt(k.r());
          return [x + Math.cos(a) * rr * w, cy + Math.sin(a) * rr * ry];
        },
        color: (x2, y2, k) => {
          const up = (cy - y2) / ry + (x - x2) / w;
          if (up > 0.5 && k.r() < 0.75) return jit(light, k, 5, 3);
          if (up < -0.7) return jit([color[0], color[1], color[2] - 4], k, 4, 2);
          return jit(color, k, 6, 3);
        },
        angle: (x2, y2, k) => (k.r() - 0.5) * 1.6,
        len: w * 0.28,
        width: w * 0.16,
        bend: 0.4,
      },
    ];
  };

  // a light's broken reflection going straight down the water
  K.reflection = ({ x, y0, y1, color, spread = 0.012, n = 160 }) => ({
    n,
    at: (k) => {
      const t = Math.pow(k.r(), 0.7);
      return [x + k.gauss() * spread * (0.4 + t), y0 + t * (y1 - y0)];
    },
    color: (x2, y, k) => [color[0], color[1], color[2] + k.gauss() * 4, 0.35 + k.r() * 0.45],
    angle: (x2, y, k) => (k.r() - 0.5) * 0.06,
    len: 0.012,
    width: 0.0022,
  });

  const fill = (area, len, width) => Math.max(8, Math.round((1.8 * area) / (len * width * A)));
  K.rect = ({ x, y, w, h, color, n = null, vertical = false, len = 0.008, width = 0.004, alpha = 0.95 }) => ({
    n: n ?? fill(w * h, len, width),
    at: (k) => [x + k.r() * w, y + k.r() * h],
    color: (x2, y2, k) => jit(color, k, 2, 3),
    angle: (x2, y2, k) => (vertical ? Math.PI / 2 : 0) + (k.r() - 0.5) * 0.2,
    len,
    width,
    alpha,
  });

  K.tri = ({ pts, color, n = null, len = 0.008, width = 0.004, angle = 0 }) => ({
    n: n ?? fill(Math.abs((pts[1][0] - pts[0][0]) * (pts[2][1] - pts[0][1]) - (pts[2][0] - pts[0][0]) * (pts[1][1] - pts[0][1])) / 2, len, width),
    at: (k) => {
      let a = k.r();
      let b = k.r();
      if (a + b > 1) (a = 1 - a), (b = 1 - b);
      const [p, q, s] = pts;
      return [p[0] + (q[0] - p[0]) * a + (s[0] - p[0]) * b, p[1] + (q[1] - p[1]) * a + (s[1] - p[1]) * b];
    },
    color: (x, y, k) => jit(color, k, 2, 3),
    angle: (x, y, k) => angle + (k.r() - 0.5) * 0.25,
    len,
    width,
  });

  // a simple house: wall, gable roof, optional chimney and windows (lit or not)
  K.house = ({ x, y, w, h, roofH, wall, roof, side = null, windows = [], lit = null, chimney = false, n = 1 }) => {
    const out = [
      K.rect({ x, y, w, h, color: wall, vertical: true, len: 0.006, width: 0.003 }),
      K.tri({ pts: [[x - w * 0.06, y], [x + w * 1.06, y], [x + w / 2, y - roofH]], color: roof, len: 0.007, width: 0.003, angle: 0.4 }),
    ];
    // shadow under the eaves, and the near slope of the roof a little lighter
    out.push(K.rect({ x: x - w * 0.02, y, w: w * 1.04, h: h * 0.07, color: [wall[0], wall[1], Math.max(3, wall[2] * 0.62)], len: 0.004, width: 0.0018 }));
    out.push(K.tri({ pts: [[x - w * 0.04, y - roofH * 0.04], [x + w * 0.5, y - roofH], [x + w * 0.32, y - roofH * 0.2]], color: [roof[0], roof[1], roof[2] + 5], len: 0.005, width: 0.0022, angle: 0.4 }));
    if (side) out.push(K.rect({ x: x + w, y: y + h * 0.05, w: w * 0.35, h: h * 0.95, color: side, vertical: true, len: 0.005, width: 0.0025 }));
    if (chimney) out.push(K.rect({ x: x + w * 0.7, y: y - roofH * 0.8, w: w * 0.08, h: roofH * 0.55, color: roof, vertical: true, len: 0.004, width: 0.002 }));
    for (const [wx, wy, ww, wh] of windows) {
      const c = lit || [wall[0], wall[1], wall[2] - 12];
      out.push(K.rect({ x: x + wx * w, y: y + wy * h, w: ww * w, h: wh * h, color: c, len: 0.003, width: 0.0018 }));
      if (lit) out.push(K.glow({ x: x + (wx + ww / 2) * w, y: y + (wy + wh / 2) * h, r: 0.012, color: lit, n: 24, alpha: 0.12 }));
    }
    return out;
  };

  // a cluster of capsules: figures, wagons, a windlass, a boat
  K.parts = ({ parts, n = 500, len = 0.006, width = 0.003 }) => {
    const area = parts.map((p) => (Math.hypot(p.p1[0] - p.p0[0], (p.p1[1] - p.p0[1]) / A) + p.rad * 2) * p.rad);
    const total = area.reduce((a, b) => a + b, 0);
    const pick = (k) => {
      let t = k.r() * total;
      for (let i = 0; i < parts.length; i++) if ((t -= area[i]) <= 0) return parts[i];
      return parts[parts.length - 1];
    };
    return {
      n,
      at: (k) => {
        const c = pick(k);
        const t = k.r();
        const a = k.r() * Math.PI * 2;
        const rad = Math.sqrt(k.r()) * c.rad;
        const p = [c.p0[0] + (c.p1[0] - c.p0[0]) * t + Math.cos(a) * rad, c.p0[1] + (c.p1[1] - c.p0[1]) * t + Math.sin(a) * rad * A];
        p.push(c);
        return p;
      },
      color: (x, y, k) => {
        let best = parts[0];
        let bd = 9;
        for (const c of parts) {
          // distance to the capsule's segment, in width units
          const vx = c.p1[0] - c.p0[0];
          const vy = (c.p1[1] - c.p0[1]) / A;
          const wx = x - c.p0[0];
          const wy = (y - c.p0[1]) / A;
          const t = clamp((wx * vx + wy * vy) / (vx * vx + vy * vy || 1));
          const d = Math.hypot(wx - vx * t, wy - vy * t) - c.rad;
          if (d < bd) (bd = d), (best = c);
        }
        return jit(best.c, k, 2, 3);
      },
      angle: (x, y, k) => (k.r() - 0.5) * 3,
      len,
      width,
      alpha: 0.95,
    };
  };

  // straight lines: posts, masts, rope, a curb
  K.lines = ({ segs, reps = 4 }) => {
    const all = segs.flatMap((s) => Array.from({ length: reps }, () => s));
    let i = 0;
    return {
      n: all.length,
      fixed: true,
      at: () => {
        const s = all[i++ % all.length];
        return [(s[0] + s[2]) / 2, (s[1] + s[3]) / 2, s];
      },
      color: (x, y, k) => jit(all[(i - 1) % all.length][5], k, 2, 2),
      angle: () => {
        const s = all[(i - 1) % all.length];
        return angleOf(s[0], s[1], s[2], s[3]);
      },
      len: () => {
        const s = all[(i - 1) % all.length];
        return Math.hypot(s[2] - s[0], (s[3] - s[1]) / A) / 0.85;
      },
      width: () => all[(i - 1) % all.length][4],
      bend: 0.02,
    };
  };

  // soft light around a point
  K.glow = ({ x, y, r, color, n = 200, alpha = 0.1, len = null, width = null }) => ({
    n,
    at: (k) => {
      const a = k.r() * Math.PI * 2;
      const rr = Math.pow(k.r(), 1.5) * r;
      return [x + Math.cos(a) * rr, y + Math.sin(a) * rr * A];
    },
    color: (x2, y2, k) => [color[0] + k.gauss() * 4, color[1], color[2] + k.gauss() * 3, alpha],
    angle: (x2, y2, k) => k.r() * Math.PI,
    len: len ?? r * 0.35,
    width: width ?? r * 0.14,
    bend: 0.6,
  });

  // a fireball: glow, a tapering train that brightens toward the head, the head, and broken bits ahead of it
  K.fireball = ({ from, to, head = [54, 70, 95], train = [160, 30, 80], glow = [52, 50, 70], width = 0.012, frags = 0, glowR = 0.12, glowA = 0.08, n = 900 }) => {
    const ang = angleOf(from[0], from[1], to[0], to[1]);
    const pass = [
      K.glow({ x: to[0], y: to[1], r: glowR, color: glow, n: Math.round(n * 0.4), alpha: glowA }),
      {
        n,
        at: (k) => {
          const t = Math.pow(k.r(), 0.75);
          const w = width * (0.2 + t * 0.6);
          return [lerp(from[0], to[0], t) + Math.sin(ang) * k.gauss() * w, lerp(from[1], to[1], t) - Math.cos(ang) * k.gauss() * w * A, t];
        },
        color: (x, y, k) => {
          const t = clamp(Math.hypot(x - from[0], (y - from[1]) / A) / Math.hypot(to[0] - from[0], (to[1] - from[1]) / A));
          const c = mix(train, head, Math.pow(t, 2));
          return [c[0], c[1], c[2] + k.gauss() * 4, (0.08 + Math.pow(t, 1.5) * 0.7) * (0.5 + k.r() * 0.5)];
        },
        angle: (x, y, k) => ang + (k.r() - 0.5) * 0.05,
        len: 0.03,
        width: (x, y) => {
          const t = clamp(Math.hypot(x - from[0], (y - from[1]) / A) / Math.hypot(to[0] - from[0], (to[1] - from[1]) / A));
          return width * (0.08 + Math.pow(t, 1.4) * 0.5);
        },
      },
      {
        n: Math.round(n * 0.25),
        at: (k) => {
          const a = k.r() * Math.PI * 2;
          const rr = Math.sqrt(k.r()) * width * 0.9;
          return [to[0] + Math.cos(a) * rr, to[1] + Math.sin(a) * rr * A];
        },
        color: (x, y, k) => [head[0], head[1] * 0.6, Math.min(99, head[2] + 2), 0.95],
        angle: (x, y, k) => ang + (k.r() - 0.5) * 0.6,
        len: width * 0.9,
        width: width * 0.5,
      },
    ];
    if (frags) {
      const fr = rng(frags * 7 + 3);
      const bits = Array.from({ length: frags }, () => {
        const spread = (fr() - 0.5) * 0.7;
        const d = 0.006 + fr() * 0.022;
        return { a: ang + spread, d };
      });
      pass.push(
        K.lines({
          segs: bits.map((b) => {
            const x0 = to[0] + Math.cos(b.a) * 0.008;
            const y0 = to[1] + Math.sin(b.a) * 0.008 * A;
            return [x0, y0, x0 + Math.cos(b.a) * b.d, y0 + Math.sin(b.a) * b.d * A, 0.0016, [head[0], head[1] * 0.7, head[2] - 8]];
          }),
          reps: 2,
        }),
      );
    }
    return pass;
  };

  // a smoke train hanging in a daylight sky, drifting and widening along its length
  K.smoke = ({ path, width = 0.02, color, lit = null, n = 1400, seed = 5 }) => {
    const r = rng(seed);
    const wob = noise(r, 16);
    const at = (t) => {
      const f = t * (path.length - 1);
      const i = Math.min(path.length - 2, Math.floor(f));
      const u = f - i;
      return [lerp(path[i][0], path[i + 1][0], u), lerp(path[i][1], path[i + 1][1], u)];
    };
    return {
      n,
      at: (k) => {
        const t = k.r();
        const [x, y] = at(t);
        const w = width * (0.3 + (1 - t) * 1.2);
        return [x + k.gauss() * w * 0.3, y + (wob(t) - 0.5) * 0.03 + k.gauss() * w * A * 0.3, t];
      },
      color: (x, y, k) => (lit && k.r() < 0.3 ? jit(lit, k, 3, 3) : jit(color, k, 3, 4)),
      angle: (x, y, k) => -0.15 + (k.r() - 0.5) * 1.4,
      len: 0.016,
      width: 0.007,
      bend: 0.5,
      alpha: 0.55,
    };
  };

  // dirt or smoke thrown up from one spot
  K.plume = ({ x, y, h, w, color, n = 500, dark = null }) => ({
    n,
    at: (k) => {
      const u = Math.pow(k.r(), 0.8);
      return [x + k.gauss() * (w * 0.2 + u * w), y - u * h];
    },
    color: (x2, y2, k) => (dark && k.r() < 0.06 ? [...dark, 0.8] : jit(color, k, 3, 5)),
    angle: (x2, y2, k) => -Math.PI / 2 + (x2 - x) * 12 + (k.r() - 0.5) * 0.7,
    len: 0.01,
    width: 0.0045,
    bend: 0.4,
    alpha: 0.5,
  });

  // ---------- the scenes ----------
  const NIGHT = (top, mid, low, hy) => [
    [0, top],
    [hy * 0.55, mid],
    [hy + 0.02, low],
  ];

  const S = {};

  // small rounded things (stones, haycocks, puddles) each lit on its upper left
  const blobs = ({ list, n, len = 0.004, width = 0.0025, litDy = 0.5, alpha = 0.95 }) => {
    const area = list.map((b) => b.rx * b.ry);
    const total = area.reduce((a, b) => a + b, 0);
    let last = list[0];
    return {
      n,
      at: (k) => {
        let t = k.r() * total;
        let b = list[list.length - 1];
        for (let i = 0; i < list.length; i++) if ((t -= area[i]) <= 0) { b = list[i]; break; }
        last = b;
        const a = k.r() * Math.PI * 2;
        const rr = Math.sqrt(k.r());
        return [b.x + Math.cos(a) * rr * b.rx, b.y + Math.sin(a) * rr * b.ry];
      },
      color: (x, y, k) => {
        const b = last;
        const up = (b.y - y) / b.ry + ((b.x - x) / b.rx) * 0.6;
        if (b.lit && up > litDy) return jit(b.lit, k, 3, 2);
        if (b.dark && up < -0.6) return jit(b.dark, k, 3, 2);
        return jit(b.c, k, 3, 3);
      },
      angle: (x, y, k) => (last.flat ? (k.r() - 0.5) * 0.3 : (k.r() - 0.5) * 3),
      len,
      width,
      alpha,
    };
  };

  S.northport = (() => {
    const hy = 0.6;
    const sky = NIGHT([228, 42, 9], [224, 38, 15], [214, 28, 27], hy);
    const fb = { from: [0.86, 0.06], to: [0.37, 0.33] };
    const ink = [224, 26, 8];
    const rope = [224, 16, 16];
    const rim = [150, 26, 40]; // the fireball's green light catching the spars
    return {
      aspect: A,
      ground: [222, 30, 14],
      passes: [
        K.sky({ stops: sky, hy }),
        K.stars({ hy, n: 320, seed: 11 }),
        K.bands({ seed: 12, rows: [{ x0: 0.0, x1: 0.55, y: 0.46, h: 0.03, color: [220, 22, 20], lit: [214, 22, 30] }], n: 400 }),
        K.fireball({ ...fb, head: [80, 40, 94], train: [160, 32, 72], glow: [150, 30, 60], width: 0.012, frags: 6, glowR: 0.09, glowA: 0.025 }),
        K.hills({ seed: 13, hy, height: 0.07, color: [220, 22, 16], top: [216, 20, 22], x0: 0, x1: 0.62, bumps: 6 }),
        K.hills({ seed: 14, hy, height: 0.035, color: [222, 20, 19], x0: 0.55, x1: 1, bumps: 5 }),
        K.trees({ seed: 15, hy, height: 0.06, color: [200, 22, 11], light: [160, 18, 20], kind: "spruce", x0: 0, x1: 0.5, count: 50, n: 1700 }),
        // the shore rocks at the waterline, catching a little of the light
        blobs({
          list: Array.from({ length: 26 }, (_, i) => ({ x: 0.01 + i * 0.022 + Math.sin(i * 7.1) * 0.006, y: hy + 0.002, rx: 0.004 + (i % 3) * 0.002, ry: 0.004, c: [220, 16, 12], lit: [170, 16, 26] })),
          n: 200,
          len: 0.003,
          width: 0.002,
        }),
        K.water({ y0: hy, stops: sky, hy, dark: 4 }),
        K.ripples({ y0: hy + 0.004, stops: sky, hy, n: 1000, lift: 7 }),
        K.reflection({ x: 0.37, y0: hy + 0.01, y1: 0.98, color: [90, 30, 70], spread: 0.024, n: 300 }),
        K.reflection({ x: 0.37, y0: hy + 0.01, y1: 0.8, color: [80, 36, 86], spread: 0.008, n: 70 }),
        // a two-masted schooner riding at anchor, the kind that carried ballast
        K.parts({
          parts: [
            { p0: [0.662, 0.703], p1: [0.73, 0.703], rad: 0.0058, c: ink },
            { p0: [0.73, 0.7], p1: [0.744, 0.695], rad: 0.0034, c: ink },
            { p0: [0.654, 0.699], p1: [0.663, 0.701], rad: 0.0042, c: ink },
            { p0: [0.67, 0.696], p1: [0.69, 0.696], rad: 0.0022, c: [224, 22, 12] }, // deckhouse
          ],
          n: 260,
          len: 0.004,
          width: 0.0024,
        }),
        K.lines({
          segs: [
            [0.705, 0.7, 0.703, 0.575, 0.0017, ink], // foremast
            [0.68, 0.7, 0.677, 0.552, 0.0018, ink], // mainmast
            [0.742, 0.696, 0.775, 0.687, 0.0012, ink], // bowsprit
            [0.703, 0.578, 0.775, 0.687, 0.0006, rope], // forestay
            [0.677, 0.556, 0.703, 0.58, 0.0006, rope],
            [0.677, 0.556, 0.656, 0.698, 0.0006, rope], // backstay
            [0.68, 0.672, 0.642, 0.679, 0.0012, ink], // main boom
            [0.705, 0.676, 0.686, 0.679, 0.001, ink], // fore boom
            [0.678, 0.588, 0.655, 0.6, 0.001, ink], // gaffs
            [0.704, 0.603, 0.687, 0.613, 0.0009, ink],
          ],
          reps: 3,
        }),
        // sails furled along the booms, and the light along the side of the masts
        K.lines({
          segs: [
            [0.679, 0.668, 0.646, 0.674, 0.0028, [214, 10, 26]],
            [0.704, 0.672, 0.689, 0.675, 0.0022, [214, 10, 26]],
            [0.7035, 0.6, 0.7045, 0.69, 0.0005, rim],
            [0.6785, 0.57, 0.6795, 0.69, 0.0005, rim],
            [0.664, 0.699, 0.728, 0.699, 0.0008, rim],
          ],
          reps: 2,
        }),
        K.reflection({ x: 0.69, y0: 0.712, y1: 0.86, color: ink, spread: 0.02, n: 120 }),
      ],
    };
  })();

  S.saco = (() => {
    const hy = 0.62;
    const sky = [
      [0, [222, 32, 26]],
      [0.28, [216, 28, 40]],
      [0.46, [62, 26, 66]],
      [0.56, [24, 30, 66]],
      [0.64, [10, 26, 58]],
    ];
    // the wall, laid stone by stone across the meadow, bigger as it comes toward us
    const wallY = (x) => (x < 0.6 ? lerp(0.76, 0.72, x / 0.6) : lerp(0.72, 0.745, (x - 0.6) / 0.4));
    const r = rng(24);
    const stones = [];
    for (let x = -0.02; x < 1.03; ) {
      const s = 0.0045 + (wallY(x) - 0.7) * 0.09 + r() * 0.002;
      for (let row = 0; row < 3; row++) {
        const rx = s * (0.9 + r() * 0.6);
        stones.push({ x: x + (row % 2) * s * 0.8, y: wallY(x) - row * s * A * 0.9 + 0.004, rx, ry: s * A * 0.55, c: [30, 6, 30 + r() * 10], lit: [34, 18, 56], dark: [220, 10, 16] });
      }
      x += s * 1.7;
    }
    return {
      aspect: A,
      ground: [30, 16, 50],
      passes: [
        K.sky({ stops: sky, hy }),
        K.stars({ hy: 0.25, n: 50, seed: 21 }),
        K.bands({
          seed: 22,
          rows: [
            { x0: 0.05, x1: 0.6, y: 0.42, h: 0.02, color: [280, 14, 42], lit: [20, 34, 62] },
            { x0: 0.5, x1: 1, y: 0.5, h: 0.016, color: [270, 12, 40], lit: [26, 36, 64] },
          ],
          n: 600,
        }),
        K.fireball({ from: [0.74, 0.08], to: [0.47, 0.47], head: [60, 60, 95], train: [55, 30, 80], glow: [55, 40, 72], width: 0.008, glowR: 0.08, glowA: 0.025, n: 600 }),
        K.trees({ seed: 23, hy, height: 0.11, color: [20, 22, 16], light: [35, 30, 26], n: 2300 }),
        K.house({ x: 0.14, y: 0.5, w: 0.1, h: 0.12, roofH: 0.075, wall: [215, 10, 22], roof: [222, 14, 14], side: [215, 10, 17], chimney: true, windows: [[0.18, 0.3, 0.14, 0.24], [0.62, 0.3, 0.14, 0.24]], lit: [48, 70, 68] }),
        // the door, and lamplight falling out of the windows onto the grass
        K.rect({ x: 0.183, y: 0.565, w: 0.012, h: 0.055, color: [215, 12, 13], vertical: true, len: 0.004, width: 0.002 }),
        K.ground({ y0: hy, colors: [[75, 16, 22], [55, 18, 26], [90, 12, 30], [40, 20, 24]], light: 6 }),
        K.glow({ x: 0.17, y: 0.64, r: 0.035, color: [44, 50, 44], n: 80, alpha: 0.12 }),
        K.glow({ x: 0.215, y: 0.64, r: 0.035, color: [44, 50, 44], n: 80, alpha: 0.12 }),
        K.grass({ y0: hy + 0.02, colors: [[75, 18, 26], [55, 20, 22], [40, 22, 30], [90, 14, 34], [30, 24, 38]], n: 2400, tall: 0.045 }),
        blobs({ list: stones, n: 4200, len: 0.0045, width: 0.003 }),
        // tall grass growing up in front of the wall
        K.grass({ y0: 0.74, colors: [[75, 18, 22], [50, 22, 18], [90, 14, 30]], n: 900, tall: 0.05, alpha: 0.85 }),
      ],
    };
  })();

  S.laclede = (() => {
    const hy = 0.58;
    const sky = [
      [0, [208, 40, 62]],
      [0.4, [200, 30, 74]],
      [0.6, [50, 20, 84]],
    ];
    const post = [26, 24, 24];
    return {
      aspect: A,
      ground: [45, 22, 86],
      passes: [
        K.sky({ stops: sky, hy, flecks: [45, 25, 90] }),
        K.clouds({
          seed: 31,
          list: [
            { cx: 0.26, base: 0.27, w: 0.16, h: 0.15 },
            { cx: 0.72, base: 0.2, w: 0.2, h: 0.14 },
            { cx: 0.52, base: 0.44, w: 0.1, h: 0.05 },
          ],
          lit: [48, 40, 96],
          mid: [40, 16, 86],
          shade: [222, 12, 72],
        }),
        K.trees({ seed: 32, hy, height: 0.07, color: [110, 24, 26], light: [80, 30, 42], n: 1900 }),
        K.house({ x: 0.8, y: 0.53, w: 0.045, h: 0.05, roofH: 0.03, wall: [35, 12, 64], roof: [12, 20, 32], side: [35, 12, 54], windows: [[0.3, 0.3, 0.18, 0.3]] }),
        // the meadow mown, the hay already up in cocks
        K.ground({ y0: hy, colors: [[56, 34, 58], [62, 30, 52], [48, 36, 62], [80, 20, 46]], light: 10 }),
        K.grass({ y0: hy + 0.01, colors: [[52, 36, 62], [60, 30, 54], [45, 40, 68], [80, 24, 44]], n: 2600, tall: 0.016 }),
        // haycocks, sunlit on top, a shadow off to the right of each
        {
          n: 260,
          at: (k) => {
            const h = k.pick([[0.15, 0.645, 0.022], [0.235, 0.62, 0.014], [0.64, 0.635, 0.018], [0.9, 0.67, 0.028]]);
            return [h[0] + h[2] * 0.6 + k.r() * h[2] * 1.4, h[1] + k.gauss() * 0.003];
          },
          color: () => [70, 26, 36, 0.5],
          angle: () => 0,
          len: 0.008,
          width: 0.003,
        },
        blobs({
          list: [
            { x: 0.15, y: 0.635, rx: 0.022, ry: 0.03, c: [46, 40, 62], lit: [48, 50, 80], dark: [40, 34, 46] },
            { x: 0.235, y: 0.613, rx: 0.014, ry: 0.019, c: [46, 40, 62], lit: [48, 50, 80], dark: [40, 34, 46] },
            { x: 0.64, y: 0.626, rx: 0.018, ry: 0.024, c: [46, 40, 62], lit: [48, 50, 80], dark: [40, 34, 46] },
            { x: 0.9, y: 0.655, rx: 0.028, ry: 0.038, c: [46, 40, 62], lit: [48, 50, 80], dark: [40, 34, 46] },
          ],
          n: 1300,
          len: 0.005,
          width: 0.0022,
          litDy: 0.2,
        }),
        // the spoil heap of red clay from thirteen feet down, and the hole
        {
          n: 120,
          at: (k) => [0.47 + k.r() * 0.13, 0.802 + k.gauss() * 0.004],
          color: () => [70, 26, 30, 0.55],
          angle: () => 0,
          len: 0.012,
          width: 0.004,
        },
        blobs({
          list: [
            { x: 0.51, y: 0.785, rx: 0.065, ry: 0.024, c: [18, 38, 42], lit: [22, 44, 56], dark: [16, 36, 30] },
            { x: 0.515, y: 0.77, rx: 0.035, ry: 0.016, c: [20, 40, 48], lit: [24, 46, 60], dark: [16, 36, 34] },
          ],
          n: 1100,
          len: 0.007,
          width: 0.0035,
          litDy: 0.1,
        }),
        // loose clods round the foot of it
        {
          n: 120,
          at: (k) => [0.51 + k.gauss() * 0.06, 0.8 + k.gauss() * 0.01],
          color: (x, y, k) => (k.r() < 0.5 ? [18, 40, 34] : [22, 44, 52]),
          angle: (x, y, k) => k.r() * 3,
          len: 0.003,
          width: 0.0025,
        },
        K.parts({ parts: [{ p0: [0.36, 0.79], p1: [0.4, 0.792], rad: 0.012, c: [20, 30, 10] }], n: 140 }),
        // the ball of metal sitting up on the heap, crusted dark, a bit of shine on it
        blobs({ list: [{ x: 0.516, y: 0.743, rx: 0.0085, ry: 0.012, c: [220, 10, 12], lit: [210, 10, 34], dark: [220, 10, 8] }], n: 160, len: 0.003, width: 0.002, litDy: 0.5 }),
        // the windlass over the hole: posts, the drum with rope wound on, the crank, a bucket down the hole
        {
          n: 90,
          at: (k) => [0.36 + k.r() * 0.11, 0.802 + k.gauss() * 0.003],
          color: () => [70, 26, 30, 0.5],
          angle: () => -0.05,
          len: 0.01,
          width: 0.003,
        },
        K.lines({
          segs: [
            [0.345, 0.8, 0.355, 0.66, 0.003, post],
            [0.415, 0.8, 0.405, 0.66, 0.003, post],
            [0.335, 0.8, 0.352, 0.7, 0.002, post], // braces
            [0.425, 0.8, 0.408, 0.7, 0.002, post],
            [0.342, 0.665, 0.418, 0.665, 0.0055, [30, 26, 34]], // drum
            [0.36, 0.665, 0.4, 0.665, 0.0038, [40, 20, 56]], // rope wound on it
            [0.38, 0.667, 0.38, 0.772, 0.0009, [40, 18, 46]],
            [0.418, 0.665, 0.43, 0.65, 0.002, post], // crank arm
            [0.43, 0.65, 0.437, 0.652, 0.0024, post], // handle
            [0.355, 0.664, 0.356, 0.72, 0.0006, [44, 30, 60]], // light down the near post
          ],
          reps: 4,
        }),
        K.parts({ parts: [{ p0: [0.375, 0.772], p1: [0.385, 0.772], rad: 0.0045, c: [28, 22, 24] }], n: 50, len: 0.003, width: 0.002 }),
        // the fence rail they shoved in to mark it, pulled out and dropped in the stubble
        K.lines({ segs: [[0.58, 0.83, 0.7, 0.845, 0.0035, [32, 18, 38]], [0.58, 0.828, 0.7, 0.843, 0.001, [36, 20, 60]]], reps: 3 }),
        K.grass({ y0: 0.82, colors: [[52, 38, 60], [60, 30, 52], [45, 40, 70]], n: 700, tall: 0.022 }),
      ],
    };
  })();

  S.homestead = (() => {
    const hy = 0.63;
    const sky = NIGHT([230, 40, 10], [226, 34, 17], [222, 24, 30], hy);
    const fb = { from: [0.12, 0.05], to: [0.58, 0.34] };
    const snowRoof = [218, 22, 58];
    // fence posts poking out of the snow, running off toward the farms
    const posts = Array.from({ length: 11 }, (_, i) => {
      const t = i / 10;
      return { x: lerp(0.04, 0.66, Math.pow(t, 0.8)), y: lerp(0.95, hy + 0.035, Math.pow(t, 0.8)), h: lerp(0.07, 0.012, t) };
    });
    return {
      aspect: A,
      ground: [222, 26, 18],
      passes: [
        K.sky({ stops: sky, hy }),
        K.stars({ hy, n: 260, seed: 41 }),
        K.glow({ x: 0.58, y: 0.36, r: 0.4, color: [210, 24, 36], n: 700, alpha: 0.05 }),
        K.fireball({ ...fb, head: [58, 60, 96], train: [170, 30, 76], glow: [60, 40, 74], width: 0.015, frags: 14, glowR: 0.1, glowA: 0.025, n: 1100 }),
        K.trees({ seed: 42, hy, height: 0.05, color: [228, 18, 13], kind: "bare", count: 70, n: 1800 }),
        K.house({ x: 0.74, y: 0.585, w: 0.04, h: 0.045, roofH: 0.025, wall: [224, 14, 22], roof: snowRoof, windows: [[0.2, 0.35, 0.2, 0.3]], lit: [48, 70, 66] }),
        K.house({ x: 0.81, y: 0.59, w: 0.05, h: 0.04, roofH: 0.028, wall: [224, 14, 20], roof: snowRoof, windows: [[0.6, 0.35, 0.16, 0.3]], lit: [48, 70, 64] }),
        K.house({ x: 0.885, y: 0.592, w: 0.03, h: 0.038, roofH: 0.02, wall: [224, 14, 19], roof: [218, 20, 52] }),
        // stove smoke going straight up in the cold
        K.smoke({ path: [[0.766, 0.565], [0.768, 0.52], [0.775, 0.47]], width: 0.004, color: [220, 14, 34], n: 120, seed: 43 }),
        K.smoke({ path: [[0.85, 0.57], [0.852, 0.53], [0.86, 0.49]], width: 0.004, color: [220, 14, 33], n: 100, seed: 44 }),
        // snow, lit toward the fireball and blue in the shadows
        {
          n: 3200,
          at: (k) => [k.r() * 1.1 - 0.05, hy + Math.pow(k.r(), 0.85) * (1 - hy)],
          color: (x, y, k) => {
            const near = clamp(1 - Math.abs(x - 0.58) * 1.6);
            return jit(blend([222, 18, 40], [48, 18, 56], near * 0.6), k, 2, 2);
          },
          angle: (x, y, k) => (k.r() - 0.5) * 0.7,
          len: (x, y) => 0.008 + ((y - hy) / (1 - hy)) * 0.03,
          width: (x, y) => 0.004 + ((y - hy) / (1 - hy)) * 0.012,
        },
        {
          // the post shadows, thrown away from the fireball across the snow
          n: posts.length * 12,
          fixed: true,
          at: (k) => {
            const p = k.pick(posts);
            const u = k.r();
            return [p.x + (p.x < 0.58 ? -1 : 1) * u * p.h * 0.6, p.y + u * p.h * 0.15];
          },
          color: () => [226, 30, 22, 0.5],
          angle: (x) => (x < 0.58 ? -0.15 : 0.15),
          len: 0.006,
          width: 0.002,
        },
        K.lines({ segs: posts.map((p) => [p.x, p.y, p.x + 0.001, p.y - p.h, 0.0008 + p.h * 0.06, [224, 20, 12]]), reps: 3 }),
        K.lines({ segs: posts.map((p) => [p.x + 0.0012, p.y - p.h * 0.1, p.x + 0.0016, p.y - p.h * 0.95, 0.0004 + p.h * 0.01, [50, 24, 52]]), reps: 1 }),
        // and a little sparkle where the light catches the crust
        {
          n: 260,
          at: (k) => [0.58 + k.gauss() * 0.25, hy + 0.02 + Math.pow(k.r(), 0.7) * (1 - hy - 0.02)],
          color: (x, y, k) => [50, 40, 92, 0.6 + k.r() * 0.4],
          angle: (x, y, k) => k.r() * 3,
          len: 0.0014,
          width: 0.0012,
        },
      ],
    };
  })();

  S.rochester = (() => {
    const hy = 0.66;
    const sky = NIGHT([232, 38, 9], [228, 32, 15], [222, 22, 26], hy);
    return {
      aspect: A,
      ground: [228, 22, 12],
      passes: [
        K.sky({ stops: sky, hy }),
        K.stars({ hy, n: 300, seed: 51 }),
        K.bands({
          seed: 52,
          rows: [
            { x0: 0.0, x1: 0.4, y: 0.16, h: 0.03, color: [226, 20, 16], lit: [222, 22, 24] },
            { x0: 0.55, x1: 1.0, y: 0.52, h: 0.025, color: [226, 20, 18], lit: [222, 22, 26] },
          ],
          n: 500,
        }),
        // west-southwest to east-northeast, left to right, low over the county
        K.fireball({ from: [-0.02, 0.44], to: [0.78, 0.24], head: [60, 70, 96], train: [44, 30, 70], glow: [50, 46, 70], width: 0.014, frags: 18, glowR: 0.09, glowA: 0.025, n: 1400 }),
        K.trees({ seed: 53, hy, height: 0.06, color: [230, 18, 11], kind: "bare", count: 60, n: 1700 }),
        // the town off in the distance, a few windows still lit, the light on the roofs facing the fireball
        K.house({ x: 0.3, y: 0.632, w: 0.024, h: 0.028, roofH: 0.016, wall: [226, 14, 17], roof: [228, 14, 26] }),
        K.house({ x: 0.36, y: 0.625, w: 0.03, h: 0.035, roofH: 0.02, wall: [226, 14, 18], roof: [228, 14, 26], windows: [[0.3, 0.4, 0.25, 0.3]], lit: [46, 66, 62] }),
        K.house({ x: 0.4, y: 0.615, w: 0.025, h: 0.045, roofH: 0.03, wall: [226, 14, 17], roof: [228, 14, 24] }),
        K.rect({ x: 0.413, y: 0.56, w: 0.004, h: 0.03, color: [228, 14, 22], n: 12, vertical: true, len: 0.004, width: 0.002 }),
        K.tri({ pts: [[0.411, 0.562], [0.419, 0.562], [0.415, 0.535]], color: [228, 14, 24], len: 0.003, width: 0.0015, angle: Math.PI / 2 }),
        K.house({ x: 0.435, y: 0.628, w: 0.035, h: 0.032, roofH: 0.018, wall: [226, 14, 18], roof: [228, 14, 26], windows: [[0.6, 0.4, 0.2, 0.3]], lit: [46, 66, 60] }),
        K.house({ x: 0.48, y: 0.636, w: 0.022, h: 0.024, roofH: 0.014, wall: [226, 14, 17], roof: [228, 14, 25], windows: [[0.3, 0.4, 0.3, 0.3]], lit: [46, 60, 56] }),
        K.ground({ y0: hy, colors: [[30, 14, 16], [40, 12, 20], [220, 14, 18], [35, 16, 26]], light: 4 }),
        // corn stubble in rows, standing up out of the frozen ground
        {
          n: 2000,
          at: (k) => {
            const row = Math.floor(k.r() * 16);
            const t = Math.pow((row + k.r() * 0.3) / 16, 1.6);
            return [k.r() * 1.1 - 0.05, hy + 0.01 + t * (1 - hy)];
          },
          color: (x, y, k) => (k.r() < 0.3 ? [44, 20, 30] : [36, 16, 18 + k.r() * 6]),
          angle: (x, y, k) => -Math.PI / 2 + (k.r() - 0.5) * 0.5,
          len: (x, y) => 0.002 + ((y - hy) / (1 - hy)) * 0.016,
          width: (x, y) => 0.0008 + ((y - hy) / (1 - hy)) * 0.0024,
        },
      ],
    };
  })();

  S.newton = (() => {
    const hy = 0.64;
    const sky = NIGHT([230, 34, 10], [226, 28, 16], [218, 20, 26], hy);
    const rail = [228, 22, 6];
    // a rail fence coming toward us down the left side
    const fence = Array.from({ length: 7 }, (_, i) => {
      const t = i / 6;
      return { x: lerp(0.36, 0.0, t), y: lerp(0.672, 0.9, Math.pow(t, 1.3)), h: lerp(0.03, 0.12, Math.pow(t, 1.3)) };
    });
    const segs = [];
    fence.forEach((p, i) => {
      segs.push([p.x, p.y, p.x, p.y - p.h, 0.0012 + p.h * 0.02, rail]);
      const q = fence[i + 1];
      if (q) for (const f of [0.45, 0.8]) segs.push([p.x, p.y - p.h * f, q.x, q.y - q.h * f, 0.0008 + p.h * 0.012, rail]);
    });
    return {
      aspect: A,
      ground: [226, 20, 13],
      passes: [
        K.sky({ stops: sky, hy }),
        K.stars({ hy, n: 380, seed: 61 }),
        K.trees({ seed: 62, hy, height: 0.08, color: [228, 16, 10], kind: "bare", count: 34, n: 1900 }),
        K.trees({ seed: 63, hy: hy + 0.005, height: 0.24, color: [228, 16, 9], kind: "bare", count: 3, n: 900, x0: 0.62, x1: 0.78 }),
        // a lean-to shed off the side, then the house: door, porch, three dark windows
        K.rect({ x: 0.57, y: 0.585, w: 0.05, h: 0.065, color: [222, 14, 12], vertical: true, len: 0.005, width: 0.0025 }),
        K.tri({ pts: [[0.565, 0.588], [0.625, 0.6], [0.565, 0.565]], color: [226, 18, 8], len: 0.005, width: 0.0025, angle: 0.2 }),
        K.house({ x: 0.42, y: 0.5, w: 0.15, h: 0.15, roofH: 0.085, wall: [222, 14, 15], roof: [226, 18, 9], side: [222, 14, 11], chimney: true, windows: [[0.15, 0.3, 0.12, 0.25], [0.45, 0.3, 0.12, 0.25], [0.75, 0.3, 0.12, 0.25]] }),
        K.rect({ x: 0.47, y: 0.6, w: 0.018, h: 0.05, color: [222, 16, 9], vertical: true, len: 0.004, width: 0.002 }),
        K.rect({ x: 0.43, y: 0.592, w: 0.13, h: 0.006, color: [226, 16, 8], len: 0.006, width: 0.002 }), // porch roof
        K.lines({ segs: [0.435, 0.475, 0.515, 0.555].map((x) => [x, 0.598, x, 0.65, 0.0012, [222, 12, 20]]), reps: 2 }),
        // faint starlight along the roof ridge and the eaves
        K.lines({ segs: [[0.42, 0.502, 0.495, 0.418, 0.0008, [220, 14, 24]], [0.495, 0.418, 0.57, 0.502, 0.0006, [220, 14, 20]]], reps: 2 }),
        K.ground({ y0: hy, colors: [[32, 12, 18], [220, 12, 22], [40, 10, 24]], light: 6 }),
        // the path out from the door, worn pale
        {
          n: 500,
          at: (k) => {
            const t = Math.pow(k.r(), 0.8);
            return [lerp(0.479, 0.56, t) + k.gauss() * (0.004 + t * 0.03), lerp(0.652, 1.0, t)];
          },
          color: (x, y, k) => jit([218, 10, 32], k, 2, 2),
          angle: (x, y, k) => Math.atan2(0.35 / A, 0.08) + (k.r() - 0.5) * 0.3,
          len: (x, y) => 0.006 + (y - hy) * 0.06,
          width: (x, y) => 0.002 + (y - hy) * 0.02,
        },
        // dead grass, frost on the tips
        K.grass({ y0: hy + 0.01, colors: [[32, 14, 18], [40, 12, 22], [220, 12, 26], [215, 14, 32]], n: 2200, tall: 0.035 }),
        K.lines({ segs, reps: 3 }),
      ],
    };
  })();

  S.estherville = (() => {
    const hy = 0.62;
    const sky = [
      [0, [212, 36, 60]],
      [0.35, [205, 28, 72]],
      [0.55, [52, 30, 84]],
      [0.64, [40, 34, 80]],
    ];
    return {
      aspect: A,
      ground: [50, 24, 84],
      passes: [
        K.sky({ stops: sky, hy, flecks: [48, 36, 88] }),
        K.clouds({
          seed: 71,
          list: [
            { cx: 0.14, base: 0.4, w: 0.12, h: 0.08 },
            { cx: 0.86, base: 0.36, w: 0.16, h: 0.12 },
          ],
          lit: [44, 46, 92],
          mid: [36, 20, 82],
          shade: [228, 12, 64],
          n: 1300,
        }),
        // what people saw in daylight: the smoke it left, bending as it drifted
        K.smoke({ path: [[0.02, 0.06], [0.22, 0.15], [0.4, 0.27], [0.55, 0.41], [0.64, 0.53]], width: 0.022, color: [225, 8, 52], lit: [45, 26, 82], n: 1600, seed: 72 }),
        K.trees({ seed: 73, hy, height: 0.05, color: [120, 22, 28], light: [90, 30, 44], n: 1400, x0: 0.35, x1: 1 }),
        K.hills({ seed: 74, hy, height: 0.03, color: [100, 20, 46], x0: 0, x1: 0.4, bumps: 4 }),
        K.plume({ x: 0.655, y: hy, h: 0.08, w: 0.012, color: [30, 12, 60], n: 380 }),
        K.ground({ y0: hy, colors: [[90, 34, 46], [76, 36, 52], [100, 26, 40], [60, 30, 58]], light: 10 }),
        // a long swell of prairie, the late sun along its crest and shade behind it
        K.hills({ seed: 75, hy: 0.73, height: 0.035, color: [96, 28, 38], top: [62, 40, 62], x0: -0.02, x1: 1.02, bumps: 3, n: 900 }),
        K.ground({ y0: 0.73, colors: [[88, 34, 44], [74, 36, 50], [56, 32, 58], [100, 26, 38]], n: 1600, light: 4 }),
        // last year's dead grass still standing among the new
        K.grass({ y0: hy + 0.01, colors: [[90, 36, 46], [78, 36, 52], [48, 34, 66], [100, 28, 38], [42, 30, 72]], n: 3000, tall: 0.05 }),
        // a scatter of early flowers
        {
          n: 180,
          at: (k) => [k.r(), 0.7 + Math.pow(k.r(), 0.6) * 0.3],
          color: (x, y, k) => jit(k.pick([[300, 26, 74], [52, 70, 72], [0, 0, 94], [280, 30, 70]]), k, 3, 2),
          angle: (x, y, k) => k.r() * 3,
          len: (x, y) => 0.001 + (y - 0.7) * 0.008,
          width: (x, y) => 0.001 + (y - 0.7) * 0.006,
        },
      ],
    };
  })();

  S.schroon = (() => {
    // 10 at night under heavy cloud, "not a ray of starlight", and Granger up writing a letter by lamplight
    const hy = 0.52;
    const sky = [
      [0, [226, 14, 9]],
      [0.3, [224, 12, 12]],
      [0.55, [220, 12, 16]],
    ];
    const lamp = [44, 70, 62];
    return {
      aspect: A,
      ground: [222, 14, 10],
      passes: [
        K.sky({ stops: sky, hy, tilt: -0.02 }),
        K.bands({
          seed: 81,
          rows: [
            { x0: -0.1, x1: 0.7, y: 0.12, h: 0.09, color: [226, 10, 7], lit: [224, 10, 13] },
            { x0: 0.3, x1: 1.1, y: 0.3, h: 0.08, color: [226, 10, 8], lit: [224, 10, 14] },
            { x0: -0.05, x1: 0.5, y: 0.4, h: 0.05, color: [224, 10, 11], lit: [222, 10, 15] },
          ],
          n: 1800,
        }),
        K.hills({ seed: 82, hy: hy + 0.01, height: 0.24, color: [224, 12, 13], top: [222, 10, 17], x0: 0, x1: 1, bumps: 5, n: 1400 }),
        K.hills({ seed: 83, hy: hy + 0.02, height: 0.12, color: [214, 14, 9], x0: 0.3, x1: 1, bumps: 6, n: 1100 }),
        K.trees({ seed: 84, hy: hy + 0.03, height: 0.05, color: [190, 18, 7], kind: "spruce", x0: 0.3, x1: 1, count: 60, n: 1500 }),
        K.water({ y0: hy + 0.03, stops: sky, hy, dark: 3 }),
        K.ripples({ y0: hy + 0.035, stops: sky, hy, n: 600, lift: 3 }),
        // low mist lying on the lake under the far shore
        {
          n: 260,
          at: (k) => [k.r() * 1.1 - 0.05, hy + 0.05 + k.gauss() * 0.02],
          color: () => [220, 8, 15, 0.12],
          angle: (x, y, k) => (k.r() - 0.5) * 0.05,
          len: 0.06,
          width: 0.006,
        },
        K.ground({ y0: 0.82, colors: [[150, 14, 8], [200, 12, 7], [40, 10, 10]], n: 800, x0: -0.05, x1: 0.42 }),
        K.trees({ seed: 85, hy: 0.84, height: 0.3, color: [180, 18, 6], kind: "spruce", x0: 0.0, x1: 0.12, count: 5, n: 800 }),
        K.house({ x: 0.15, y: 0.71, w: 0.12, h: 0.1, roofH: 0.06, wall: [30, 8, 14], roof: [222, 14, 8], side: [30, 8, 11], windows: [[0.2, 0.3, 0.12, 0.3], [0.6, 0.3, 0.12, 0.3]], lit: lamp }),
        // lamplight falling out of the windows onto the ground and the porch boards
        K.glow({ x: 0.18, y: 0.83, r: 0.03, color: [40, 40, 30], n: 90, alpha: 0.14 }),
        K.glow({ x: 0.228, y: 0.83, r: 0.03, color: [40, 40, 30], n: 90, alpha: 0.14 }),
        K.lines({
          segs: [
            [0.15, 0.81, 0.27, 0.81, 0.003, [30, 8, 10]],
            [0.27, 0.81, 0.36, 0.83, 0.003, [30, 8, 12]],
            [0.36, 0.83, 0.36, 0.86, 0.0016, [30, 8, 10]],
            [0.152, 0.808, 0.268, 0.808, 0.0008, [40, 30, 26]],
          ],
          reps: 3,
        }),
        // shore stones at the water's edge, lamplight on their tops
        blobs({
          list: Array.from({ length: 14 }, (_, i) => ({ x: 0.0 + i * 0.03 + Math.sin(i * 5.3) * 0.006, y: 0.845 + Math.sin(i * 2.7) * 0.006, rx: 0.006 + (i % 3) * 0.002, ry: 0.007, c: [220, 10, 9], lit: i > 4 && i < 10 ? [36, 24, 22] : [220, 10, 13] })),
          n: 300,
        }),
        K.reflection({ x: 0.18, y0: 0.85, y1: 0.97, color: [44, 60, 50], spread: 0.014, n: 70 }),
        K.reflection({ x: 0.228, y0: 0.85, y1: 0.97, color: [44, 60, 50], spread: 0.014, n: 70 }),
      ],
    };
  })();

  S["st-joseph"] = (() => {
    const hy = 0.6;
    const sky = [
      [0, [214, 34, 48]],
      [0.3, [208, 28, 64]],
      [0.5, [52, 34, 80]],
      [0.62, [36, 40, 76]],
    ];
    return {
      aspect: A,
      ground: [48, 30, 70],
      passes: [
        K.sky({ stops: sky, hy }),
        K.bands({
          seed: 91,
          rows: [
            { x0: 0.1, x1: 0.7, y: 0.3, h: 0.025, color: [280, 10, 62], lit: [40, 40, 84] },
            { x0: 0.45, x1: 1, y: 0.46, h: 0.02, color: [290, 10, 60], lit: [36, 44, 80] },
          ],
          n: 700,
        }),
        K.trees({ seed: 92, hy, height: 0.06, color: [130, 24, 22], light: [80, 30, 40], n: 1500 }),
        K.tree({ x: 0.75, base: hy + 0.012, h: 0.2, w: 0.035, color: [130, 26, 18], light: [70, 34, 38], trunk: [30, 20, 16], n: 700 }),
        // wheat nearly ready, laid toward the far trees
        K.ground({ y0: hy, colors: [[48, 40, 60], [52, 34, 52], [70, 26, 46], [42, 38, 66]], light: 8 }),
        {
          // heads of wheat standing up out of it, the evening light on their tops
          n: 2400,
          at: (k) => [k.r(), hy + 0.03 + Math.pow(k.r(), 0.7) * (1 - hy - 0.03)],
          color: (x, y, k) => jit(k.r() < 0.2 ? [40, 60, 78] : k.pick([[46, 44, 74], [44, 50, 66], [52, 36, 58]]), k, 3, 3),
          angle: (x, y, k) => -Math.PI / 2 + (k.r() - 0.5) * 0.5,
          len: (x, y) => 0.006 + ((y - hy) / (1 - hy)) * 0.03,
          width: (x, y) => 0.0015 + ((y - hy) / (1 - hy)) * 0.004,
        },
        {
          // the near heads, big enough to see the kernels and the awns
          n: 900,
          at: (k) => [k.r(), 0.86 + k.r() * 0.16],
          color: (x, y, k) => jit(k.r() < 0.35 ? [42, 62, 74] : [46, 48, 62], k, 3, 3),
          angle: (x, y, k) => -Math.PI / 2 + 0.25 + (k.r() - 0.5) * 0.4,
          len: 0.012,
          width: 0.0042,
          bend: 0.2,
        },
        {
          n: 1200,
          at: (k) => [k.r(), 0.84 + k.r() * 0.16],
          color: (x, y, k) => [46, 40, 72, 0.6],
          angle: (x, y, k) => -Math.PI / 2 + 0.2 + (k.r() - 0.5) * 0.7,
          len: 0.014,
          width: 0.0008,
        },
      ],
    };
  })();

  S.amsterdam = (() => {
    const hy = 0.58;
    const vp = [0.52, 0.56];
    const sky = [
      [0, [220, 10, 64]],
      [0.4, [215, 8, 72]],
      [0.6, [40, 10, 78]],
    ];
    // facades stepping down the street toward the vanishing point, brick and painted clapboard,
    // each with a cornice, windows with stone sills, and a shopfront at the bottom
    const facades = (side) => {
      const out = [];
      const xs = side < 0 ? [0.0, 0.12, 0.22, 0.3, 0.36, 0.41, 0.45] : [1.0, 0.88, 0.78, 0.7, 0.64, 0.6, 0.57];
      const cols = [[12, 30, 34], [16, 26, 40], [220, 8, 40], [10, 30, 30], [30, 14, 46], [14, 26, 38]];
      for (let i = 0; i < xs.length - 1; i++) {
        const xa = xs[i];
        const xb = xs[i + 1];
        const scale = Math.abs(xa - vp[0]) / 0.52;
        const top = vp[1] - 0.5 * scale - (i % 2) * 0.03 * scale;
        const bot = vp[1] + 0.32 * scale;
        const x = Math.min(xa, xb);
        const w = Math.abs(xb - xa);
        const H = bot - top;
        const col = cols[i % cols.length];
        const sz = 0.006 * scale + 0.002;
        out.push(K.rect({ x, y: top, w, h: H, color: col, len: sz, width: sz * 0.5 }));
        // courses of brick, or the clapboard lines
        out.push({
          n: Math.round(80 + 500 * scale),
          at: (k) => [x + k.r() * w, top + Math.floor(k.r() * 26) * (H / 26) + H * 0.02],
          color: () => [col[0], col[1] * 0.6, col[2] + 9, 0.5],
          angle: () => 0,
          len: sz * 1.4,
          width: 0.0008 + scale * 0.0008,
        });
        // the cornice: a dark band with light on its top edge
        out.push(K.rect({ x: x - w * 0.02, y: top - H * 0.015, w: w * 1.04, h: H * 0.04, color: [col[0], col[1], col[2] - 14], len: sz, width: sz * 0.4 }));
        out.push(K.rect({ x: x - w * 0.02, y: top - H * 0.018, w: w * 1.04, h: H * 0.008, color: [40, 8, 70], len: sz, width: sz * 0.25 }));
        // two or three columns of windows on the upper floors
        const ncol = w > 0.07 ? 3 : 2;
        for (let r = 0; r < 3; r++)
          for (let c = 0; c < ncol; c++) {
            const wx = x + w * (0.12 + c * (0.76 / ncol)) + w * 0.03;
            const ww = w * (0.76 / ncol) * 0.62;
            const wy = top + H * (0.1 + r * 0.17);
            const wh = H * 0.1;
            out.push(K.rect({ x: wx, y: wy, w: ww, h: wh, color: [215, 14, 20], len: sz * 0.5, width: sz * 0.3 }));
            out.push(K.rect({ x: wx + ww * 0.1, y: wy + wh * 0.08, w: ww * 0.8, h: wh * 0.3, color: [212, 10, 48], len: sz * 0.4, width: sz * 0.2, alpha: 0.5 })); // sky in the glass
            out.push(K.rect({ x: wx - ww * 0.12, y: wy + wh, w: ww * 1.24, h: H * 0.012, color: [40, 10, 72], len: sz * 0.5, width: sz * 0.2 })); // sill
          }
        // the shopfront: big dark window, a door, an awning shadow
        out.push(K.rect({ x: x + w * 0.08, y: top + H * 0.66, w: w * 0.5, h: H * 0.22, color: [215, 16, 16], len: sz * 0.6, width: sz * 0.3 }));
        out.push(K.rect({ x: x + w * 0.66, y: top + H * 0.64, w: w * 0.18, h: H * 0.34, color: [20, 20, 14], vertical: true, len: sz * 0.5, width: sz * 0.3 }));
        out.push(K.rect({ x: x + w * 0.04, y: top + H * 0.62, w: w * 0.92, h: H * 0.025, color: [col[0], col[1], col[2] - 16], len: sz, width: sz * 0.3 }));
      }
      return out;
    };
    // curbs, gas lamps and telegraph poles running toward the vanishing point on each side
    const toVP = (x0, y0, t) => [lerp(x0, vp[0], t), lerp(y0, vp[1] + 0.02, t)];
    const lamps = [0.18, 0.4, 0.62].map((t) => toVP(-0.05, 0.98, t));
    const lampsR = [0.2, 0.45].map((t) => toVP(1.08, 0.97, t));
    return {
      aspect: A,
      ground: [40, 10, 70],
      passes: [
        K.sky({ stops: sky, hy, tilt: -0.02 }),
        K.bands({ seed: 101, rows: [{ x0: -0.1, x1: 1.1, y: 0.18, h: 0.08, color: [222, 8, 58], lit: [215, 6, 70] }], n: 900 }),
        facades(-1),
        facades(1),
        // the street and sidewalks
        K.ground({ y0: vp[1] + 0.01, colors: [[30, 12, 44], [35, 10, 50], [220, 6, 46], [28, 14, 38]], light: 8, len: [0.01, 0.05], width: [0.004, 0.016] }),
        // wheel ruts in the mud, running up the street
        {
          n: 1400,
          at: (k) => {
            const rut = k.pick([-0.2, -0.12, 0.1, 0.2]);
            const t = Math.pow(k.r(), 0.8);
            return [vp[0] + rut * t * 1.6 + k.gauss() * 0.002 * t, vp[1] + 0.02 + t * (1 - vp[1] - 0.02)];
          },
          color: (x, y, k) => (k.r() < 0.4 ? [30, 14, 30] : [215, 8, 58]),
          angle: (x, y, k) => Math.atan2((vp[1] - y) / A, vp[0] - x),
          len: (x, y) => 0.006 + (y - vp[1]) * 0.08,
          width: (x, y) => 0.0008 + (y - vp[1]) * 0.006,
        },
        // a puddle holding the sky
        blobs({ list: [{ x: 0.36, y: 0.79, rx: 0.06, ry: 0.016, c: [215, 8, 62], lit: [215, 6, 70], dark: [30, 12, 36], flat: true }], n: 260, len: 0.012, width: 0.002 }),
        K.lines({
          segs: [
            [-0.05, 0.98, vp[0] - 0.03, vp[1] + 0.03, 0.003, [220, 6, 30]], // curbs
            [1.08, 0.97, vp[0] + 0.03, vp[1] + 0.03, 0.003, [220, 6, 30]],
            ...lamps.map(([x, y], i) => [x, y, x, y - (0.2 - i * 0.06), 0.002 - i * 0.0005, [220, 12, 12]]),
            ...lampsR.map(([x, y], i) => [x, y, x, y - (0.2 - i * 0.07), 0.002 - i * 0.0006, [220, 12, 12]]),
            // a telegraph line running off up the street
            [0.95, 0.98, 0.95, 0.12, 0.004, [24, 18, 18]],
            [0.93, 0.15, 0.97, 0.15, 0.0025, [24, 18, 18]],
            [0.93, 0.15, vp[0] + 0.06, vp[1] - 0.16, 0.0006, [220, 10, 22]],
            [0.97, 0.15, vp[0] + 0.07, vp[1] - 0.15, 0.0006, [220, 10, 22]],
          ],
          reps: 3,
        }),
        // the lamp heads
        K.parts({ parts: [...lamps, ...lampsR].map(([x, y], i) => ({ p0: [x, y - (i < 3 ? 0.2 - i * 0.06 : 0.2 - (i - 3) * 0.07)], p1: [x, y - (i < 3 ? 0.2 - i * 0.06 : 0.2 - (i - 3) * 0.07) - 0.012], rad: 0.005 - (i % 3) * 0.001, c: [215, 10, 22] })), n: 120, len: 0.003, width: 0.002 }),
        // a wagon going away up the street, and the stone that came off it
        K.parts({
          parts: [
            { p0: [0.495, 0.6], p1: [0.535, 0.6], rad: 0.01, c: [20, 26, 22] },
            { p0: [0.5, 0.615], p1: [0.5, 0.615], rad: 0.007, c: [20, 18, 14] },
            { p0: [0.53, 0.615], p1: [0.53, 0.615], rad: 0.007, c: [20, 18, 14] },
            { p0: [0.51, 0.585], p1: [0.52, 0.565], rad: 0.006, c: [22, 30, 20] },
          ],
          n: 260,
          len: 0.004,
          width: 0.0025,
        }),
        // the stone: a shadow under it, then the stone, lit on its top from the grey sky
        {
          n: 200,
          at: (k) => [0.65 + k.gauss() * 0.06, 0.88 + k.gauss() * 0.01],
          color: () => [30, 14, 24, 0.5],
          angle: () => 0,
          len: 0.02,
          width: 0.005,
        },
        blobs({ list: [{ x: 0.65, y: 0.84, rx: 0.065, ry: 0.06, c: [220, 6, 32], lit: [214, 6, 52], dark: [222, 8, 22] }], n: 900, len: 0.009, width: 0.0045, litDy: 0.35 }),
        K.parts({ parts: [{ p0: [0.57, 0.9], p1: [0.74, 0.9], rad: 0.006, c: [30, 14, 24] }], n: 120, len: 0.02, width: 0.004 }),
      ],
    };
  })();

  S.middleburg = (() => {
    const hy = 0.6;
    const vp = [0.46, 0.6];
    const sky = [
      [0, [222, 14, 40]],
      [0.3, [205, 26, 66]],
      [0.6, [46, 26, 84]],
    ];
    // palmetto clumps along the verges: fans of stiff fronds
    const r = rng(116);
    const fans = [];
    for (const [xa, xb] of [[-0.04, 0.3], [0.62, 1.04]])
      for (let i = 0; i < 22; i++) {
        const y = hy + 0.02 + Math.pow(r(), 1.2) * 0.2;
        const s = 0.012 + (y - hy) * 0.18;
        fans.push({ x: xa + r() * (xb - xa), y, s });
      }
    fans.sort((a, b) => a.y - b.y);
    return {
      aspect: A,
      ground: [44, 20, 80],
      passes: [
        K.sky({ stops: sky, hy }),
        // the storm moving off to the east, breaking up
        K.clouds({
          seed: 111,
          list: [
            { cx: 0.12, base: 0.32, w: 0.22, h: 0.22 },
            { cx: 0.45, base: 0.2, w: 0.2, h: 0.14 },
          ],
          lit: [222, 10, 70],
          mid: [228, 12, 50],
          shade: [232, 14, 34],
          n: 2400,
        }),
        K.clouds({ seed: 112, list: [{ cx: 0.82, base: 0.4, w: 0.12, h: 0.07 }], lit: [46, 34, 95], mid: [40, 14, 84], shade: [220, 12, 66], n: 700 }),
        K.trees({ seed: 113, hy, height: 0.05, color: [120, 20, 30], light: [80, 26, 44], n: 1300 }),
        K.pines({ seed: 114, hy, x0: 0, x1: 0.32, count: 8, height: 0.42, color: [130, 26, 22], trunk: [24, 22, 26] }),
        K.pines({ seed: 115, hy, x0: 0.62, x1: 1, count: 9, height: 0.38, color: [125, 24, 24], trunk: [24, 22, 28] }),
        K.ground({ y0: hy - 0.01, y1: 0.8, colors: [[110, 30, 30], [100, 28, 36], [130, 22, 26]], n: 1400, len: [0.012, 0.03], width: [0.003, 0.007], x0: -0.05, x1: 0.34 }),
        K.ground({ y0: hy - 0.01, y1: 0.8, colors: [[110, 30, 30], [100, 28, 36], [130, 22, 26]], n: 1400, len: [0.012, 0.03], width: [0.003, 0.007], x0: 0.6, x1: 1.05 }),
        // the sand road, wet and pale, toward the trees
        K.ground({ y0: 0.7, colors: [[90, 22, 34], [70, 24, 40], [110, 20, 30], [40, 22, 46]], n: 2200, light: 4 }),
        {
          n: 2400,
          at: (k) => {
            const t = Math.pow(k.r(), 0.8);
            const y = hy + t * (1 - hy);
            const half = 0.012 + t * 0.34;
            return [vp[0] + 0.01 + (k.r() - 0.5) * 2 * half, y];
          },
          color: (x, y, k) => (k.r() < 0.07 ? [205, 18, 56, 0.8] : jit(k.pick([[38, 20, 60], [34, 18, 52], [42, 16, 66]]), k, 3, 3)),
          angle: (x, y, k) => Math.atan2((vp[1] - y) / A, vp[0] - x) + (k.r() - 0.5) * 0.3,
          len: (x, y) => 0.01 + ((y - hy) / (1 - hy)) * 0.06,
          width: (x, y) => 0.004 + ((y - hy) / (1 - hy)) * 0.014,
        },
        // the sand darker and wetter along the ruts
        {
          n: 900,
          at: (k) => {
            const side = k.r() < 0.5 ? 0 : 1;
            const t = Math.pow(k.r(), 0.8);
            const xs = side ? [vp[0] + 0.015, 0.66] : [vp[0] + 0.005, 0.3];
            return [lerp(xs[0], xs[1], t) + k.gauss() * (0.002 + t * 0.012), hy + 0.01 + t * (1 - hy - 0.01)];
          },
          color: (x, y, k) => jit([34, 22, 44], k, 3, 3),
          angle: (x, y, k) => Math.atan2((vp[1] - y) / A, vp[0] - x),
          len: (x, y) => 0.008 + ((y - hy) / (1 - hy)) * 0.04,
          width: (x, y) => 0.002 + ((y - hy) / (1 - hy)) * 0.008,
          alpha: 0.6,
        },
        K.lines({
          segs: [
            [vp[0] + 0.005, hy + 0.01, 0.3, 1.0, 0.004, [30, 20, 40]],
            [vp[0] + 0.015, hy + 0.01, 0.66, 1.0, 0.004, [30, 20, 40]],
          ],
          reps: 6,
        }),
        // rain standing in the ruts, holding the clearing sky
        blobs({
          list: [
            { x: 0.36, y: 0.75, rx: 0.025, ry: 0.008, c: [208, 24, 68], lit: [205, 20, 78], dark: [36, 20, 40], flat: true },
            { x: 0.6, y: 0.79, rx: 0.03, ry: 0.009, c: [208, 24, 66], lit: [46, 30, 86], dark: [36, 20, 40], flat: true },
            { x: 0.3, y: 0.93, rx: 0.05, ry: 0.014, c: [208, 22, 62], lit: [205, 20, 74], dark: [36, 20, 40], flat: true },
            { x: 0.43, y: 0.66, rx: 0.012, ry: 0.004, c: [208, 24, 70], lit: [205, 20, 80], dark: [36, 20, 40], flat: true },
          ],
          n: 520,
          len: 0.01,
          width: 0.0018,
          litDy: 0.2,
        }),
        // the palmettos, back to front
        {
          n: fans.length * 70,
          fixed: true,
          at: (k) => {
            const f = k.pick(fans);
            const a = -Math.PI / 2 + (k.r() - 0.5) * 2.6;
            const t = 0.3 + k.r() * 0.7;
            const p = [f.x + Math.cos(a) * f.s * t, f.y + Math.sin(a) * f.s * t * A * 0.7];
            return p;
          },
          color: (x, y, k) => (k.r() < 0.25 ? jit([90, 30, 44], k, 4, 3) : jit(k.pick([[120, 28, 24], [130, 24, 20], [105, 26, 30]]), k, 5, 3)),
          angle: (x, y, k, e) => {
            const f = fans.reduce((b, q) => (Math.hypot(q.x - x, (q.y - y) / A) < Math.hypot(b.x - x, (b.y - y) / A) ? q : b));
            return Math.atan2((y - f.y) / A, x - f.x);
          },
          len: (x, y) => 0.004 + (y - hy) * 0.06,
          width: (x, y) => 0.0012 + (y - hy) * 0.008,
        },
        // the stone in the road, broken in two, half down in the dent it seemed to make
        {
          n: 160,
          at: (k) => [0.5 + k.gauss() * 0.06, 0.845 + k.gauss() * 0.008],
          color: () => [34, 24, 32, 0.6],
          angle: () => 0,
          len: 0.016,
          width: 0.004,
        },
        blobs({
          list: [
            { x: 0.48, y: 0.825, rx: 0.045, ry: 0.035, c: [16, 44, 30], lit: [22, 46, 44], dark: [14, 40, 20] },
            { x: 0.58, y: 0.85, rx: 0.012, ry: 0.011, c: [18, 42, 28], lit: [22, 44, 42], dark: [14, 40, 20] },
          ],
          n: 800,
          len: 0.007,
          width: 0.0035,
          litDy: 0.3,
        }),
        // the little white crystals all over it
        {
          n: 140,
          at: (k) => {
            const a = k.r() * Math.PI * 2;
            const rr = Math.sqrt(k.r());
            return k.r() < 0.85 ? [0.48 + Math.cos(a) * rr * 0.042, 0.825 + Math.sin(a) * rr * 0.032] : [0.58 + Math.cos(a) * rr * 0.011, 0.85 + Math.sin(a) * rr * 0.01];
          },
          color: (x, y, k) => [40, 20, 88 + k.gauss() * 3, 0.85],
          angle: (x, y, k) => k.r() * 3,
          len: 0.0016,
          width: 0.0013,
        },
        // wet sand thrown up around the dent
        {
          n: 160,
          at: (k) => {
            const a = Math.PI * (0.05 + k.r() * 0.9);
            return [0.48 + Math.cos(a) * 0.05 * (0.9 + k.r() * 0.3), 0.835 + Math.sin(a) * 0.012];
          },
          color: (x, y, k) => jit([36, 24, 50], k, 3, 3),
          angle: (x, y, k) => (k.r() - 0.5) * 0.6,
          len: 0.006,
          width: 0.003,
        },
      ],
    };
  })();

  S.jonesboro = (() => {
    const hy = 0.62;
    const sky = [
      [0, [226, 32, 22]],
      [0.3, [220, 28, 36]],
      [0.5, [50, 20, 60]],
      [0.6, [16, 22, 56]],
    ];
    // an orchard on the near slope, rows of small trees getting bigger toward us
    const trees = [];
    for (let row = 0; row < 4; row++) {
      const t = row / 3;
      const base = hy + 0.07 + Math.pow(t, 1.4) * 0.27;
      const h = 0.035 + t * 0.085;
      const gap = 0.06 + t * 0.14;
      for (let x = 0.02 + (row % 2) * gap * 0.5; x < 1.04; x += gap) trees.push({ x, base, h, w: h * 0.26 });
    }
    return {
      aspect: A,
      ground: [30, 16, 32],
      passes: [
        K.sky({ stops: sky, hy }),
        K.stars({ hy: 0.3, n: 70, seed: 121 }),
        K.fireball({ from: [0.3, 0.1], to: [0.6, 0.44], head: [62, 60, 94], train: [60, 26, 76], glow: [55, 36, 66], width: 0.007, glowR: 0.07, glowA: 0.025, n: 500 }),
        K.hills({ seed: 122, hy: hy + 0.01, height: 0.16, color: [230, 16, 26], top: [240, 12, 32], bumps: 4, n: 1300 }),
        K.hills({ seed: 123, hy: hy + 0.02, height: 0.09, color: [220, 18, 18], top: [225, 16, 22], bumps: 6, n: 1100 }),
        K.trees({ seed: 124, hy: hy + 0.02, height: 0.05, color: [20, 18, 12], kind: "bare", count: 40, n: 1200 }),
        K.ground({ y0: hy + 0.02, colors: [[30, 16, 22], [40, 14, 26], [220, 10, 22]], light: 5 }),
        K.grass({ y0: hy + 0.04, colors: [[30, 16, 22], [40, 16, 26], [220, 12, 24], [45, 20, 32]], n: 1800, tall: 0.03 }),
        // the orchard rows, a darker strip of mown grass under each
        {
          n: 800,
          at: (k) => {
            const t = k.pick(trees);
            return [t.x + k.gauss() * t.w * 1.6, t.base + k.gauss() * 0.003];
          },
          color: () => [24, 18, 14, 0.6],
          angle: () => 0,
          len: 0.012,
          width: 0.003,
        },
        trees.map((t) => K.tree({ x: t.x, base: t.base, h: t.h, w: t.w, color: [24, 18, 14], light: [40, 20, 32], trunk: [24, 16, 10], n: Math.round(40 + t.h * 1400) })),
      ],
    };
  })();

  // a person mid-stride, about seven and a half heads tall, walking right with a lantern held out in
  // front. Built from capsules at real joint positions so it reads as a body at any size.
  const lanternWalker = ({ feet, height, ink = [232, 20, 9], rim = [38, 24, 22], lamp = [48, 82, 78] }) => {
    const u = height / 7.5; // one head, in canvas heights
    const P = ([hx, hy]) => [feet[0] + (hx * u) / A, feet[1] - hy * u];
    const R = (r) => (r * u) / A;
    const seg = (a, b, r, c = ink) => ({ p0: P(a), p1: P(b), rad: R(r), c });
    const lampAt = [1.22, 2.85];
    const body = [
      seg([0.18, 7.0], [0.18, 7.0], 0.42), // head
      seg([0.28, 6.95], [0.34, 6.9], 0.12), // nose and brow, so the head reads in profile
      seg([-0.55, 7.42], [0.95, 7.38], 0.09), // hat brim
      seg([0.0, 7.72], [0.36, 7.74], 0.32), // hat crown
      seg([0.12, 6.55], [0.08, 6.25], 0.2), // neck
      seg([0.12, 5.95], [0.02, 4.7], 0.78), // chest and shoulders, a coat
      seg([0.02, 4.7], [-0.04, 3.85], 0.68), // waist
      seg([-0.06, 3.85], [-0.12, 3.35], 0.74), // coat hem
      // front leg reaching forward, back leg pushing off
      seg([0.18, 3.6], [0.62, 1.95], 0.3),
      seg([0.62, 1.95], [0.58, 0.22], 0.22),
      seg([0.5, 0.1], [0.98, 0.06], 0.14),
      seg([-0.22, 3.6], [-0.48, 1.95], 0.3),
      seg([-0.48, 1.95], [-0.98, 0.4], 0.21),
      seg([-1.08, 0.36], [-0.78, 0.08], 0.13),
      // back arm swinging behind
      seg([-0.32, 5.95], [-0.62, 4.7], 0.19),
      seg([-0.62, 4.7], [-0.72, 3.75], 0.16),
      // lantern arm, elbow bent, hand out front
      seg([0.42, 5.95], [0.62, 4.7], 0.2),
      seg([0.62, 4.7], [1.15, 3.95], 0.17),
      seg([1.18, 3.9], [1.18, 3.9], 0.16),
    ];
    const light = [
      // where the lantern catches the coat, the arm and the front leg
      seg([0.7, 4.6], [1.12, 4.02], 0.035, rim),
      seg([0.72, 1.9], [0.68, 0.4], 0.03, rim),
      seg([0.72, 5.5], [0.66, 4.4], 0.035, rim),
    ];
    const [lx, ly] = P(lampAt);
    return [
      // a warm pool on the grass under the lantern
      {
        n: 260,
        at: (k) => [lx + k.gauss() * 0.03, feet[1] + k.gauss() * 0.008],
        color: (x, y, k) => [46, 44, 40 + k.gauss() * 6, 0.18],
        angle: (x, y, k) => (k.r() - 0.5) * 0.3,
        len: 0.01,
        width: 0.003,
      },
      {
        // lamplight, soft dabs falling off from the lantern
        n: 320,
        at: (k) => {
          const a = k.r() * Math.PI * 2;
          const rr = Math.pow(k.r(), 1.8) * 0.05;
          return [lx + Math.cos(a) * rr, ly + Math.sin(a) * rr * A];
        },
        color: (x, y, k) => [46, 56, 60 + k.gauss() * 4, 0.06],
        angle: (x, y, k) => k.r() * Math.PI,
        len: 0.008,
        width: 0.005,
        bend: 0.1,
      },
      K.parts({ parts: body, n: 2400, len: 0.0022, width: 0.0013 }),
      K.parts({ parts: light, n: 50, len: 0.002, width: 0.001 }),
      // the bail and the lantern itself
      K.lines({ segs: [[...P([1.18, 3.85]), ...P([1.22, 3.2]), 0.0008, ink]], reps: 2 }),
      K.parts({ parts: [seg([1.22, 3.05], [1.22, 2.65], 0.2, lamp)], n: 90, len: 0.0022, width: 0.0014 }),
      K.parts({ parts: [seg([1.19, 3.15], [1.25, 3.15], 0.12, ink), seg([1.19, 2.55], [1.25, 2.55], 0.12, ink)], n: 40, len: 0.002, width: 0.0012 }),
    ];
  };

  // the 404 page: a stone coming down somewhere past the hills at dusk, and somebody with a lantern
  // walking out across the meadow to look for it. Nobody wrote this one down.
  S.lost = (() => {
    const hy = 0.6;
    const sky = [
      [0, [236, 34, 20]],
      [0.18, [240, 26, 30]],
      [0.34, [262, 18, 44]],
      [0.46, [330, 22, 58]],
      [0.54, [20, 34, 68]],
      [0.61, [44, 48, 78]],
    ];
    // a river winding down out of the hills toward us
    const river = [[0.6, hy + 0.005], [0.52, 0.66], [0.62, 0.72], [0.46, 0.8], [0.6, 0.9], [0.5, 1.02]];
    const along = (t) => {
      const f = t * (river.length - 1);
      const i = Math.min(river.length - 2, Math.floor(f));
      const u = f - i;
      const e = u * u * (3 - 2 * u);
      return [lerp(river[i][0], river[i + 1][0], e), lerp(river[i][1], river[i + 1][1], u)];
    };
    const lantern = [0.25, 0.79];
    return {
      aspect: A,
      ground: [250, 20, 40],
      passes: [
        K.sky({ stops: sky, hy, tilt: -0.04 }),
        K.stars({ hy: 0.32, n: 160, seed: 401 }),
        // a thin crescent moon high on the left, lit from the sunset side, the rest of the disc
        // just barely there in earthshine
        K.glow({ x: 0.13, y: 0.15, r: 0.045, color: [50, 24, 60], n: 90, alpha: 0.04, len: 0.006, width: 0.004 }),
        {
          n: 120,
          at: (k) => {
            const a = k.r() * Math.PI * 2;
            const rr = Math.sqrt(k.r()) * 0.016;
            return [0.13 + Math.cos(a) * rr, 0.15 + Math.sin(a) * rr * A];
          },
          color: (x, y, k) => [236, 24, 26 + k.gauss() * 2, 0.9],
          angle: (x, y, k) => k.r() * 3,
          len: 0.003,
          width: 0.002,
        },
        {
          n: 260,
          at: (k) => {
            const a = k.r() * Math.PI * 2;
            const rr = Math.sqrt(k.r()) * 0.017;
            const x = 0.13 + Math.cos(a) * rr;
            const y = 0.15 + Math.sin(a) * rr * A;
            // keep only what's outside the shadow disc, offset up and to the right
            if (Math.hypot(x - 0.137, (y - 0.143) / A) < 0.0155) return null;
            return [x, y];
          },
          color: (x, y, k) => [50, 40, 92 + k.gauss() * 2, 0.95],
          angle: (x, y, k) => Math.atan2((y - 0.15) / A, x - 0.13) + Math.PI / 2,
          len: 0.003,
          width: 0.0018,
        },
        // long thin clouds catching the last light
        K.bands({
          seed: 402,
          rows: [
            { x0: 0.25, x1: 0.95, y: 0.38, h: 0.022, color: [280, 16, 46], lit: [350, 34, 72] },
            { x0: -0.05, x1: 0.55, y: 0.47, h: 0.016, color: [300, 14, 52], lit: [20, 44, 76] },
            { x0: 0.5, x1: 1.05, y: 0.52, h: 0.012, color: [320, 14, 56], lit: [36, 50, 80] },
          ],
          n: 1200,
          len: 0.07,
          width: 0.009,
        }),
        // the meteor, low, about to go down behind the far ridge
        K.fireball({ from: [0.94, 0.12], to: [0.71, 0.5], head: [58, 60, 97], train: [200, 30, 82], glow: [50, 50, 80], width: 0.009, frags: 5, glowR: 0.06, glowA: 0.03, n: 700 }),
        K.hills({ seed: 403, hy: hy + 0.005, height: 0.13, color: [262, 16, 40], top: [280, 16, 48], bumps: 5, n: 1300 }),
        K.hills({ seed: 404, hy: hy + 0.01, height: 0.08, color: [240, 18, 30], top: [250, 16, 36], bumps: 7, n: 1200 }),
        K.trees({ seed: 405, hy: hy + 0.015, height: 0.045, color: [220, 20, 20], light: [260, 16, 30], n: 1600 }),
        // the meadow, cool in the dusk with a little warmth in it
        K.ground({ y0: hy, y1: hy + 0.07, colors: [[200, 14, 24], [150, 14, 26], [250, 12, 30]], n: 1400, len: [0.02, 0.03], width: [0.005, 0.007] }),
        K.ground({ y0: hy + 0.01, colors: [[150, 16, 24], [120, 14, 28], [200, 14, 22], [60, 18, 30]], light: 3 }),
        {
          // tall grass heads in the foreground
          n: 1800,
          at: (k) => [k.r() * 1.04 - 0.02, 0.8 + Math.pow(k.r(), 0.6) * 0.22],
          color: (x, y, k) => jit(k.pick([[110, 16, 22], [80, 20, 30], [140, 12, 18], [40, 24, 38]]), k, 4, 3),
          angle: (x, y, k) => -Math.PI / 2 + (k.r() - 0.5) * 0.6,
          len: (x, y) => 0.01 + (y - 0.8) * 0.14,
          width: 0.0018,
        },
        {
          // the river, holding the sky's colours upside down
          n: 2600,
          at: (k) => {
            const t = Math.pow(k.r(), 0.85);
            const [x, y] = along(t);
            const half = 0.004 + t * 0.07;
            return [x + (k.r() - 0.5) * 2 * half, y];
          },
          color: (x, y, k) => {
            const mirror = clamp(hy - (y - hy) * 1.5, 0.05, hy);
            const c = ramp(sky, mirror);
            return jit([c[0], c[1] * 0.9, c[2] - 6], k, 3, 3);
          },
          angle: (x, y, k) => (k.r() - 0.5) * 0.08,
          len: (x, y) => 0.008 + clamp((y - hy) / (1 - hy)) * 0.05,
          width: (x, y) => 0.002 + clamp((y - hy) / (1 - hy)) * 0.006,
        },
        {
          // the meteor's light broken on the water, kept to the river's upper reach
          n: 110,
          at: (k) => {
            const t = 0.03 + Math.pow(k.r(), 1.3) * 0.4;
            const [x, y] = along(t);
            const half = 0.004 + t * 0.07;
            return [x + k.gauss() * half * 0.2, y + (k.r() - 0.5) * 0.006];
          },
          color: (x, y, k) => [56, 40, 80 + k.gauss() * 4, 0.2 + k.r() * 0.4],
          angle: (x, y, k) => (k.r() - 0.5) * 0.06,
          len: (x, y) => 0.006 + clamp((y - hy) / (1 - hy)) * 0.02,
          width: 0.0022,
        },
        // somebody walking out with a lantern to find it
        lanternWalker({ feet: [0.25, 0.86], height: 0.16 }),
      ],
    };
  })();

  // ---------- captions ----------
  const CAPTIONS = {
    thomson: ["Near Thomson, Georgia. October 15, 1888, about 1 in the afternoon."],
    northport: ["Penobscot Bay off Northport, Maine, 1850.", "The papers don't give the hour, so night's a guess."],
    saco: ["Behind Capt. Ira Doe's house, Saco, Maine. An evening in October 1870."],
    laclede: ["John J. Murdoch's hay meadow near Laclede Station, Missouri. Summer 1872."],
    homestead: ["Over Iowa County, Iowa. February 12, 1875, 10:30 at night."],
    rochester: ["Over Fulton County, Indiana. December 21, 1876, in the evening."],
    newton: ["A farmhouse near Newtown, Indiana. January 1879.", "Nothing's falling because nothing fell."],
    estherville: ["Emmet County, Iowa. May 10, 1879, late afternoon."],
    schroon: ["Lake-Side Cottage on Schroon Lake, New York. September 1880, 10 at night.", "It was a hoax, so the sky's empty."],
    "st-joseph": ["Near St. Joseph, Indiana. June 1887.", "No stone ever turned up, so the field's empty."],
    amsterdam: ["A street in Amsterdam, New York. November 1887."],
    middleburg: ["A road near Middleburg, Florida. January 1888, the morning after a thunderstorm."],
    jonesboro: ["The hills around Jonesboro, Illinois, around 1914.", "The hour and the season are guesses."],
    lost: ["Somewhere past the hills, an evening nobody wrote down."],
  };

  const ALT = {
    thomson: "A wide October sky with tall white clouds over pines and turning hardwoods, with a farmhouse, an oak and a rail fence at the far edge of a field of open cotton. A man bends over a row with a sack behind him, and further down the field a burst of red dirt and clods flies up out of the row.",
    northport: "Night over a bay. A pale green fireball cuts down the sky toward dark spruce on the far shore, its light broken on the water beside a schooner at anchor.",
    saco: "Dusk over a farmhouse with two lit windows and a dark line of trees. A small bright meteor comes down behind the house toward a meadow crossed by a stone wall.",
    laclede: "A summer farm under white clouds. A wooden windlass stands over a hole beside a heap of red clay, with a dark stone sitting on top of the heap.",
    homestead: "A winter night over snow. A big fireball breaks into pieces above bare trees, and a few farmhouse windows glow off to the right.",
    rochester: "A night sky crossed left to right by a long fireball train shedding pieces, above bare trees and a few lit windows of a small town.",
    newton: "A quiet winter night: a dark farmhouse under stars, bare trees and a rail fence. Nothing in the sky.",
    estherville: "A late afternoon spring prairie. A long grey smoke trail bends down the sky to a thin column of smoke rising by the river trees.",
    schroon: "A black, overcast night on a mountain lake. A cottage on the near shore has two lamplit windows. Nothing in the sky.",
    "st-joseph": "A summer evening over a ripening wheat field and a line of trees. Nothing in the sky and nothing in the field.",
    amsterdam: "An overcast November street between brick buildings. A wagon heads away up the street, and a large grey stone sits in the road in front.",
    middleburg: "A pale sand road between tall pines and palmettos as a storm clears. A rust-brown stone lies in the road, broken in two.",
    jonesboro: "Dusk over layered hills and an orchard. A small meteor comes down toward the far ridge.",
    lost: "Dusk in violet and rose over layered hills and a winding river. A meteor slips down behind the far ridge, and someone with a lantern walks out across the meadow to look for it.",
  };

  window.SKY_SCENES = Object.fromEntries(
    Object.keys(CAPTIONS).map((id) => [
      id,
      {
        scene: id === "thomson" ? window.SCENE_THOMSON : S[id],
        caption: CAPTIONS[id],
        alt: ALT[id],
        seed: id === "thomson" ? 1888 : [...id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0,
      },
    ]),
  );
})();
