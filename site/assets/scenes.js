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
  ];

  K.stars = ({ hy, n = 240, color = [52, 30, 90], seed = 1 }) => {
    const r = rng(seed);
    const pts = Array.from({ length: n }, () => [r(), Math.pow(r(), 1.25) * hy * 0.92, 0.35 + r() * 0.6]);
    let i = 0;
    return {
      n,
      fixed: true,
      at: () => pts[i++ % n],
      color: (x, y, k) => [color[0], color[1], color[2] + k.gauss() * 4, pts[(i - 1) % n][2]],
      angle: (x, y, k) => k.r() * 3,
      len: 0.0022,
      width: 0.0016,
    };
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
      const top = Math.min(...lobes.map((l) => l.y - l.rad * A * flat));
      return { ...c, lobes, top };
    });
    return {
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
    };
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
    return {
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
    };
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

  S.northport = (() => {
    const hy = 0.6;
    const sky = NIGHT([228, 42, 9], [224, 38, 15], [214, 28, 27], hy);
    const fb = { from: [0.86, 0.06], to: [0.37, 0.33] };
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
        K.trees({ seed: 15, hy, height: 0.06, color: [200, 22, 11], kind: "spruce", x0: 0, x1: 0.5, count: 50, n: 1700 }),
        K.water({ y0: hy, stops: sky, hy, dark: 4 }),
        K.reflection({ x: 0.37, y0: hy + 0.01, y1: 0.98, color: [90, 30, 70], spread: 0.01, n: 260 }),
        // a schooner riding at anchor, the kind that carried ballast
        K.parts({ parts: [{ p0: [0.66, 0.705], p1: [0.735, 0.705], rad: 0.006, c: [224, 26, 9] }], n: 120 }),
        K.lines({
          segs: [
            [0.685, 0.705, 0.685, 0.56, 0.0016, [224, 20, 12]],
            [0.712, 0.705, 0.712, 0.575, 0.0016, [224, 20, 12]],
            [0.685, 0.57, 0.735, 0.7, 0.0008, [224, 16, 18]],
          ],
          reps: 3,
        }),
        K.reflection({ x: 0.7, y0: 0.715, y1: 0.8, color: [224, 26, 8], spread: 0.018, n: 60 }),
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
        K.ground({ y0: hy, colors: [[75, 16, 22], [55, 18, 26], [90, 12, 30], [40, 20, 24]], light: 6 }),
        // a fieldstone wall across the meadow
        K.parts({ parts: [{ p0: [-0.02, 0.76], p1: [0.6, 0.72], rad: 0.006, c: [220, 6, 38] }, { p0: [0.6, 0.72], p1: [1.02, 0.745], rad: 0.006, c: [220, 6, 36] }], n: 520, len: 0.006, width: 0.004 }),
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
        K.ground({ y0: hy, colors: [[62, 34, 54], [72, 30, 46], [48, 38, 60], [90, 20, 40]], light: 10 }),
        // the hole, the spoil heap of red clay, and the stone sitting on it
        K.parts({
          parts: [
            { p0: [0.45, 0.78], p1: [0.57, 0.79], rad: 0.018, c: [18, 36, 42] },
            { p0: [0.48, 0.765], p1: [0.55, 0.772], rad: 0.012, c: [22, 38, 50] },
          ],
          n: 600,
          len: 0.008,
          width: 0.004,
        }),
        K.parts({ parts: [{ p0: [0.36, 0.79], p1: [0.4, 0.792], rad: 0.012, c: [20, 30, 10] }], n: 140 }),
        K.parts({ parts: [{ p0: [0.51, 0.742], p1: [0.522, 0.743], rad: 0.007, c: [220, 10, 12] }], n: 110, len: 0.004, width: 0.0025 }),
        // the windlass over the hole
        K.lines({
          segs: [
            [0.345, 0.8, 0.355, 0.66, 0.003, [30, 20, 26]],
            [0.415, 0.8, 0.405, 0.66, 0.003, [30, 20, 26]],
            [0.345, 0.665, 0.415, 0.665, 0.004, [30, 22, 30]],
            [0.38, 0.665, 0.38, 0.775, 0.0009, [40, 18, 40]],
            [0.415, 0.665, 0.43, 0.65, 0.002, [30, 20, 26]],
          ],
          reps: 4,
        }),
      ],
    };
  })();

  S.homestead = (() => {
    const hy = 0.63;
    const sky = NIGHT([230, 40, 10], [226, 34, 17], [222, 24, 30], hy);
    const fb = { from: [0.12, 0.05], to: [0.58, 0.34] };
    return {
      aspect: A,
      ground: [222, 26, 18],
      passes: [
        K.sky({ stops: sky, hy }),
        K.stars({ hy, n: 260, seed: 41 }),
        K.glow({ x: 0.58, y: 0.36, r: 0.4, color: [210, 24, 36], n: 700, alpha: 0.05 }),
        K.fireball({ ...fb, head: [58, 60, 96], train: [170, 30, 76], glow: [60, 40, 74], width: 0.015, frags: 14, glowR: 0.1, glowA: 0.025, n: 1100 }),
        K.trees({ seed: 42, hy, height: 0.05, color: [228, 18, 13], kind: "bare", count: 70, n: 1800 }),
        K.house({ x: 0.74, y: 0.585, w: 0.04, h: 0.045, roofH: 0.025, wall: [224, 14, 22], roof: [226, 16, 32], windows: [[0.2, 0.35, 0.2, 0.3]], lit: [48, 70, 66] }),
        K.house({ x: 0.81, y: 0.59, w: 0.05, h: 0.04, roofH: 0.028, wall: [224, 14, 20], roof: [226, 14, 30], windows: [[0.6, 0.35, 0.16, 0.3]], lit: [48, 70, 64] }),
        K.house({ x: 0.885, y: 0.592, w: 0.03, h: 0.038, roofH: 0.02, wall: [224, 14, 19], roof: [226, 14, 28] }),
        // snow, lit toward the fireball and blue in the shadows
        {
          n: 3200,
          at: (k) => [k.r() * 1.1 - 0.05, hy + Math.pow(k.r(), 0.85) * (1 - hy)],
          color: (x, y, k) => {
            // brighter toward the fireball, bluer away from it
            const near = clamp(1 - Math.abs(x - 0.58) * 1.6);
            return jit(blend([222, 18, 40], [48, 18, 56], near * 0.6), k, 2, 2);
          },
          angle: (x, y, k) => (k.r() - 0.5) * 0.7,
          len: (x, y) => 0.008 + ((y - hy) / (1 - hy)) * 0.03,
          width: (x, y) => 0.004 + ((y - hy) / (1 - hy)) * 0.012,
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
        // the town off in the distance, a few windows still lit
        K.house({ x: 0.36, y: 0.625, w: 0.03, h: 0.035, roofH: 0.02, wall: [226, 14, 18], roof: [228, 14, 26], windows: [[0.3, 0.4, 0.25, 0.3]], lit: [46, 66, 62] }),
        K.house({ x: 0.4, y: 0.615, w: 0.025, h: 0.045, roofH: 0.03, wall: [226, 14, 17], roof: [228, 14, 24] }),
        K.rect({ x: 0.413, y: 0.56, w: 0.004, h: 0.03, color: [228, 14, 22], n: 12, vertical: true, len: 0.004, width: 0.002 }),
        K.house({ x: 0.435, y: 0.628, w: 0.035, h: 0.032, roofH: 0.018, wall: [226, 14, 18], roof: [228, 14, 26], windows: [[0.6, 0.4, 0.2, 0.3]], lit: [46, 66, 60] }),
        K.ground({ y0: hy, colors: [[30, 14, 16], [40, 12, 20], [220, 14, 18], [35, 16, 26]], light: 4 }),
      ],
    };
  })();

  S.newton = (() => {
    const hy = 0.64;
    const sky = NIGHT([230, 34, 10], [226, 28, 16], [218, 20, 26], hy);
    return {
      aspect: A,
      ground: [226, 20, 13],
      passes: [
        K.sky({ stops: sky, hy }),
        K.stars({ hy, n: 380, seed: 61 }),
        K.trees({ seed: 62, hy, height: 0.08, color: [228, 16, 10], kind: "bare", count: 34, n: 1900 }),
        K.trees({ seed: 63, hy: hy + 0.005, height: 0.24, color: [228, 16, 9], kind: "bare", count: 3, n: 900, x0: 0.62, x1: 0.78 }),
        K.house({ x: 0.42, y: 0.5, w: 0.15, h: 0.15, roofH: 0.085, wall: [222, 14, 15], roof: [226, 18, 9], side: [222, 14, 11], chimney: true, windows: [[0.15, 0.3, 0.12, 0.25], [0.45, 0.3, 0.12, 0.25], [0.75, 0.3, 0.12, 0.25]] }),
        K.ground({ y0: hy, colors: [[32, 12, 18], [220, 12, 22], [40, 10, 24]], light: 6 }),
        K.lines({
          segs: [
            [0.08, 0.7, 0.08, 0.66, 0.002, [30, 10, 22]],
            [0.2, 0.705, 0.2, 0.665, 0.002, [30, 10, 22]],
            [0.32, 0.71, 0.32, 0.67, 0.002, [30, 10, 22]],
            [0.06, 0.675, 0.34, 0.682, 0.0012, [30, 10, 24]],
          ],
          reps: 3,
        }),
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
      ],
    };
  })();

  S.schroon = (() => {
    const hy = 0.52;
    const sky = [
      [0, [222, 26, 34]],
      [0.3, [214, 22, 50]],
      [0.5, [44, 22, 70]],
      [0.56, [30, 24, 66]],
    ];
    return {
      aspect: A,
      ground: [215, 18, 30],
      passes: [
        K.sky({ stops: sky, hy }),
        K.stars({ hy: 0.2, n: 40, seed: 81 }),
        K.hills({ seed: 82, hy: hy + 0.01, height: 0.24, color: [228, 14, 46], top: [250, 12, 54], x0: 0, x1: 1, bumps: 5, n: 1400 }),
        K.hills({ seed: 83, hy: hy + 0.02, height: 0.12, color: [214, 18, 30], top: [220, 16, 36], x0: 0.3, x1: 1, bumps: 6, n: 1100 }),
        K.trees({ seed: 84, hy: hy + 0.03, height: 0.05, color: [180, 22, 12], kind: "spruce", x0: 0.3, x1: 1, count: 60, n: 1500 }),
        K.water({ y0: hy + 0.03, stops: sky, hy, dark: 8 }),
        // the shore under the cottage
        K.ground({ y0: 0.82, colors: [[150, 18, 14], [200, 14, 12], [40, 12, 18]], n: 800, x0: -0.05, x1: 0.42 }),
        K.trees({ seed: 85, hy: 0.84, height: 0.3, color: [170, 22, 10], kind: "spruce", x0: 0.0, x1: 0.12, count: 5, n: 800 }),
        K.house({ x: 0.15, y: 0.71, w: 0.12, h: 0.1, roofH: 0.06, wall: [30, 10, 30], roof: [222, 16, 14], side: [30, 10, 24], windows: [[0.2, 0.3, 0.12, 0.3], [0.6, 0.3, 0.12, 0.3]] }),
        K.lines({
          segs: [
            [0.15, 0.81, 0.27, 0.81, 0.003, [30, 10, 22]],
            [0.27, 0.81, 0.36, 0.83, 0.003, [30, 12, 26]],
            [0.36, 0.83, 0.36, 0.86, 0.0016, [30, 12, 20]],
          ],
          reps: 3,
        }),
        K.reflection({ x: 0.21, y0: 0.83, y1: 0.98, color: [30, 10, 24], spread: 0.03, n: 120 }),
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
        K.trees({ seed: 93, hy: hy + 0.01, height: 0.17, color: [130, 26, 18], light: [80, 30, 34], n: 900, x0: 0.7, x1: 0.8 }),
        // wheat nearly ready, laid toward the far trees
        K.ground({ y0: hy, colors: [[48, 40, 60], [52, 34, 52], [70, 26, 46], [42, 38, 66]], light: 8 }),
        {
          // heads of wheat standing up out of it
          n: 1600,
          at: (k) => [k.r(), hy + 0.03 + Math.pow(k.r(), 0.7) * (1 - hy - 0.03)],
          color: (x, y, k) => jit(k.pick([[46, 44, 74], [44, 50, 66], [52, 36, 58]]), k, 3, 3),
          angle: (x, y, k) => -Math.PI / 2 + (k.r() - 0.5) * 0.5,
          len: (x, y) => 0.006 + ((y - hy) / (1 - hy)) * 0.03,
          width: (x, y) => 0.0015 + ((y - hy) / (1 - hy)) * 0.004,
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
    // facades stepping down the street toward the vanishing point
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
        out.push(K.rect({ x, y: top, w, h: bot - top, color: cols[i % cols.length], len: 0.008 * scale + 0.003, width: 0.004 * scale + 0.002 }));
        for (let r = 0; r < 3; r++)
          out.push(K.rect({ x: x + w * 0.25, y: top + (bot - top) * (0.15 + r * 0.22), w: w * 0.5, h: (bot - top) * 0.1, color: [215, 14, 22], len: 0.004 * scale + 0.002, width: 0.003 * scale + 0.001 }));
      }
      return out;
    };
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
        K.parts({ parts: [{ p0: [0.6, 0.84], p1: [0.7, 0.85], rad: 0.035, c: [220, 6, 32] }], n: 700, len: 0.01, width: 0.005 }),
        K.parts({ parts: [{ p0: [0.62, 0.81], p1: [0.68, 0.81], rad: 0.014, c: [214, 6, 50] }], n: 160, len: 0.008, width: 0.004 }),
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
        // palmettos low along the verges
        K.ground({ y0: hy - 0.01, y1: 0.76, colors: [[110, 30, 30], [100, 28, 36], [130, 22, 26]], n: 1600, len: [0.012, 0.03], width: [0.003, 0.007], x0: -0.05, x1: 0.34 }),
        K.ground({ y0: hy - 0.01, y1: 0.76, colors: [[110, 30, 30], [100, 28, 36], [130, 22, 26]], n: 1600, len: [0.012, 0.03], width: [0.003, 0.007], x0: 0.6, x1: 1.05 }),
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
        K.lines({
          segs: [
            [vp[0] + 0.005, hy + 0.01, 0.3, 1.0, 0.004, [30, 20, 40]],
            [vp[0] + 0.015, hy + 0.01, 0.66, 1.0, 0.004, [30, 20, 40]],
          ],
          reps: 6,
        }),
        // the stone in the road, broken in two
        K.parts({ parts: [{ p0: [0.45, 0.82], p1: [0.53, 0.83], rad: 0.026, c: [16, 44, 30] }], n: 520, len: 0.008, width: 0.004 }),
        K.parts({ parts: [{ p0: [0.46, 0.8], p1: [0.5, 0.8], rad: 0.01, c: [26, 44, 42] }], n: 120, len: 0.006, width: 0.003 }),
        K.parts({ parts: [{ p0: [0.575, 0.85], p1: [0.585, 0.852], rad: 0.009, c: [18, 42, 28] }], n: 90, len: 0.005, width: 0.003 }),
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
        // an orchard on the near slope
        {
          n: 1200,
          at: (k) => {
            const row = Math.floor(k.r() * 5);
            const col = Math.floor(k.r() * 14);
            const y = hy + 0.06 + row * 0.07;
            const x = 0.04 + col * 0.07 + (row % 2) * 0.035;
            return [x + k.gauss() * 0.008, y - 0.02 + k.gauss() * 0.01];
          },
          color: (x, y, k) => jit([24, 14, 16], k, 4, 3),
          angle: (x, y, k) => k.r() * 3,
          len: 0.008,
          width: 0.004,
        },
        K.ground({ y0: hy + 0.02, colors: [[30, 16, 22], [40, 14, 26], [220, 10, 22]], light: 5 }),
      ],
    };
  })();

  // ---------- captions ----------
  const CAPTIONS = {
    thomson: ["Near Thomson, McDuffie County, Georgia. Monday, October 15, 1888, about 1 in the afternoon.", "Nobody reported a light, only the noise, so there's no fireball in the picture."],
    northport: ["Penobscot Bay off Northport, Maine. A night in 1850.", "The papers give the year, not the hour, so night is a guess. The fragments picked up thirty years later were copper slag, probably ballast."],
    saco: ["Behind Capt. Ira Doe's house, Saco, Maine. An evening in October 1870.", "He saw it come at the house, heard it whizz and burst, and found scorched grass in the meadow the next morning."],
    laclede: ["John J. Murdoch's farm near Laclede Station, Missouri. Summer 1872.", "Nobody saw anything fall. The stone came up out of a hole thirteen feet deep."],
    homestead: ["Over Iowa County, Iowa. Friday, February 12, 1875, late at night.", "It broke up overhead and stones were picked up off the snow afterward."],
    rochester: ["Over Fulton County, Indiana. Thursday, December 21, 1876, in the evening.", "Seven towns saw it pass overhead going east-northeast. It dropped the Rochester meteorite."],
    newton: ["A farmhouse near Newtown, Indiana. January 1879.", "The papers said a meteorite came through the roof and killed a farmer in his bed. None of it happened, so nothing's falling here."],
    estherville: ["Emmet County, Iowa, by the Des Moines River. Saturday, May 10, 1879, late afternoon.", "It came down in daylight, so what's painted is the smoke trail it left."],
    schroon: ["Lakeside Cottage on Schroon Lake, New York. September 1880.", "The red-hot stone turned out to be quartz doused in kerosene and sulphur, so there's no light in this sky."],
    "st-joseph": ["Farm country near St. Joseph, Indiana. June 1887.", "Twenty-odd papers ran the two-ton aerolite. Nobody ever produced a stone, so the field's empty."],
    amsterdam: ["A street in Amsterdam, New York. November 1887.", "The three-ton aerolite outside the bank was a big stone that fell off a wagon, so that's what's painted."],
    middleburg: ["A road near Middleburg, Florida. January 1888, after a thunderstorm.", "Nobody saw it fall, people just blamed the storm. G. F. Kunz said it was limonite, a common iron ore."],
    jonesboro: ["The hills around Jonesboro, Illinois. Around 1914.", "A. V. Cook said he saw it fall. The hour and the season are guesses."],
  };

  const ALT = {
    thomson: "A wide October sky with tall white clouds over a pine line and a field of open cotton. A man bends over a row with a sack behind him, and further down the row a small spray of dirt rises.",
    northport: "Night over a bay. A pale green fireball cuts down the sky toward dark spruce on the far shore, its light broken on the water beside a schooner at anchor.",
    saco: "Dusk over a farmhouse with two lit windows and a dark line of trees. A small bright meteor comes down behind the house toward a meadow crossed by a stone wall.",
    laclede: "A summer farm under white clouds. A wooden windlass stands over a hole beside a heap of red clay, with a dark stone sitting on top of the heap.",
    homestead: "A winter night over snow. A big fireball breaks into pieces above bare trees, and a few farmhouse windows glow off to the right.",
    rochester: "A night sky crossed left to right by a long fireball train shedding pieces, above bare trees and a few lit windows of a small town.",
    newton: "A quiet winter night: a dark farmhouse under stars, bare trees and a rail fence. Nothing in the sky.",
    estherville: "A late afternoon spring prairie. A long grey smoke trail bends down the sky to a thin column of smoke rising by the river trees.",
    schroon: "Dusk on a mountain lake. A dark cottage sits on the near shore among spruce, and the water holds the evening light. Nothing in the sky.",
    "st-joseph": "A summer evening over a ripening wheat field and a line of trees. Nothing in the sky and nothing in the field.",
    amsterdam: "An overcast November street between brick buildings. A wagon heads away up the street, and a large grey stone sits in the road in front.",
    middleburg: "A pale sand road between tall pines and palmettos as a storm clears. A rust-brown stone lies in the road, broken in two.",
    jonesboro: "Dusk over layered hills and an orchard. A small meteor comes down toward the far ridge.",
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
