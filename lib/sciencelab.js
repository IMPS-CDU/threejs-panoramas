/*jslint  white: true, browser: true, plusplus: true, nomen: true */
/*global THREE, requestAnimationFrame, console */

//if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
(function() {
	"use strict";
	var 
		container,
		camera, 
		scene, 
		renderer,
		cameraCube, 
		sceneCube,
		mesh, 
	images;

	
	function onWindowResize() {
		var 
			windowHalfX,
			windowHalfY;
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		cameraCube.aspect = window.innerWidth / window.innerHeight;
		cameraCube.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}


	function render() {
		cameraCube.rotation.copy( camera.rotation );
		cameraCube.updateProjectionMatrix();

		renderer.render( sceneCube, cameraCube );
		renderer.render( scene, camera );

	}


	function animate() {
	
		requestAnimationFrame( animate );

		render();
	
	}


	
	function init() {
		var 
			controls,
			urls,
			textureCube,
			material,
			shader;

		// Create the cameras and scene
		camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );
		camera.position.z = 3200;
		cameraCube = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );
		scene = new THREE.Scene();
		sceneCube = new THREE.Scene();
			
		urls = [
			images.right,
			images.left,
			images.top,
			images.bottom,
			images.front,
			images.back
		];
		textureCube = THREE.ImageUtils.loadTextureCube( urls, new THREE.CubeRefractionMapping() );

		// Skybox

		shader = THREE.ShaderLib.cube;
		shader.uniforms.tCube.value = textureCube;

		material = new THREE.ShaderMaterial( {

			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false,
			side: THREE.BackSide

		} );

		mesh = new THREE.Mesh( new THREE.CubeGeometry( 100, 100, 100 ), material );
		sceneCube.add( mesh );
		
		container = document.createElement( 'div' );
		document.body.appendChild( container );
				
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.autoClear = false;
		container.appendChild( renderer.domElement );
	
		controls = new THREE.OrbitControls( camera, renderer.domElement );
		window.addEventListener( 'resize', onWindowResize, false );


		
		
		document.getElementById("loadingScreen").style.display = "none";
		
		
	}
	
	
	images = {
		front: 'images/ScienceLab PTGUI.front.jpg',
		back: 'images/ScienceLab PTGUI.back.jpg',
		right: 'images/ScienceLab PTGUI.right.jpg',
		left: 'images/ScienceLab PTGUI.left.jpg',
		top: 'images/ScienceLab PTGUI.top.jpg',
		bottom: 'images/ScienceLab PTGUI.bottom.jpg'
	};


	init();
	animate();
	
}());