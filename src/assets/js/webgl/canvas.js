import * as THREE from 'three';
import gsap from 'gsap';

import { CanvasBase } from './canvasBase';
import { loadAssets } from './assetLoader';
import { resolvePath } from './utils';
import { gui } from './gui';
import { mouse2d } from './Mouse2d';

import screenVertex from './shader/screen/vertex.glsl';
import screenFrangemnt from './shader/screen/fragment.glsl';
import sphereVertex from './shader/sphere/vertex.glsl';
import sphereFrangemnt from './shader/sphere/fragment.glsl';

export class Canvas extends CanvasBase {
  constructor(parentNode, observer) {
    super(parentNode);
    this.observer = observer;
    this.images = [];
    this.currentImageIndex = 0;
    this.isFirst = true;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.hoveredLink = false;

    this.assets = {
      image1: { path: resolvePath('assets/img/image1.jpg') },
      image2: { path: resolvePath('assets/img/image2.jpg') },
      image3: { path: resolvePath('assets/img/image3.jpg') },
      image4: { path: resolvePath('assets/img/image4.jpg') },
    };

    this.update = () => {
      if (this.isFirst) {
          this.isFirst = false;
          this.images.forEach(image => {
              this.scene.background = image;
              this.renderer.render(this.scene, this.camera);
          });
          this.observer.readyCanvas = true;
      }
      this.scene.background = null;
      const dt = this.clock.getDelta();
      const sphere = this.getMesh('sphere');
      const link = this.getMesh('link');
      const screenSize = this.calcScreenSize();
      const mouse = { x: mouse2d.position[0] * (screenSize.width / 2), y: mouse2d.position[1] * (screenSize.height / 2) };
      sphere.position.x = THREE.MathUtils.lerp(sphere.position.x, mouse.x, 0.1);
      sphere.position.y = THREE.MathUtils.lerp(sphere.position.y, mouse.y, 0.1);
      sphere.material.uniforms.uTime.value += dt;
      sphere.visible = false;
      // link.visible = true;
      this.renderer.setRenderTarget(this.renderTarget);
      this.renderer.render(this.scene, this.camera);
      sphere.material.uniforms.uTexture.value = this.renderTarget.texture;
      this.renderer.setRenderTarget(null);
      sphere.visible = true;
      // link.visible = false;
      // this.intersect(link);
    };

    loadAssets(this.assets).then(() => {
      this.setScene();
      this.setResize();
      this.createModel();
      this.createGsapAnimation();
      this.addEnvets();
      this.animate(this.update);
    });
  }

  setScene() {
    this.camera.position.z = 3;
    this.renderTarget = new THREE.WebGLRenderTarget(this.size.width, this.size.height);
    this.images.push(this.assets.image1.data, this.assets.image2.data, this.assets.image3.data, this.assets.image4.data);
  }

  setResize() {
    this.resizeCallback = () => {
      const sphere = this.getMesh('sphere');
      sphere.material.uniforms.uScreenCoord.value.copy(this.calcScreenCoord());
      const screen = this.getMesh('screen');
      const { width, height } = this.calcScreenSize();
      screen.scale.set(width, height, 1);
      const current = screen.material.uniforms.uCurrent.value;
      this.calcCoveredTextureScale(current.data, this.size.aspect, current.uvScale);
      // const link = this.getMesh('link');
      // const pos = this.calcLinkPosition();
      // link.position.set(pos.x, pos.y, pos.z);
    }
  }

  calcScreenCoord() {
    const { width, height } = this.size;
    return new THREE.Vector2(width, height).multiplyScalar(window.devicePixelRatio);
  }

  calcScreenSize() {
    const camera = this.camera;
    const fovRadian = (camera.fov / 2) * (Math.PI / 180);
    const screenHeight = camera.position.z * Math.tan(fovRadian) * 2;
    const screenWidth = screenHeight * this.size.aspect;
    return { width: screenWidth, height: screenHeight };
  }

