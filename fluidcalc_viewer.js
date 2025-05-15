import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.155/examples/jsm/controls/OrbitControls.js';

export class FluidCalcViewer {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.gridSize = 30;
    this.cellSize = 1;
    this.entities = {};
    this.animating = false;
  }

  async start() {
    this.init();
    await this.loadData('simulation.json');
    this.animate();
  }

  stop() {
    this.animating = false;
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  init() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(15, 30, 40);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(this.gridSize / 2, 0, this.gridSize / 2);
    this.controls.update();

    const light = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(light);
  }

  async loadData(url) {
    const response = await fetch(url);
    const data = await response.json();
    const frame = data[0];
    this.renderPressure(frame.pressure);
    this.renderEntities(frame.entities);
  }

  renderPressure(pressure) {
    for (let y = 0; y < pressure.length; y++) {
      for (let x = 0; x < pressure[y].length; x++) {
        const value = pressure[y][x];
        const color = new THREE.Color().setHSL(0.7 - value * 0.1, 1, 0.5);
        const geometry = new THREE.PlaneGeometry(this.cellSize, this.cellSize);
        const material = new THREE.MeshBasicMaterial({
          color: color,
          side: THREE.DoubleSide
        });
        const cell = new THREE.Mesh(geometry, material);
        cell.rotation.x = -Math.PI / 2;
        cell.position.set(x, 0, y);
        this.scene.add(cell);
      }
    }
  }

  renderEntities(entityDict) {
    for (const [name, pos] of Object.entries(entityDict)) {
      const color = name.startsWith("kayak") ? 0x00ffff : 0xff8800;
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshLambertMaterial({ color: color });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(pos[0], 0.5, pos[1]);
      this.scene.add(cube);
      this.entities[name] = cube;
    }
  }

  animate() {
    if (!this.animating) return;
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}
