import './style.css'
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from "dat.gui"
import { CCDIKSolver } from "three/addons/animation/CCDIKSolver.js"

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x3d3d3d)
const loader = new GLTFLoader()

// Add lights and camera to the scene
const light = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(light);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);

// Render the scene
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a camera
const cameraDistance = 1
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(cameraDistance, cameraDistance, cameraDistance);

// Create an instance of OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Optional smoothness while rotating

function addGrid() {
  const size = 5;
  const divisions = 20;

  const gridHelper = new THREE.GridHelper(size, divisions);
  scene.add(gridHelper);
}

var UR3, joint1, joint2, joint3, joint4, joint5, joint6;
var baseHitbox, elboxHitbox, wristHitbox, wrist2Hitbox, wrist3Hitbox

loader.load('assets/ur/ur3.glb', (object) => {
  // Add the loaded object to the scene
  scene.add(object.scene);
  object.scene.updateMatrixWorld(true)

  // Access the UR3 object after it's loaded
  UR3 = scene.getObjectByName("UR3");
  joint1 = UR3.getObjectByName("Joint_1");
  joint2 = UR3.getObjectByName("Joint_2");
  joint3 = UR3.getObjectByName("Joint_3");
  joint4 = UR3.getObjectByName("Joint_4");
  joint5 = UR3.getObjectByName("Joint_5");
  joint6 = UR3.getObjectByName("Joint_6");

  // Add axis
  joint1.add(axisBase)
  joint3.add(axisElbow)
  joint6.add(axisTip)

  // Initial position
  joint2.rotation.y = -Math.PI / 2
  joint4.rotation.y = -Math.PI / 2

  // Add hitbox
  const baseSizeX = .13
  const baseSizeY = .22
  const baseSizeZ = .13
  baseHitbox = createBox(baseSizeX, baseSizeY, baseSizeZ, 0x00ff00)
  baseHitbox.translateY(-0.045)
  joint1.add(baseHitbox)

  const elbowSizeX = .115
  const elbowSizeY = .33
  const elbowSizeZ = .095
  const elbowYOffset = .12
  elboxHitbox = createBox(elbowSizeY, elbowSizeX, elbowSizeZ, 0xff0000)
  elboxHitbox.translateY(baseSizeX / 2 + elbowSizeX / 2)
  elboxHitbox.translateX(-elbowYOffset)
  joint2.add(elboxHitbox)

  const wristSizeX = .085
  const wristSizeY = .295
  const wristSizeZ = .095
  const wristOffset = .1
  wristHitbox = createBox(wristSizeY, wristSizeX, wristSizeZ, 0x0000ff)
  wristHitbox.translateY((baseSizeX / 2) + (elbowSizeX / 2) - (wristSizeX / 2) - (elbowSizeX / 2))
  wristHitbox.translateX(-wristOffset)
  joint3.add(wristHitbox)

  const wrist2SizeX = .08
  const wrist2SizeY = .09
  const wrist2SizeZ = .095
  wrist2Hitbox = createBox(wrist2SizeX, wrist2SizeY, wrist2SizeZ, 0xf0f0f0)
  joint4.add(wrist2Hitbox)

  const wrist3SizeX = .08
  const wrist3SizeY = .085
  const wrist3SizeZ = .13
  wrist3Hitbox = createBox(wrist3SizeX, wrist3SizeY, wrist3SizeZ, 0x0f0f0f)
  wrist3Hitbox.translateZ(-.015)
  wrist3Hitbox.translateY(0.005)
  joint5.add(wrist3Hitbox)

  // Add GUI
  let movement = gui.addFolder("Movement")
  movement.add(joint1.rotation, 'y', -Math.PI, Math.PI).name("Base")
  movement.add(joint2.rotation, 'y', -Math.PI, Math.PI).name("Shoulder")
  movement.add(joint3.rotation, 'y', -Math.PI, Math.PI).name("Elbow")
  movement.add(joint4.rotation, 'y', -Math.PI, Math.PI).name("Wrist_1")
  movement.add(joint5.rotation, 'y', -Math.PI, Math.PI).name("Wrist_2")
  movement.add(joint6.rotation, 'y', -Math.PI, Math.PI).name("Wrist_3")

}, (xhr) => {
  //console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
}, (error) => {
  console.log(error);
});


var uiFunctions = {
  setToHome: () => {
    joint1.rotation.y = 0;
    joint2.rotation.y = -Math.PI / 2
    joint3.rotation.y = 0;
    joint4.rotation.y = -Math.PI / 2
    joint5.rotation.y = 0;
    joint6.rotation.y = 0;
  }
}

// GUI
const gui = new GUI()
gui.add(uiFunctions, 'setToHome').name("Home")
let axisBase = new THREE.AxesHelper(1)
let axisTip = new THREE.AxesHelper(1)
let axisElbow = new THREE.AxesHelper(1)
axisBase.visible = false;
axisElbow.visible = false;
axisTip.visible = false
let axisWorld = new THREE.AxesHelper(5);
scene.add(axisWorld)

let axisFolder = gui.addFolder("Axis")
axisFolder.add(axisWorld, 'visible').name("World")
axisFolder.add(axisBase, 'visible').name("Base")
axisFolder.add(axisElbow, 'visible').name("Elbow")
axisFolder.add(axisTip, 'visible').name("Tip")


function createBox(x, y, z, color) {
  const geometry = new THREE.BoxGeometry(x, y, z);
  const material = new THREE.MeshBasicMaterial({ color: color });
  const cube = new THREE.Mesh(geometry, material);
  cube.material.transparent = true
  cube.material.opacity = 0.4
  return cube
}


function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);

  // detect collision
  // let basebb = new THREE.Box3().setFromObject(baseHitbox);
  // let elbowbb = new THREE.Box3().setFromObject(wristHitbox);
  // console.log(basebb.intersectsBox(elbowbb))
}
addGrid()
animate();