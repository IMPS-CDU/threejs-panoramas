/*jslint  white: true, browser: true, plusplus: true, nomen: true */
/*global THREE */

//if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
(function() {
	"use strict";
	
	var 
		scene,
		renderer,
		camera;
		

	function render() {
		camera.rotation.copy( camera.rotation );
		camera.updateProjectionMatrix();

		renderer.render( scene, camera );

	}

	function animate() {

		requestAnimationFrame( animate );

		render();

	}		
	
	function setupCube(images) {
		var 
			urls,
			container,
			textureCube,
			shader,
			material,
			skyboxMesh;
			
		urls = [
			images.right,
			images.left,
			images.top,
			images.bottom,
			images.front,
			images.back
		];
		
		textureCube = THREE.ImageUtils.loadTextureCube(urls);
		
		// Initialize shader
		shader = THREE.ShaderLib.cube;
		shader.uniforms.tCube.value = textureCube;
		material = new THREE.ShaderMaterial({
			fragmentShader: shader.fragmentShader,
			vertextShader: shader.vertexShader,
			uniforms: shader.uniforms,
			// What do the following two do?
			depthWrite: false,
			side: THREE.BackSide
		});
		
		skyboxMesh = new THREE.Mesh(new THREE.CubeGeometry(100, 100, 100), material);
		
		scene = new THREE.Scene();
		scene.add(skyboxMesh);
		
		container = document.createElement('div');
		document.body.appendChild(container);
		
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.autoClear = false;
		container.appendChild(renderer.domElement);
		
		camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );
		
		animate();
	}



	
	setupCube({
		front: 'images/ScienceLab PTGUI.front.jpg',
		back: 'images/ScienceLab PTGUI.back.jpg',
		right: 'images/ScienceLab PTGUI.right.jpg',
		left: 'images/ScienceLab PTGUI.left.jpg',
		top: 'images/ScienceLab PTGUI.top.jpg',
		bottom: 'images/ScienceLab PTGUI.bottom.jpg'
	});
		
}());

/*
		camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );
		camera.position.z = 3200;

		cameraCube = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );
	
		scene = new THREE.Scene();
		sceneCube = new THREE.Scene();

		var geometry = new THREE.SphereGeometry( 100, 32, 16 );

		var path = "textures/cube/skybox/";
		var format = '.jpg';
		var urls = [
			images.right,
			images.left,
			images.top,
			images.bottom,
			images.front,
			images.back
		];
		console.log(urls);
		var textureCube = THREE.ImageUtils.loadTextureCube( urls, new THREE.CubeRefractionMapping() );
		var material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube, refractionRatio: 0.95 } );		

		// Skybox

		var shader = THREE.ShaderLib[ "cube" ];
		shader.uniforms[ "tCube" ].value = textureCube;

		var material = new THREE.ShaderMaterial( {

			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false,
			side: THREE.BackSide

		} ),

		mesh = new THREE.Mesh( new THREE.CubeGeometry( 100, 100, 100 ), material );
		sceneCube.add( mesh );

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.autoClear = false;
		container.appendChild( renderer.domElement );
	
		addLight();
		controls = new THREE.OrbitControls( camera, renderer.domElement );
		window.addEventListener( 'resize', onWindowResize, false );
*/