import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;  // Enable shadow mapping
document.getElementById('app').appendChild(renderer.domElement);

// Orbit Controls for camera interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 10;

// Set scene background color
scene.background = new THREE.Color('#72c0ff');

// Ground plane for shadows
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -1.5;
plane.receiveShadow = true;
scene.add(plane);

// Lighting setup
const pointLight1 = new THREE.PointLight(0xffffff, 1.5, 100);
pointLight1.position.set(10, 15, 10);
pointLight1.castShadow = true;
pointLight1.shadow.mapSize.width = 1024; // Higher resolution shadow
pointLight1.shadow.mapSize.height = 1024;
scene.add(pointLight1);

const spotLight = new THREE.SpotLight(0xffa500, 1);
spotLight.position.set(-10, 20, 5);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.3;
spotLight.castShadow = true;
scene.add(spotLight);

const directionalLight = new THREE.DirectionalLight(0xffc0cb, 0.5);
directionalLight.position.set(-5, 10, -10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Load GLTF model
const loader = new GLTFLoader();
loader.load(
    'https://cdn.devdojo.com/assets/3d/parrot.glb',
    function (gltf) {
        const model = gltf.scene;
        model.position.set(0, -1, 0); 
        model.scale.set(0.3, 0.3, 0.3);
        model.traverse((node) => {
            if (node.isMesh) node.castShadow = true; // Ensure the model casts shadows
        });
        scene.add(model);

        // Animation
        function animate() {
            requestAnimationFrame(animate);
            model.rotation.x += 0.01;
            model.rotation.y += 0.01;
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
    },
    undefined,
    function (error) {
        console.error('An error occurred loading the model:', error);
    }
);

// Set camera position and adjust field of view for better fit
camera.position.set(0, 2, 6);

// Resize handler for responsive view
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
