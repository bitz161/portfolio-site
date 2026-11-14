// Hand-engraving style swirl tile for the app background (Ambient.tsx).
//
// A flow field on a torus (a few vortices plus a gentle drift, summed with their periodic
// images so the field wraps) is traced into evenly spaced streamlines (Jobard–Lefer):
// each line grows until it comes within D_TEST of another line, which is what makes the
// bundles of parallel strokes curl into eyes and taper where they meet. The tile is
// seamless: lines are traced in unwrapped space and drawn at the 3×3 neighbouring offsets.

export const SWIRL_TILE = 360;

const W = SWIRL_TILE;
const H = SWIRL_TILE;
const D_SEP = 4.6; // spacing between neighbouring strokes
const D_TEST = 2.3; // how close a growing stroke may come before it stops
const STEP = 1.4;
const MAX_STEPS = 700;

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Vortex = { x: number; y: number; s: number };

// Each point winds around its nearest curl centre: tangent to a slightly elongated
// ellipse, plus a pull inward so strokes spiral. Neighbouring curls meet along the
// cell borders, where the strokes stop against each other and taper into points.
const TILT = -0.6; // radians: curls lean like the reference's diagonal waves
const STRETCH = 1.5;
const INWARD = 0.32;
function field(vortices: Vortex[]) {
  const c = Math.cos(TILT);
  const s = Math.sin(TILT);
  return (x: number, y: number): [number, number] => {
    let best = Infinity;
    let bu = 0;
    let bw = 0;
    let sign = 1;
    for (const v of vortices) {
      for (let ox = -1; ox <= 1; ox++) {
        for (let oy = -1; oy <= 1; oy++) {
          const dx = x - (v.x + ox * W);
          const dy = y - (v.y + oy * H);
          const u = dx * c + dy * s;
          const w = (-dx * s + dy * c) * STRETCH;
          const r2 = u * u + w * w;
          if (r2 < best) {
            best = r2;
            bu = u;
            bw = w;
            sign = v.s;
          }
        }
      }
    }
    const r = Math.sqrt(best) || 1;
    // tangent and inward pull in the curl's own (rotated, stretched) frame
    const tu = (-bw / r) * sign - (bu / r) * INWARD;
    const tw = (bu / r) * sign - (bw / r) * INWARD;
    const lu = tu;
    const lw = tw / STRETCH;
    const vx = lu * c - lw * s;
    const vy = lu * s + lw * c;
    const m = Math.hypot(vx, vy) || 1;
    return [vx / m, vy / m];
  };
}

const wrap = (v: number, n: number) => ((v % n) + n) % n;

/** Builds the tile's path data (deterministic for a given seed). */
export function swirlPath(seed = 7): string {
  const rand = rng(seed);
  // curl centres on a jittered 3×4 lattice, so the cells come out roughly even
  const vortices: Vortex[] = [];
  for (let gy = 0; gy < 4; gy++)
    for (let gx = 0; gx < 3; gx++)
      vortices.push({
        x: ((gx + 0.5 + (gy % 2) * 0.5 + (rand() - 0.5) * 0.5) * W) / 3,
        y: ((gy + 0.5 + (rand() - 0.5) * 0.4) * H) / 4,
        s: rand() < 0.5 ? 1 : -1,
      });
  const vel = field(vortices);
  // leave each curl's centre open instead of winding strokes into a tight dot
  const nearEye = (x: number, y: number) =>
    vortices.some((v) => {
      let dx = Math.abs(wrap(x, W) - v.x);
      let dy = Math.abs(wrap(y, H) - v.y);
      if (dx > W / 2) dx = W - dx;
      if (dy > H / 2) dy = H - dy;
      return dx * dx + dy * dy < 9 * 9;
    });

  // spatial hash of accepted points, in wrapped coordinates
  const cell = D_SEP;
  const cols = Math.ceil(W / cell);
  const rows = Math.ceil(H / cell);
  const grid: number[][] = Array.from({ length: cols * rows }, () => []); // flat [x, y, lineId, ...]
  const add = (x: number, y: number, id: number) => {
    const wx = wrap(x, W);
    const wy = wrap(y, H);
    grid[Math.floor(wy / cell) * cols + Math.floor(wx / cell)].push(wx, wy, id);
  };
  const tooClose = (x: number, y: number, d: number, self: number) => {
    const wx = wrap(x, W);
    const wy = wrap(y, H);
    const cx = Math.floor(wx / cell);
    const cy = Math.floor(wy / cell);
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const pts = grid[wrap(cy + j, rows) * cols + wrap(cx + i, cols)];
        for (let k = 0; k < pts.length; k += 3) {
          if (pts[k + 2] === self) continue;
          let dx = Math.abs(pts[k] - wx);
          let dy = Math.abs(pts[k + 1] - wy);
          if (dx > W / 2) dx = W - dx;
          if (dy > H / 2) dy = H - dy;
          if (dx * dx + dy * dy < d * d) return true;
        }
      }
    }
    return false;
  };

  const trace = (x0: number, y0: number, dir: 1 | -1, id: number) => {
    const pts: number[] = [];
    let x = x0;
    let y = y0;
    for (let s = 0; s < MAX_STEPS; s++) {
      const [ax, ay] = vel(x, y);
      const [bx, by] = vel(x + (ax * STEP * dir) / 2, y + (ay * STEP * dir) / 2); // RK2
      x += bx * STEP * dir;
      y += by * STEP * dir;
      if (tooClose(x, y, D_TEST, id) || nearEye(x, y)) break;
      pts.push(x, y);
    }
    return pts;
  };

  let d = "";
  const f = (n: number) => n.toFixed(1);
  const seeds: [number, number][] = [];
  for (let gy = 0; gy < H; gy += D_SEP * 1.3) for (let gx = 0; gx < W; gx += D_SEP * 1.3) seeds.push([gx + rand() * 2, gy + rand() * 2]);
  for (let i = seeds.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [seeds[i], seeds[j]] = [seeds[j], seeds[i]];
  }

  let id = 0;
  for (const [sx, sy] of seeds) {
    if (tooClose(sx, sy, D_SEP, -1)) continue;
    id++;
    const fwd = trace(sx, sy, 1, id);
    const back = trace(sx, sy, -1, id);
    const line: number[] = [];
    for (let k = back.length - 2; k >= 0; k -= 2) line.push(back[k], back[k + 1]);
    line.push(sx, sy, ...fwd);
    if (line.length < 16) continue; // drop specks
    // register the accepted line, then emit every other point to keep the path light
    for (let k = 0; k < line.length; k += 2) add(line[k], line[k + 1], id);
    d += `M${f(line[0])} ${f(line[1])}`;
    for (let k = 4; k < line.length; k += 4) d += `L${f(line[k])} ${f(line[k + 1])}`;
  }
  return d;
}

/** The tile as an SVG data URL, black strokes on transparent: used as a CSS mask so the ink colour stays a token. */
export function swirlMaskUrl(seed = 7): string {
  const offsets = [-1, 0, 1].flatMap((ox) => [-1, 0, 1].map((oy) => `<use href="#s" x="${ox * W}" y="${oy * H}"/>`)).join("");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<defs><path id="s" d="${swirlPath(seed)}" fill="none" stroke="#000" stroke-width="0.9" stroke-linecap="round"/></defs>` +
    offsets +
    `</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}
