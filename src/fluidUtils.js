import { params } from "./params.js";
import { IX } from "./fluid.js";

export const fluidUtils = {


  diffuse(b, x, x0, diff, dt) {
    let a = dt * diff * (params.N - 2) * (params.N - 2);
    lin_solve(b, x, x0, a, 1 + 6 * a);
  },

  project(velocX, velocY, p, div) {
    const N = params.N;
    for (let j = 1; j < params.N - 1; j++) {
      for (let i = 1; i < params.N - 1; i++) {
        div[IX(i, j)] =
          (-0.5 *
            (velocX[IX(i + 1, j)] -
              velocX[IX(i - 1, j)] +
              velocY[IX(i, j + 1)] -
              velocY[IX(i, j - 1)])) /
          params.N;
        p[IX(i, j)] = 0;
      }
    }

    set_bnd(0, div);
    set_bnd(0, p);
    lin_solve(0, p, div, 1, 6);

    for (let j = 1; j < params.N - 1; j++) {
      for (let i = 1; i < params.N - 1; i++) {
        velocX[IX(i, j)] -= 0.5 * (p[IX(i + 1, j)] - p[IX(i - 1, j)]) * params.N;
        velocY[IX(i, j)] -= 0.5 * (p[IX(i, j + 1)] - p[IX(i, j - 1)]) * params.N;
      }
    }

    set_bnd(1, velocX);
    set_bnd(2, velocY);
  },

  advect(b, d, d0, velocX, velocY, dt) {
    let i0, i1, j0, j1;

    let dtx = dt * (params.N - 2);
    let dty = dt * (params.N - 2);

    let s0, s1, t0, t1;
    let x, y;

    let Nfloat = params.N - 2;
    let ifloat, jfloat;
    let i, j;

    for (j = 1, jfloat = 1; j < params.N - 1; j++, jfloat++) {
      for (i = 1, ifloat = 1; i < params.N - 1; i++, ifloat++) {
        x = ifloat - dtx * velocX[IX(i, j)];
        y = jfloat - dty * velocY[IX(i, j)];

        if (x < 0.5) x = 0.5;
        if (x > Nfloat + 0.5) x = Nfloat + 0.5;
        i0 = Math.floor(x);
        i1 = i0 + 1;
        if (y < 0.5) y = 0.5;
        if (y > Nfloat + 0.5) y = Nfloat + 0.5;
        j0 = Math.floor(y);
        j1 = j0 + 1;

        s1 = x - i0;
        s0 = 1.0 - s1;
        t1 = y - j0;
        t0 = 1.0 - t1;

        d[IX(i, j)] =
          s0 * (t0 * d0[IX(i0, j0)] + t1 * d0[IX(i0, j1)]) +
          s1 * (t0 * d0[IX(i1, j0)] + t1 * d0[IX(i1, j1)]);
      }
    }

    set_bnd(b, d);
  },
};

function lin_solve(b, x, x0, a, c) {
  for (let k = 0; k < 20; k++) {
    for (let j = 1; j < params.N - 1; j++) {
      for (let i = 1; i < params.N - 1; i++) {
        x[IX(i, j)] =
          (x0[IX(i, j)] +
            a *
              (x[IX(i + 1, j)] +
               x[IX(i - 1, j)] +
               x[IX(i, j + 1)] +
               x[IX(i, j - 1)])) /
          c;
      }
    }
    set_bnd(b, x);
  }
}

function set_bnd(b, x) {
  const N = params.N;
  for (let i = 1; i < N - 1; i++) {
    x[IX(i, 0)] = b === 2 ? -x[IX(i, 1)] : x[IX(i, 1)];
    x[IX(i, N - 1)] = b === 2 ? -x[IX(i, N - 2)] : x[IX(i, N - 2)];
  }
  for (let j = 1; j < N - 1; j++) {
    x[IX(0, j)] = b === 1 ? -x[IX(1, j)] : x[IX(1, j)];
    x[IX(N - 1, j)] = b === 1 ? -x[IX(N - 2, j)] : x[IX(N - 2, j)];
  }

  x[IX(0, 0)] = 0.5 * (x[IX(1, 0)] + x[IX(0, 1)]);
  x[IX(0, N - 1)] = 0.5 * (x[IX(1, N - 1)] + x[IX(0, N - 2)]);
  x[IX(N - 1, 0)] = 0.5 * (x[IX(N - 2, 0)] + x[IX(N - 1, 1)]);
  x[IX(N - 1, N - 1)] = 0.5 * (x[IX(N - 2, N - 1)] + x[IX(N - 1, N - 2)]);
}
