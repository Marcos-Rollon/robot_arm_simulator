import './style.css'
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { UR3Robot } from './src/components/ur3Robot';
import { GUI } from "dat.gui"

function addLights(scene) {
    const light = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(light);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    scene.add(directionalLight);

}

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x3d3d3d)

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera
const cameraDistance = 1
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(cameraDistance, cameraDistance, cameraDistance);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Optional smoothness while rotating

// Gui instance
const gui = new GUI();

function addGrid() {
    const size = 2;
    const divisions = 10;

    const gridHelper = new THREE.GridHelper(size, divisions);
    scene.add(gridHelper);
}

function addAxisHelper(scene) {
    const axis = new THREE.AxesHelper(1);
    scene.add(axis)
}

// Define the robot
const robot = new UR3Robot('assets/ur/ur3.glb', gui, scene, (model) => {
    addLights(scene)
    addGrid(scene)
    addAxisHelper(scene)
    scene.add(model)

    // Execute the loop when the robot is loaded
    animate()
})

let previousRAF = null;
// Main loop function
function animate() {
    requestAnimationFrame((t) => {
        if (previousRAF === null) {
            previousRAF = t;
        }
        controls.update();
        robot.calculateCollisions(scene, t - previousRAF);
        renderer.render(scene, camera);
        animate()
    });

}