export default class Pendulum {
  constructor(angle, mass, length) {
    this.angle = angle;
    this.mass = mass;
    this.length = length;
    this.angularVelocity = 0;
    this.timeStep = 0.1;
  }

  update() {
    const gravity = 9.81;
    const angularAcceleration = -(gravity / this.length) * Math.sin(this.angle);
    this.angularVelocity += angularAcceleration * this.timeStep;
    this.angle += this.angularVelocity * this.timeStep;
  }

  getCoordinates() {
    this.update();
    const x = this.length * Math.sin(this.angle);
    const y = this.length * Math.cos(this.angle);
    return { x, y };
  }
}
