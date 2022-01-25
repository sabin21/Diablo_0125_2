
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

import modelIcon from '../public/models/logo_icon.glb';
import modelPhoneBody from '../public/models/phone_2_body.glb';
import modelPhoneScreen from '../public/models/phone_2_screen.glb';
import bg1TextureSrc from '../public/textures/back_city.jpg';
import floorRoughnessMap from '../public/SurfaceImperfections003_1K_var1.jpg';
import floorNormalMap from '../public/SurfaceImperfections003_1K_Normal.jpg';

import modelOneIcon from '../public/models/OneStore_Icon.glb';
import oneIconTextureSrc from '../public/models/OneStore_Icon.png';

let container;
let camera, scene, renderer, light, light2;
let video, videoTexture, videoMat, phoneBodyMat, iconRig, trailerTexture, trailerVideo, trailerMat, groundMirror;
let bg1Material, oneStoreMat;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

const trailerRig = new THREE.Object3D();
const oneStoreRig = new THREE.Object3D();

const tipWidth = document.querySelector('.tip-wrap').offsetWidth;

window.onload= homeInit();
function homeInit(){

init();
//-----------------
function init() {
  	container = document.getElementById('container');

  	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( animation );
	renderer.setClearColor(0x000000);
  	container.appendChild( renderer.domElement );
    	  
  	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set( 0, 0, 5 );
	
  	scene = new THREE.Scene();
    
	light = new THREE.PointLight( 0xffffff, 2, 1000 );
    light.position.set(2 ,8 ,10);
	light2 = new THREE.DirectionalLight(0xffffff, 6);

	scene.add(light);
	scene.add(light2);
	
    // Background
	let ang_rad = camera.fov * Math.PI / 180;
    let fov_y = (camera.position.z + 10) * Math.tan(ang_rad / 2) * 2;	
	const textureLoader = new THREE.TextureLoader();
	const bg1Texture = textureLoader.load(bg1TextureSrc);
	const bg1Geometry = new THREE.PlaneGeometry(16*1.4, 9*1.4);
	bg1Material = new THREE.MeshBasicMaterial({ 
		map: bg1Texture,
		transparent:true,
		opacity:0.0
	});

	const bg1Mesh = new THREE.Mesh(bg1Geometry, bg1Material);
	bg1Mesh.scale.set(3.8, 3.8, 1);		
	bg1Mesh.position.set(0, 0.3, -50);
	scene.add(bg1Mesh);
	
	// Floor
    const floorMirrorGeo = new THREE.PlaneGeometry( 400, 400 );
	groundMirror = new Reflector( floorMirrorGeo, {
		clipBias: 0.003,
		textureWidth: window.innerWidth * window.devicePixelRatio,
		textureHeight: window.innerHeight * window.devicePixelRatio,
		color: 0x333333
	});	
	groundMirror.position.y = -1.0;
	groundMirror.rotateX( - Math.PI / 2 );
	scene.add(groundMirror);

    // Icon Mesh
    iconRig = new THREE.Object3D();
    const loader = new GLTFLoader();

    loader.load( modelIcon, function ( gltf ) {
        const iconScene = gltf.scene;
        iconRig.add(iconScene);
    });

    iconRig.position.set(0, -3, 0);
	iconRig.rotation.set(0, 4, 0);
	scene.add(iconRig);

	// Phone Mesh
	let phoneRig = new THREE.Object3D();
	const loaderPhone = new GLTFLoader();
	const loaderPhoneScreen = new GLTFLoader(); 
	let phoneBodyMesh = null;
	let phoneScreenMesh = null;
	let phoneBodyGeo = null;
	
	loaderPhone.load (modelPhoneBody, (gltf) => {
		const stoneMesh = gltf.scene.children.find((mesh) => mesh.name === "phone_body");
		phoneBodyGeo = stoneMesh.geometry.clone();
		phoneBodyMat = new THREE.MeshPhysicalMaterial({
				color : 0x0E0E0E,
                metalness: 0.5,
				roughness: 0.5,
				transmission: 1,
				reflectivity: 0.5,
				thickness: 2.5
			});
		phoneBodyMesh = new THREE.Mesh(phoneBodyGeo, phoneBodyMat);				
		phoneRig.add(phoneBodyMesh);
    });
	
	loaderPhoneScreen.load (modelPhoneScreen, (gltf) => {
		const stoneMesh = gltf.scene.children.find((mesh) => mesh.name === "phone_screen");
		const phoneScreenGeometry = stoneMesh.geometry.clone();
		phoneScreenMesh = new THREE.Mesh(phoneScreenGeometry, videoMat);			
		phoneRig.add(phoneScreenMesh);
    });
	phoneRig.position.set(0.8, -10, -3 );
	phoneRig.rotation.set(0, Math.PI*2, 0 );
	scene.add(phoneRig);

    // video textures - phone screen
	video = document.getElementById( 'video' );
	video.play();
	videoTexture = new THREE.VideoTexture( video, function(video){
		video.wrapS = texture.wrapT = THREE.RepeatWrapping;
		video.offset.set( 0, 0 );
		video.repeat.set(2,2);
	});
	videoMat = new THREE.MeshLambertMaterial({ 
		color:0xffffff, 
		map: videoTexture
	});
	
	//------------------
	// Trailer Screen

	const loaderTrailerScreen = new GLTFLoader();

	trailerVideo = document.getElementById( 'video-trailer' );
	
	trailerTexture = new THREE.VideoTexture( trailerVideo, function(trailerVideo){
		trailerVideo.wrapS = texture.wrapT = THREE.RepeatWrapping;
		trailerVideo.offset.set( 0, 0 );
		trailerVideo.repeat.set(2,2);
	})

	const trailerRoughnessTexture = textureLoader.load(floorRoughnessMap);
	const trailerNormalTexture = textureLoader.load(floorNormalMap);

	trailerMat = new THREE.MeshPhysicalMaterial({ 
		color:0xffffff, 
		map: trailerTexture,
		roughnessMap: trailerRoughnessTexture,
		normalMap: trailerNormalTexture,
		reflectivity: 0,
		metalness:0.1,
		roughness:1,
		transparent:true,
		opacity:1
	});

	const trailerScreenGeo = new THREE.PlaneGeometry(16, 9);
	const trainerScreenMesh = new THREE.Mesh(trailerScreenGeo, trailerMat);
	trailerRig.add(trainerScreenMesh);
	trailerRig.position.set(1.2, -8, -50);				
	scene.add(trailerRig);
	
	//----------------------
	const oneStoreTexture = textureLoader.load(oneIconTextureSrc);

	oneStoreMat = new THREE.MeshLambertMaterial({
		color:0xffffff, 
		map: oneStoreTexture
	});
	loaderTrailerScreen.load (modelOneIcon, (gltf) => {
		const oneIconGlb = gltf.scene.children.find((mesh) => mesh.name === "OneStore_Icon");
		const oneIconGeo = oneIconGlb.geometry.clone();		
		const oneIconMesh = new THREE.Mesh(oneIconGeo, oneStoreMat);	
		oneStoreRig.add(oneIconMesh);
		
    });
	oneStoreRig.position.set(-1.4, 1, 0);
	oneStoreRig.scale.set(0.5,0.5,0.5);
	oneStoreRig.rotation.set(Math.PI/2, -Math.PI/16,Math.PI/12);	
	//scene.add(oneStoreRig);

	//-----------------
	
	window.addEventListener( 'resize', onWindowResize );

	//------------------
	// Intro - ScrollTrigger 

	function trailerPlay(){
		trailerVideo.play();
	}
	function trailerPause(){
		trailerVideo.pause();
	}
	let introTL = new gsap.timeline();
	introTL
	.add('start')
	.to(bg1Material, { opacity: 1, duration:1 })
	.to('.big-logo-wrap', { opacity: 1 , duration: 0.6}, 'start')
	.to(iconRig.position, { y: -0.2 , duration: 4, onComplete: trailerPlay}, 'start')
	.to(iconRig.rotation, { y: 0 , duration: 5}, 'start')
	.delay(1.5).add('middle')
	.to('.big-logo-wrap', { opacity: 0 , duration: 0.4}, 'middle')
	.to(iconRig.position, { z: 6, duration: 0.6}, 'middle')
	.to(iconRig.position, { y: 0, duration: 0.6}, 'middle')
	.to('.header-left-wrap', { left: 0, duration: 0.4})
	.to(groundMirror.position, { y: -4, duration:0.6}, 'middle')
	.to(bg1Material, { opacity: 0.7, duration:1 }, 'middle')		
	.to(trailerRig.position, { y: 0, z:-10, duration:0.6}, 'middle')
	//.to(trailerRig.rotation, { y: -Math.PI/32, duration:0.6}, 'middle')
	.to(light.position, { x: 13, duration: 1, onComplete: scene1Trigger}, 'middle')
	.to('.trailer-link-wrap', { opacity:1, duration:0.4});
	
	gsap.registerPlugin(ScrollTrigger);
	let scene1TL = gsap.timeline();
	let scene2TL = gsap.timeline();
	
	function scene1Trigger(){
		scene1TL
		.add('scene1Start')		
		.to(trailerRig.position, { x: 26, y:2.5, z:-44}, 'scene1Start')
		.to(trailerRig.rotation, { y: -Math.PI/2.6 }, 'scene1Start')
		.to(trailerMat, { opacity: 0.4}, 'scene1Start')
		.to('.trailer-link-wrap', { opacity:0, duration:0.2}, 'scene1Start')
		.to(phoneRig.rotation, { y: 0 }, 'scene1Start')
		.to(phoneRig.position, { y: 0 }, 'scene1Start')
		.to(groundMirror.position, { y: -1.3}, 'scene1Start')
		.add('middle')
		.to('.headline-wrap', { bottom: 260})
		.to('#onestore-icon', { bottom: 540}, 'middle');
		ScrollTrigger.create({
			animation: scene1TL,
			trigger: ".trigger-1",
			start: "top top",
			end : "bottom 100%",
			scrub: true
		});
	}
	
	scene2TL.to('.hero-cover', { opacity: 1});
	ScrollTrigger.create({
		animation: scene2TL,
		trigger: ".trigger-2",
		start: "top 50%",
		end : "top 5%",
		scrub: true
	});
	
	gsap.to(".tip-wrap", {
		scrollTrigger: {
			scrub: true,
			trigger: "#section-tip",
			pin: "#section-tip",
			start: "top top",
			end: tipWidth + 'px'
		}, 
		x: -tipWidth,
		ease: "none"
	});
	//---------------------
		
} // init end ----------------


function onWindowResize() {

	const width = window.innerWidth;
	const height = window.innerHeight;

	camera.aspect = width / height;
	camera.updateProjectionMatrix();

	renderer.setSize( width, height );

}

function animation() {
	camera.lookAt( 0,0,0 );
    render();	
};

function render() {	
  	renderer.render( scene, camera );
}

//------------------------------

gsap.registerPlugin(ScrollToPlugin);
const interviewTriggers = document.querySelectorAll('.interview');
interviewTriggers.forEach(addTimeline);

function addTimeline(interview, i){
	const interviewCon = interview.querySelector('.interview-wrap');
	const timeline = gsap.timeline({
		scrollTrigger: {
		  trigger: interview,
		  start: "center bottom",
		  ease: "power2",
		  toggleActions: "play none none reverse"
		}
	  })
	  .to(interviewCon, { scale: 1, duration: 0.4, stagger: 0.2 }, "-=0.5");
}

const eventTL = new gsap.timeline();

eventTL
.add('start')
.to('#mon-skull-blue', { bottom: '100%', duration: 10, repeat:-1})
.to('#stage-city', { bottom: '100%', duration: 12, repeat:-1},'start')
.to('#mon-spider', { bottom: '120%', duration: 14, repeat:-1},'start')
.to('#mon-skull', { bottom: '100%', duration: 14, repeat:-1},'start')
.to('#mon-hidra', { bottom: '100%', duration: 18, repeat:-1},'start');

}

