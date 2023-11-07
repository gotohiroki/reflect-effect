export class Mouse2D {
  static get instance() {
      if (!this.mouse2d) {
          this.mouse2d = new Mouse2D();
      }
      return this.mouse2d;
  }
  constructor() {
      this.position = [0, 0];

      this.handleMouseMove = (e) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -1 * ((e.clientY / window.innerHeight) * 2 - 1);
        this.position = [x, y];
      };

      this.handleTouchMove = (e) => {
        const { pageX, pageY } = e.touches[0];
        const x = (pageX / window.innerWidth) * 2 - 1;
        const y = -1 * ((pageY / window.innerHeight) * 2 - 1);
        this.position = [x, y];
      };

      window.addEventListener('mousemove', this.handleMouseMove);
      window.addEventListener('touchmove', this.handleTouchMove);
  }
  dispose() {
      window.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('touchmove', this.handleTouchMove);
      Mouse2D.mouse2d = undefined;
  }
}
export const mouse2d = Mouse2D.instance;