import * as THREE from "https://unpkg.com/three@0.161.0/build/three.module.js";

export function createCube(canvas) {
  const w = 800;
  const h = 800;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x80667D);

  const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
  camera.position.set(2, 2, 2);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });
  renderer.setSize(w, h);

  // Light
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  // Cube
  const geo = new THREE.BoxGeometry();
  const mat = new THREE.MeshStandardMaterial({ color: 0x641FA1 });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  function animate() {
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}