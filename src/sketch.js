import { Fluid } from "./fluid.js";
import { params } from "./params.js";
import p5 from "p5";

export const sketch = (p) => {
  let fluid;

  p.setup = () => {
    p.createCanvas(600, 600);
    p.frameRate(22);
    fluid = new Fluid(0.2, 0, 0.0000001, p);  // On passe p au constructeur pour utiliser p dans Fluid
  };

  p.draw = () => {
    p.background(255);
    p.stroke(51);
    p.strokeWeight(2);

    let cx = p.int((0.5 * p.width) / params.SCALE);
    let cy = p.int((0.5 * p.height) / params.SCALE);

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        fluid.addDensity(cx + i, cy + j, p.random(50, 150));
      }
    }

    for (let i = 0; i < 2; i++) {
      let angle = p.noise(params.t) * p.TWO_PI * 2;
      let v = p5.Vector.fromAngle(angle);
      v.mult(0.2);
      params.t += 0.01;
      fluid.addVelocity(cx, cy, v.x, v.y);
    }

    fluid.step();
    fluid.renderD();
  };
};