  // calcLinkPosition() {
  //   const { width, height } = this.calcScreenSize();
  //   const link = this.getMesh('link');
  //   const linkGeo = link.geometry;
  //   const x = width / 2 - linkGeo.parameters.width / 2 - 0.1;
  //   const y = -(height / 2) + linkGeo.parameters.height / 2 + 0.1;
  //   return { x, y, z: 0.01 };
  // }

  createModel() {
    // screen plane
    const screenGeo = new THREE.PlaneGeometry(1, 1);
    const screenMat = new THREE.ShaderMaterial({
        uniforms: {
            uCurrent: {
                value: { data: this.images[0], uvScale: this.calcCoveredTextureScale(this.images[0], this.size.aspect) },
            },
            uNext: {
                value: { data: this.images[1], uvScale: this.calcCoveredTextureScale(this.images[1], this.size.aspect) },
            },
            uProgress: { value: 0 },
        },
        vertexShader: screenVertex,
        fragmentShader: screenFrangemnt,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    const { width, height } = this.calcScreenSize();
    screenMesh.scale.set(width, height, 1);
    screenMesh.name = 'screen';
    this.scene.add(screenMesh);
    // wobble sphere
    const sphereGeo = new THREE.IcosahedronGeometry(0.8, 32);
    const sphereMat = new THREE.ShaderMaterial({
        uniforms: {
            uTexture: { value: null },
            uScreenCoord: { value: this.calcScreenCoord() },
            uTime: { value: 0 },
            uRefractPower: { value: 0 },
        },
        vertexShader: sphereVertex,
        fragmentShader: sphereFrangemnt,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereMesh.name = 'sphere';
    this.scene.add(sphereMesh);
    gui.add(sphereMat.uniforms.uRefractPower, 'value', 0, 1, 0.01).name('refract power');
    gui.close();
    // git link
    // const linkGeo = new THREE.PlaneGeometry(0.2, 0.2);
    // const linkMat = new THREE.MeshBasicMaterial({ map: this.assets.github.data, transparent: true });
    // const linkMesh = new THREE.Mesh(linkGeo, linkMat);
    // linkMesh.name = 'link';
    // this.scene.add(linkMesh);
    // const pos = this.calcLinkPosition();
    // linkMesh.position.set(pos.x, pos.y, pos.z);
  }

  getMesh(name) {
    return this.scene.getObjectByName(name);
  }

  createGsapAnimation() {
    const screen = this.getMesh('screen');
    const uniforms = screen.material.uniforms;
    gsap.fromTo(uniforms.uProgress, { value: 0 }, {
        value: 1,
        duration: 5,
        ease: 'power3.out',
        repeat: -1,
        repeatDelay: 2,
        delay: 3,
        onRepeat: () => {
            this.currentImageIndex = this.currentImageIndex < this.images.length - 1 ? this.currentImageIndex + 1 : 0;
            const nextImageIndex = this.currentImageIndex < this.images.length - 1 ? this.currentImageIndex + 1 : 0;
            uniforms.uCurrent.value.data = this.images[this.currentImageIndex];
            uniforms.uCurrent.value.uvScale = this.calcCoveredTextureScale(this.images[this.currentImageIndex], this.size.aspect);
            uniforms.uNext.value.data = this.images[nextImageIndex];
            uniforms.uNext.value.uvScale = this.calcCoveredTextureScale(this.images[nextImageIndex], this.size.aspect);
        },
    });
  }

  addEnvets() {
    window.addEventListener('pointerdown', () => {
        if (this.hoveredLink) {
            window.open('https://github.com/nemutas/', '_blank', 'noopener noreferrer');
        }
    });
  }

  // intersect(target) {
  //   this.raycaster.setFromCamera(this.pointer.set(mouse2d.position[0], mouse2d.position[1]), this.camera);
  //   const intersects = this.raycaster.intersectObjects([target]);
  //   if (intersects.length === 1) {
  //       document.body.style.cursor = 'pointer';
  //       this.hoveredLink = true;
  //   }
  //   else {
  //       document.body.style.cursor = 'auto';
  //       this.hoveredLink = false;
  //   }
  // }

  dispose() {
    super.dispose();
    gui.destroy();
    mouse2d.dispose();
  }

}