import { fluidUtils } from "./fluidUtils.js";
import { params } from "./params.js";

export function IX(x, y) {
  return x + y * params.N;
}

export class Fluid {
  constructor(dt, diffusion, viscosity, p) {
    this.p = p; // On stocke p pour utiliser les fonctions p5 (fill, noStroke...)
    this.size = params.N;
    this.dt = dt;
    this.diff = diffusion;
    this.visc = viscosity;

    this.s = new Array(params.N * params.N).fill(0);
    this.density = new Array(params.N * params.N).fill(0);

    this.Vx = new Array(params.N * params.N).fill(0);
    this.Vy = new Array(params.N * params.N).fill(0);

    this.Vx0 = new Array(params.N * params.N).fill(0);
    this.Vy0 = new Array(params.N * params.N).fill(0);
  }

  step() {
    fluidUtils.diffuse(1, this.Vx0, this.Vx, this.visc, this.dt);
    fluidUtils.diffuse(2, this.Vy0, this.Vy, this.visc, this.dt);

    fluidUtils.project(this.Vx0, this.Vy0, this.Vx, this.Vy);

    fluidUtils.advect(1, this.Vx, this.Vx0, this.Vx0, this.Vy0, this.dt);
    fluidUtils.advect(2, this.Vy, this.Vy0, this.Vx0, this.Vy0, this.dt);

    fluidUtils.project(this.Vx, this.Vy, this.Vx0, this.Vy0);

    fluidUtils.diffuse(0, this.s, this.density, this.diff, this.dt);
    fluidUtils.advect(0, this.density, this.s, this.Vx, this.Vy, this.dt);
  }

  addDensity(x, y, amount) {
    let index = IX(x, y);
    this.density[index] += amount;
  }

  addVelocity(x, y, amountX, amountY) {
    let index = IX(x, y);
    this.Vx[index] += amountX;
    this.Vy[index] += amountY;
  }

  renderD() {
    const p = this.p;
    p.colorMode(p.HSB, 255);
    for (let i = 0; i < params.N; i++) {
      for (let j = 0; j < params.N; j++) {
        let x = i * params.SCALE;
        let y = j * params.SCALE;
        let d = this.density[IX(i, j)];
        p.fill((d + 50) % 255, 200, d);
        p.noStroke();
        p.square(x, y, params.SCALE);
      }
    }
  }

  renderV() {
    const p = this.p;
    for (let i = 0; i < params.N; i++) {
      for (let j = 0; j < params.N; j++) {
        let x = i * params.SCALE;
        let y = j * params.SCALE;
        let vx = this.Vx[IX(i, j)];
        let vy = this.Vy[IX(i, j)];

        p.stroke(255);
        if (!(Math.abs(vx) < 0.1 && Math.abs(vy) <= 0.1)) {
          p.line(x, y, x + vx * params.SCALE, y + vy * params.SCALE);
        }
      }
    }
  }
}
