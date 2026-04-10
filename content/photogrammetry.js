import * as THREE from "https://esm.sh/three@0.161.0";
import { OrbitControls } from "https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";

export function createTruck(canvas) {

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.width, canvas.height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 2.5;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);

  // Camera
  const camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 0.1, 1000);
  camera.position.set(7.9, 21.2, -42.9);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  // ── Éclairage ──────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 2.5));

  const dirLight = new THREE.DirectionalLight(0xffffff, 4);
  dirLight.position.set(10, 80, 40);
  scene.add(dirLight);

  const dirLight2 = new THREE.DirectionalLight(0xffffff, 4);
  dirLight2.position.set(-10, 80, 40);
  scene.add(dirLight2);

  const dirLight3 = new THREE.DirectionalLight(0xffffff, 4);
  dirLight3.position.set(31.1, -7.9, -61.5);
  scene.add(dirLight3);

  const dirLight4 = new THREE.DirectionalLight(0xffffff, 4);
  dirLight4.position.set(-50.9, 11.7, -17.8);
  scene.add(dirLight4);

  const dirLight5 = new THREE.DirectionalLight(0xffffff, 4);
  dirLight5.position.set(14, 8.5, 61.6);
  scene.add(dirLight5);


  // ── Grille noire + axes ────────────────────────────────────
  const GRID_SIZE = 400;
  const GRID_DIV  = 40;

  // Plan noir
  const groundGeo = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1, metalness: 0 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grille blanche par-dessus
  const grid = new THREE.GridHelper(GRID_SIZE, GRID_DIV, 0xffffff, 0x444444);
  grid.position.y = -0.05; // légèrement au-dessus pour éviter le z-fighting
  scene.add(grid);

  // Axes X (rouge), Y (vert), Z (bleu)
  const axes = new THREE.AxesHelper(30);
  axes.position.y = 0.1;
  scene.add(axes);

  // Labels d'axes (sprites canvas)
  function makeAxisLabel(text, color) {
    const c = document.createElement("canvas");
    c.width = 128; c.height = 64;
    const ctx = c.getContext("2d");
    ctx.fillStyle = color;
    ctx.font = "bold 48px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 64, 32);
    const tex = new THREE.CanvasTexture(c);
    const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(4, 2, 1);
    return sprite;
  }

  const labelX = makeAxisLabel("", "#ff4444");
  labelX.position.set(34, 1, 0);
  scene.add(labelX);

  const labelZ = makeAxisLabel("", "#4488ff");
  labelZ.position.set(0, 1, 34);
  scene.add(labelZ);

  const labelY = makeAxisLabel("", "#44ff44");
  labelY.position.set(0, 34, 0);
  scene.add(labelY);

  // ── HUD position caméra ────────────────────────────────────
  const hud = document.createElement("div");
  Object.assign(hud.style, {
    position:      "fixed",
    bottom:        "20px",
    left:          "20px",
    background:    "rgba(0,0,0,0.7)",
    color:         "#e0e0e0",
    fontFamily:    "monospace",
    fontSize:      "13px",
    padding:       "10px 14px",
    borderRadius:  "8px",
    pointerEvents: "none",
    lineHeight:    "1.8",
    border:        "1px solid rgba(255,255,255,0.15)",
    zIndex:        "9999",
  });
  document.body.appendChild(hud);

  // On positionne le HUD par rapport au parent du canvas
  const parent = canvas.parentElement || document.body;
  parent.style.position = parent.style.position || "relative";
  parent.appendChild(hud);

  function updateHUD() {
    const p = camera.position;
    const t = controls.target;
    hud.innerHTML =
      `<span style="color:#aaa">CAM</span>  x: <b>${p.x.toFixed(1)}</b>  y: <b>${p.y.toFixed(1)}</b>  z: <b>${p.z.toFixed(1)}</b><br>` +
      `<span style="color:#aaa">TGT</span>  x: <b>${t.x.toFixed(1)}</b>  y: <b>${t.y.toFixed(1)}</b>  z: <b>${t.z.toFixed(1)}</b>`;
  }

  // ── Marqueur de position caméra au sol ─────────────────────
  const markerGeo = new THREE.RingGeometry(0.6, 1.2, 24);
  const markerMat = new THREE.MeshBasicMaterial({ color: 0x00ccff, side: THREE.DoubleSide });
  const marker = new THREE.Mesh(markerGeo, markerMat);
  marker.rotation.x = -Math.PI / 2;
  marker.position.y = 0.15;
  scene.add(marker);

  // Ligne verticale du marqueur
  const lineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 60, 0),
  ]);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00ccff, transparent: true, opacity: 0.3 });
  const camLine = new THREE.Line(lineGeo, lineMat);
  scene.add(camLine);

  // ── Déplacements clavier Z/S/Q/D ──────────────────────────
  const keys = {};
  const moveSpeed = 0.4;

  window.addEventListener("keydown", (e) => {
    const handled = ["z", "s", "q", "d"];
    if (handled.includes(e.key.toLowerCase())) {
      e.preventDefault();
      e.stopPropagation();
    }
    keys[e.key.toLowerCase()] = true;
  });
  window.addEventListener("keyup",   (e) => { keys[e.key.toLowerCase()] = false; });

  function handleMovement() {
    const forward = new THREE.Vector3();
    const right   = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0; forward.normalize();
    right.crossVectors(forward, camera.up).normalize();

    if (keys["z"]) { camera.position.addScaledVector(forward,  moveSpeed); controls.target.addScaledVector(forward,  moveSpeed); }
    if (keys["s"]) { camera.position.addScaledVector(forward, -moveSpeed); controls.target.addScaledVector(forward, -moveSpeed); }
    if (keys["q"]) { camera.position.addScaledVector(right,   -moveSpeed); controls.target.addScaledVector(right,   -moveSpeed); }
    if (keys["d"]) { camera.position.addScaledVector(right,    moveSpeed); controls.target.addScaledVector(right,    moveSpeed); }
  }

  // ── Chargement GLB ─────────────────────────────────────────
  const loader = new GLTFLoader();
  loader.load(
    "./content/bart.glb",
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(1, 1, 1);
      model.position.set(0, 1, 0);
      model.rotation.x = -Math.PI / 2;

      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.side = THREE.FrontSide;
          if (child.material.isMeshStandardMaterial || child.material.isMeshPhysicalMaterial) {
            child.geometry.computeVertexNormals();
            child.material.normalScale?.set(0.0, 0.0);
            child.material.needsUpdate = true;
          }
        }
      });

      const box    = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size   = box.getSize(new THREE.Vector3());

      controls.target.copy(center);
      camera.position.set(6.6, 20.8, -42.5);
      controls.update();

      scene.add(model);
    },
    undefined,
    (error) => console.error("Erreur chargement GLB :", error)
  );

  // ── Boucle d'animation ─────────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);
    handleMovement();
    controls.update();

    // Mise à jour marqueur de position caméra
    marker.position.x = camera.position.x;
    marker.position.z = camera.position.z;
    camLine.position.x = camera.position.x;
    camLine.position.z = camera.position.z;

    updateHUD();
    renderer.render(scene, camera);
  }

  animate();
}

function updateHUD() {
  const rect = canvas.getBoundingClientRect();
  hud.style.left   = (rect.left   + 12) + "px";
  hud.style.bottom = (window.innerHeight - rect.bottom + 12) + "px";

  const p = camera.position;
  const t = controls.target;
  hud.innerHTML =
    `<span style="color:#888">CAM</span>  ` +
    `x: <b style="color:#ff6b6b">${p.x.toFixed(1)}</b>  ` +
    `y: <b style="color:#6bff6b">${p.y.toFixed(1)}</b>  ` +
    `z: <b style="color:#6b9fff">${p.z.toFixed(1)}</b><br>` +
    `<span style="color:#888">TGT</span>  ` +
    `x: <b style="color:#ff6b6b">${t.x.toFixed(1)}</b>  ` +
    `y: <b style="color:#6bff6b">${t.y.toFixed(1)}</b>  ` +
    `z: <b style="color:#6b9fff">${t.z.toFixed(1)}</b>`;
}