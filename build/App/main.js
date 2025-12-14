/*
This is a simple audio visualizer
built by me Brian feel free to use!!
no copyright reserved
For more, check out on my github 
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SimplexNoise } from '../@three/jsm/math/SimplexNoise.js';
import { EffectComposer } from '../@three/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../@three/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../@three/jsm/postprocessing/UnrealBloomPass.js';

const imNoise = new SimplexNoise(Math);

const [renderer, scene, camera, clock] = [
    new THREE.WebGLRenderer(),
    new THREE.Scene(),
    new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .0001, 2000),
    new THREE.Clock()
]

renderer.setSize(window.innerWidth, window.innerHeight, true);
camera.position.set(0, 0, -10);
camera.lookAt(0, 0, 0);
const ctrls = new OrbitControls(camera, renderer.domElement);

//

const listener = new THREE.AudioListener();

const audio = new THREE.Audio(listener);

const file = "assets/media/Egyptian- Audio_dessert.mp3";

const media = new Audio(file);

audio.setMediaElementSource(media);

const analyzer = new THREE.AudioAnalyser(audio, 64);

//

const light = new THREE.DirectionalLight(0XFFFFFF, 2);
light.position.set(0, 10, 3);
light.lookAt(0, 0, 0);
scene.add(light);

const ambient = new THREE.AmbientLight(0xFFFFFF, 1);
scene.add(ambient);

const sphere = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3, 20),
    new THREE.MeshBasicMaterial({ color: 0xffd700, wireframe: true })
)

const init = {
    geo: new THREE.IcosahedronGeometry(3, 20).attributes.position
}

sphere.geometry.computeVertexNormals();

scene.add(sphere);

//

function verts(delta, fr) {
    const sphConfig = {
        count: init.geo.count
    }
    for (let n = 0; n < sphConfig.count; n++) {
        const [x, y, z] = [
            init.geo.getX(n),
            init.geo.getY(n),
            init.geo.getZ(n)
        ]
        const df = fr[10] * 2 / 256 / 4;
        const v = (noise.perlin3(x / 1 + delta, y / 1 + delta, z / 1 + delta) * df / 2) + 1;
        //const v = (imNoise.noise3d(x / 1 + delta, y / 1 + delta, z / 1 + delta) * df / 2) + 1; used this for built in Three.js Simplex Noise
        sphere.geometry.attributes.position.setXYZ(n, x * v, y * v, z * v);
        sphere.geometry.attributes.position.needsUpdate = true;
    }
}

//Post Processing
const composer = new EffectComposer( renderer );

const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), .5, 1, .2 );
composer.addPass( bloomPass );
//
document.body.appendChild(renderer.domElement);

window.addEventListener( 'resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight, true);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    bloomPass.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );
});

document.getElementById("play").addEventListener("click", initSong);

function render() {
    verts(clock.getElapsedTime(), analyzer.getFrequencyData());
    //renderer.render(scene, camera);
    composer.render();
    requestAnimationFrame(render);
}

render();

function initSong() {
    document.getElementById("mask").remove();
    media.play();
}