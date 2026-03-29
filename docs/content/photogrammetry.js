import * as THREE from "https://esm.sh/three@0.161.0";
import { OrbitControls } from "https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";

export function createTruck(canvas) {

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.width, canvas.height);

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.width / canvas.height,
    0.1,
    1000
  );
  camera.position.set(3, 3, 5);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Lights
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 5, 5);
  scene.add(dirLight);

  // Axes
  const axesHelper = new THREE.AxesHelper(0.2); // size
  scene.add(axesHelper);

  // Grid
  const gridHelper = new THREE.GridHelper(10, 20, 0xffffff, 0xffffff);
  gridHelper.material.opacity = 0.25;
  gridHelper.material.transparent = true;
  gridHelper.position.y = 0;
  scene.add(gridHelper);

  // Load GLB
  const loader = new GLTFLoader();
  loader.load(
    "./content/texturedMesh.glb",
    (gltf) => {
      const model = gltf.scene;

      model.scale.set(1, 1, 1);
      model.position.set(0, 0, 0);

      scene.add(model);
    },
    undefined,
    (error) => {
      console.error("Erreur chargement GLB :", error);
    }
  );

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}