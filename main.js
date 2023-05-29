import './style.css';

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

let relativeX = 0.0;
let relativeY = 0.0;
const scaleFactor = 1.3;

const s = (sketch) => {
    let poseNet;
    let poses;
    const scaleFactor = 1.3;
    let capture;

    sketch.setup = () => {
        sketch.createCanvas(scaleFactor*640, scaleFactor*480, p5.WEBGL);
        capture = sketch.createCapture(p5.VIDEO);
        capture.size(scaleFactor*640, scaleFactor*480);
        capture.hide();

        poseNet = ml5.poseNet(capture);
        poseNet.on("pose", (results) => {
            poses = results;
        });
    };

    sketch.draw = () => {
        // sketch.translate(sketch.width, 0); // move to far corner
        // sketch.scale(-1.0, 1.0);

        if (poses && poses.length > 0) {
            const pose = poses[0];
            const nose = pose.pose.nose;
            // Value between 0.0 - 1.0
            relativeX = nose.x / sketch.width;
            relativeY = nose.y / sketch.height;
            // Turn it into value between -0.5 and 0.5.
            relativeX -= 0.5;
            relativeY -= 0.5;
        }
    }
}

let myp5 = new p5(s);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
// renderer.setSize(scaleFactor*640, scaleFactor*640)
document.body.appendChild( renderer.domElement );

const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);
gridHelper.traverse(function (child) {child.visible = false;})

let eyeLeft;
const loader = new GLTFLoader();
loader.load ('/surveillancecamera_test.glb', function(gltf){
  scene.add(gltf.scene);
  eyeLeft = gltf.scene.getObjectByName("Eye_Left");
});

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 2);
spotLight.position.set(0,3,10);
spotLight.target.position.set(0,3,0);
scene.add(spotLight);
scene.add(spotLight.target);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);
spotLightHelper.traverse(function (child) {child.visible = false;})

camera.position.z = 8;
camera.position.y = 2;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0,2,0);

function animate() {

    requestAnimationFrame(animate);
    controls.update();

    if (eyeLeft) {
        eyeLeft.rotation.y = -relativeX;
        eyeLeft.rotation.x = relativeY;
    }

    renderer.render(scene, camera);
}
animate();


