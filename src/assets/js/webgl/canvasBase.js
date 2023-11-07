import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";

export class CanvasBase {
  constructor(parentNode, containerClassName = 'three-container') {
      this.enableOrbitControlsDamping = false;
      this.handleResize = () => {
          const { width, height, aspect } = this.size;
          this.resizeCallback && this.resizeCallback();
          if (this.camera instanceof THREE.PerspectiveCamera) {
              this.camera.aspect = aspect;
              this.camera.updateProjectionMatrix();
          }
          this.renderer.setSize(width, height);
      };
      // ------------------------------------------------------
      // lifecycle
      this.animate = (callback, isRender = true) => {
          var _a;
          this.animeId = requestAnimationFrame(this.animate.bind(this, callback, isRender));
          this.enableOrbitControlsDamping && ((_a = this._orbitControls) === null || _a === void 0 ? void 0 : _a.update());
          this.stats && this.stats.update();
          callback && callback();
          isRender && this.renderer.render(this.scene, this.camera);
      };
      let container;
      try {
          container = parentNode.querySelector(`.${containerClassName}`);
          if (!container)
              throw new Error(`undefind container: ${containerClassName}`);
      }
      catch (e) {
          console.error(e);
          throw e;
      }
      this.container = container;
      this.init();
      this.addEvents();
  }
  // ------------------------------------------------------
  // initialize
  init() {
      const { width, height, aspect } = this.size;
      // renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(width, height);
      this.renderer.shadowMap.enabled = true;
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      // ↓ with unreal bloom effect
      // renderer.toneMapping = THREE.ACESFilmicToneMapping
      // append canvas element
      this.container.appendChild(this.renderer.domElement);
      // scene
      this.scene = new THREE.Scene();
      // camera
      this.camera = new THREE.PerspectiveCamera(50, aspect, 0.01, 1000);
      this.camera.position.set(0, 0, 5);
      this.clock = new THREE.Clock();
  }
  // ------------------------------------------------------
  // utils
  get size() {
      // const { offsetWidth: width, offsetHeight: height } = this.container
      const { innerWidth: width, innerHeight: height } = window;
      const aspect = width / height;
      return { width, height, aspect };
  }
  setOrbitControls(damping = 0.1) {
      if (!this._orbitControls)
          this._orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
      if (typeof damping === 'number') {
          this._orbitControls.enableDamping = true;
          this._orbitControls.dampingFactor = damping;
      }
      else {
          this._orbitControls.enableDamping = false;
          this._orbitControls.dampingFactor = 0;
      }
      this.enableOrbitControlsDamping = this._orbitControls.enableDamping;
      return this._orbitControls;
  }
  setPerspectiveCamera(fov, aspect, near, far) {
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  }
  setOrthographicCamera(left, right, top, bottom, near, far) {
    this.camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
  }
  calcCoveredTextureScale(texture, aspect, target) {
    const result = target !== null && target !== void 0 ? target : new THREE.Vector2();
    const imageAspect = texture.image.width / texture.image.height;
    if (aspect < imageAspect)
        result.set(aspect / imageAspect, 1);
    else
        result.set(1, imageAspect / aspect);
    return result;
  }
  coveredBackgroundTexture(texture) {
      texture.matrixAutoUpdate = false;
      const scale = this.calcCoveredTextureScale(texture, this.size.aspect);
      texture.matrix.setUvTransform(0, 0, scale.x, scale.y, 0, 0.5, 0.5);
      return texture;
  }
  // ------------------------------------------------------
  // helper
  setAxesHelper(size) {
      const axesHelper = new THREE.AxesHelper(size);
      this.scene.add(axesHelper);
      return axesHelper;
  }
  setStats() {
      if (!this.stats) {
          this.stats = Stats();
          this.container.appendChild(this.stats.dom);
      }
  }
  visibleStats(mode) {
      if (this.stats) {
          this.stats.dom.style.visibility = mode;
      }
  }
  // ------------------------------------------------------
  // event
  addEvents() {
      window.addEventListener('resize', this.handleResize);
  }
  dispose() {
      this.stats && this.container.removeChild(this.stats.dom);
      this.animeId && cancelAnimationFrame(this.animeId);
      window.removeEventListener('resize', this.handleResize);
  }
}
