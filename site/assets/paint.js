// A small brushstroke painter. A scene is a list of passes; each pass places
// strokes (position, colour, angle, size) and every stroke is drawn as a bundle
// of thin bristle lines, so it reads as paint and not as a gradient.
// Same seed, same painting.
(() => {
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function noise1(r, n = 48) {
    const v = Array.from({ length: n + 2 }, () => r());
    return (x) => {
      const f = Math.max(0, Math.min(n, x * n));
      const i = Math.floor(f);
      const t = f - i;
      const s = t * t * (3 - 2 * t);
      return v[i] * (1 - s) + v[i + 1] * s;
    };
  }

  function build(scene, seed, aspect, density = 1) {
    const r = rng(seed);
    const kit = {
      r,
      aspect,
      noise: (n) => noise1(r, n),
      gauss: () => (r() + r() + r() - 1.5) / 1.5,
      pick: (a) => a[Math.floor(r() * a.length)],
    };
    const env = scene.setup ? scene.setup(kit) : {};
    const strokes = [];
    for (const p of scene.passes.flat(3)) {
      const count = Math.round(p.n * (p.fixed ? 1 : density));
      const grow = p.fixed ? 1 : 1 / Math.sqrt(density);
      for (let i = 0; i < count; i++) {
        const pt = p.at(kit, env);
        if (!pt) continue;
        const [x, y] = pt;
        const c = p.color(x, y, kit, env);
        const val = (v) => (typeof v === "function" ? v(x, y, kit, env) : v);
        strokes.push({
          x,
          y,
          ang: p.angle ? p.angle(x, y, kit, env) : (r() - 0.5) * 0.3,
          len: val(p.len) * (0.7 + r() * 0.6) * grow,
          wid: val(p.width) * (0.7 + r() * 0.6) * grow,
          h: c[0],
          s: c[1],
          l: c[2],
          a: c[3] ?? p.alpha ?? 0.85,
          bend: (r() - 0.5) * (p.bend ?? 0.2),
          seed: (r() * 4294967296) >>> 0,
        });
      }
    }
    return strokes;
  }

  function draw(ctx, s, W, H) {
    const r = rng(s.seed);
    const x = s.x * W;
    const y = s.y * H;
    const len = s.len * W;
    const wid = s.wid * W;
    const c = Math.cos(s.ang);
    const sn = Math.sin(s.ang);
    const nx = -sn;
    const ny = c;
    const n = Math.max(3, Math.min(14, Math.round(wid / 1.3)));
    for (let i = 0; i < n; i++) {
      const off = ((i + 0.5) / n - 0.5) * wid + (r() - 0.5) * wid * 0.15;
      const a0 = -len / 2 + r() * len * 0.2;
      const a1 = len / 2 - r() * len * 0.28;
      const bx = x + nx * off;
      const by = y + ny * off;
      const x0 = bx + c * a0;
      const y0 = by + sn * a0;
      const x1 = bx + c * a1;
      const y1 = by + sn * a1;
      const mx = (x0 + x1) / 2 + nx * s.bend * len;
      const my = (y0 + y1) / 2 + ny * s.bend * len;
      ctx.globalAlpha = s.a * (0.45 + r() * 0.55);
      ctx.strokeStyle = `hsl(${s.h + (r() - 0.5) * 6} ${s.s + (r() - 0.5) * 6}% ${s.l + (r() - 0.5) * 7}%)`;
      ctx.lineWidth = Math.max(0.6, (wid / n) * (1.1 + r() * 0.9));
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(mx, my, x1, y1);
      ctx.stroke();
    }
  }

  function paint(canvas, scene, opts = {}) {
    const seed = opts.seed ?? 1;
    const aspect = scene.aspect ?? 2;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = opts.animate !== false && !reduce;
    const duration = opts.duration ?? 7000;
    const strokes = build(scene, seed, aspect, opts.density ?? 1);
    let raf = 0;
    let lastW = 0;

    function setup() {
      const cssW = canvas.getBoundingClientRect().width || 1200;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.min(opts.maxWidth ?? 2600, Math.round(cssW * dpr));
      const H = Math.round(W / aspect);
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      const g = scene.ground;
      ctx.globalAlpha = 1;
      ctx.fillStyle = `hsl(${g[0]} ${g[1]}% ${g[2]}%)`;
      ctx.fillRect(0, 0, W, H);
      ctx.lineCap = "round";
      lastW = cssW;
      return { ctx, W, H };
    }

    function run(withMotion) {
      cancelAnimationFrame(raf);
      const { ctx, W, H } = setup();
      if (!withMotion) {
        for (const s of strokes) draw(ctx, s, W, H);
        canvas.dataset.painted = "1";
        return;
      }
      let done = 0;
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / duration);
        // quick start, then it slows down so the last pass lands on its own
        const target = Math.floor(strokes.length * (1 - Math.pow(1 - p, 1.6)));
        for (; done < target; done++) draw(ctx, strokes[done], W, H);
        if (p < 1) raf = requestAnimationFrame(step);
        else {
          for (; done < strokes.length; done++) draw(ctx, strokes[done], W, H);
          canvas.dataset.painted = "1";
        }
      };
      raf = requestAnimationFrame(step);
    }

    run(animate);

    let timer = 0;
    new ResizeObserver(() => {
      const w = canvas.getBoundingClientRect().width;
      if (Math.abs(w - lastW) < 60) return;
      clearTimeout(timer);
      timer = setTimeout(() => run(false), 200);
    }).observe(canvas);
  }

  window.Painter = { paint };
})();
