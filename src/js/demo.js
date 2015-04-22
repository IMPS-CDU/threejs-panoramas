/*jslint  white: true, browser: true, plusplus: true, nomen: true */
/*global THREE, requestAnimationFrame, console */

(function() {
	"use strict";
	
	var SkyCube = function(params) {
		this.init(params);
	};
	window.SkyCube = SkyCube;
	var p = SkyCube.prototype;
	
	
	// Public Properties
	
	/**
	 * Array of images to show on skycube
	 * @name images
	 * @type Object
	 * @memberof SkyCube
	 **/
	p.images = null;

	/**
	 * ID for div to contain skycube
	 * @name parentId
	 * @type String
	 * @memberof SkyCube
	 **/
	p.parentId = null;

	/**
	 * Dom element for parent div to hold skycube
	 * @name container
	 * @type DomElement
	 * @memberof SkyCube
	 **/
	p.container = null;
	
	/**
	 * Camera used to render user view (I think)
	 * @name camera
	 * @type THREE.PerspectiveCamera
	 * @memberof SkyCube
	 **/
	p.camera = null;
	
	/**
	 * Camera used to render cube (I think)
	 * @name camera
	 * @type THREE.PerspectiveCamera
	 * @memberof SkyCube
	 **/
	p.cameraCube = null;
	
	/**
	 * Scene used to render user view
	 * @name camera
	 * @type THREE.Scene
	 * @memberof SkyCube
	 **/
	p.scene = null;
	
	/**
	 * Scene used to render user view
	 * @name camera
	 * @type THREE.Scene
	 * @memberof SkyCube
	 **/
	p.sceneCube = null;
	
	/**
	 * Skybox mesh to render the cube
	 * @name mesh
	 * @type THREE.Mesh
	 * @memberof SkyCube
	 **/
	p.mesh = null;
	
	/**
	 * WebGL Renderer
	 * @name renderer
	 * @type THREE.WebGLRenderer
	 * @memberof SkyCube
	 **/
	p.renderer = null;

	p.morphs = [];
	p.clock = null;
	


	/**
	* Initalise a new skycube
	* Requires the following paramsters:
	*   parentId: The id for DOM element to contain the skycube
	*   images: Object containing image paths for panorama. The following must be set: right, left, top, button, front and back
	* Note that IOS Safari refuses to load skycube images over 1024x1024
	* @function init
	* @param params An object containing images and parentId for the skycube. 
	* @throws Error if parentId or images are not set
	* @memberof Skycube
	*/
	p.init = function(params) {
		var 
			controls,
			urls,
			textureCube,
			material,
			shader;
		
		if(!params.parentId) {
			throw new Error("parentId is not set");
		}
		if(!params.images) {
			throw new Error("images not set for skybox");
		}
		if(!params.images.right || !params.images.left || !params.images.top || !params.images.bottom || !params.images.front || !params.images.back) {
			throw new Error("Missing images. Ensure images are set for right, left, top, bottom, front and back");
		}
		
		this.container = document.createElement( 'div' );
		document.body.appendChild( this.container );		
		
		this.parentId = params.parentId;
		this.container = document.getElementById(this.parentId);
		this.images = params.images;
/*jslint  white: true, browser: true, plusplus: true, nomen: true */
/*global THREE, requestAnimationFrame, console */

(function() {
	"use strict";
	
	var SkyCube = function(params) {
		this.init(params);
	};
	window.SkyCube = SkyCube;
	var p = SkyCube.prototype;
	
	
	// Public Properties
	
	/**
	 * Array of images to show on skycube
	 * @name images
	 * @type Object
	 * @memberof SkyCube
	 **/
	p.images = null;

	/**
	 * ID for div to contain skycube
	 * @name parentId
	 * @type String
	 * @memberof SkyCube
	 **/
	p.parentId = null;

	/**
	 * Dom element for parent div to hold skycube
	 * @name container
	 * @type DomElement
	 * @memberof SkyCube
	 **/
	p.container = null;
	
	/**
	 * Camera used to render user view (I think)
	 * @name camera
	 * @type THREE.PerspectiveCamera
	 * @memberof SkyCube
	 **/
	p.camera = null;
	
	/**
	 * Camera used to render cube (I think)
	 * @name camera
	 * @type THREE.PerspectiveCamera
	 * @memberof SkyCube
	 **/
	p.cameraCube = null;
	
	/**
	 * Scene used to render user view
	 * @name camera
	 * @type THREE.Scene
	 * @memberof SkyCube
	 **/
	p.scene = null;
	
	/**
	 * Scene used to render user view
	 * @name camera
	 * @type THREE.Scene
	 * @memberof SkyCube
	 **/
	p.sceneCube = null;
	
	/**
	 * Skybox mesh to render the cube
	 * @name mesh
	 * @type THREE.Mesh
	 * @memberof SkyCube
	 **/
	p.mesh = null;
	
	/**
	 * WebGL Renderer
	 * @name renderer
	 * @type THREE.WebGLRenderer
	 * @memberof SkyCube
	 **/
	p.renderer = null;

	p.morphs = [];
	p.clock = null;
	


	/**
	* Initalise a new skycube
	* Requires the following paramsters:
	*   parentId: The id for DOM element to contain the skycube
	*   images: Object containing image paths for panorama. The following must be set: right, left, top, button, front and back
	* Note that IOS Safari refuses to load skycube images over 1024x1024
	* @function init
	* @param params An object containing images and parentId for the skycube. 
	* @throws Error if parentId or images are not set
	* @memberof Skycube
	*/
	p.init = function(params) {
		var 
			controls,
			urls,
			textureCube,
			material,
			shader;
		
		if(!params.parentId) {
			throw new Error("parentId is not set");
		}
		if(!params.images) {
			throw new Error("images not set for skybox");
		}
		if(!params.images.right || !params.images.left || !params.images.top || !params.images.bottom || !params.images.front || !params.images.back) {
			throw new Error("Missing images. Ensure images are set for right, left, top, bottom, front and back");
		}
		
		this.container = document.createElement( 'div' );
		document.body.appendChild( this.container );		
		
		this.parentId = params.parentId;
		this.container = document.getElementById(this.parentId);
		this.images = params.images;



		// Create the cameras and scene
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );
		this.camera.position.z = 3200;
		this.cameraCube = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );
		this.scene = new THREE.Scene();
		this.sceneCube = new THREE.Scene();
		
		// Make the skycube
		urls = [
			this.images.right,
			this.images.left,
			this.images.top,
			this.images.bottom,
			this.images.front,
			this.images.back
		];
		textureCube = THREE.ImageUtils.loadTextureCube(urls);

		shader = THREE.ShaderLib.cube;
		shader.uniforms.tCube.value = textureCube;

		material = new THREE.ShaderMaterial( {

			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false,
			side: THREE.BackSide

		} );
		/*
		// Lets chuck a flamingo in there
		var loader = new THREE.JSONLoader();
		var _this = this;
		var file = "js/flamingo.js";
		console.log("Loading "+file);
		loader.load( file, function( geometry ) {
			console.log("Loading!!!!?");
			console.log(geometry);
			
			var texture = new THREE.ImageUtils.loadTexture('images/Pillows_Gost2.jpg');
			console.log(texture);
			var material = new THREE.MeshLambertMaterial({
				map: texture,
				colorAmbiant: [0.480000026226044, 0.480000026226044, 0.480000026226044],
				colorDiffuse: [0.480000026226044, 0.480000026226044, 0.480000026226044],
				colorSpecular: [0.8999999761581421, 0.8999999761581421, 0.8999999761581421]
			});
			var mesh = new THREE.Mesh(
				geometry,
				material
			);
			console.log(mesh);
			mesh.position.x = -100;
			mesh.position.y = -20;
			mesh.position.z = 40;
			
			_this.sceneCube.add(mesh);
		});
		*/

		this.mesh = new THREE.Mesh( new THREE.BoxGeometry(100, 100, 100), material );
		this.sceneCube.add(this.mesh);
	
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize(window.innerWidth, window.innerHeight );
		this.renderer.autoClear = false;
		this.container.appendChild(this.renderer.domElement);

		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

		window.addEventListener('resize', this.onWindowResize.bind(this), false);
		this.controls.addEventListener('change', this.render.bind(this));
	};
	
	/**
	* Event fired when window is resized to scale the skycube
	* @TODO: Try this using the div dimensions this.container.clientWidht and this.container.clientHeight
	* @function onWindowResize
	* @memberof Skycube
	*/
	p.onWindowResize = function() {
		var 
			windowHalfX,
			windowHalfY;
			
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.cameraCube.aspect = window.innerWidth / window.innerHeight;
		this.cameraCube.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);
	};
	
	
	/**
	* Add a bitmap image into the skybox on a flat plane facing the player
	* @param image Path to the image to display
	* @param x X coordinate for the image
	* @param y Y coordinate for the image
	* @param z z coordinate for the image
	* @return The plane this image is placed on
	**/
	p.addImage = function(image, x, y, z) {
		var
			texture,
			material,
			plane;

		texture = THREE.ImageUtils.loadTexture( image );
		material = new THREE.MeshLambertMaterial({ map : texture, transparent: true});
		plane = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), material);

		plane.position.x = x;
		plane.position.y = y;
		plane.position.z = z;
		plane.lookAt(this.cameraCube.position);
		this.sceneCube.add(plane);

		return plane;
	};


	/**
	* Draw the skycube
	* @function render
	* @memberof Skycube
	*/
	p.render = function() {
		this.camera.lookAt(this.scene.position);
		this.cameraCube.rotation.copy(this.camera.rotation);

		this.renderer.render(this.sceneCube, this.cameraCube );
		this.renderer.render(this.scene, this.camera );

	};


	/**
	* Animate the skycube by redrawing it in a loop. The animation loop currently cannot be stopped
	* @function animate
	* @memberof Skycube
	*/
	p.animate = function() {
		requestAnimationFrame(this.animate.bind(this));
		this.controls.update();
		this.render();
	};
	
}());



		// Create the cameras and scene
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );
		this.camera.position.z = 3200;
		this.cameraCube = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );
		this.scene = new THREE.Scene();
		this.sceneCube = new THREE.Scene();
		
		// Make the skycube
		urls = [
			this.images.right,
			this.images.left,
			this.images.top,
			this.images.bottom,
			this.images.front,
			this.images.back
		];
		textureCube = THREE.ImageUtils.loadTextureCube(urls);

		shader = THREE.ShaderLib.cube;
		shader.uniforms.tCube.value = textureCube;

		material = new THREE.ShaderMaterial( {

			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false,
			side: THREE.BackSide

		} );
		
		// Lets chuck a flamingo in there
		var loader = new THREE.JSONLoader();
		var _this = this;
		loader.load( "js/spheretest.js", function( geometry ) {
			console.log("Loading!!!!");
			console.log(geometry);
			
			var texture = new THREE.ImageUtils.loadTexture('images/Pillows_Gost2.jpg');
			console.log(texture);
			var material = new THREE.MeshLambertMaterial({
				map: texture,
				colorAmbiant: [0.480000026226044, 0.480000026226044, 0.480000026226044],
				colorDiffuse: [0.480000026226044, 0.480000026226044, 0.480000026226044],
				colorSpecular: [0.8999999761581421, 0.8999999761581421, 0.8999999761581421]
			});
			var mesh = new THREE.Mesh(
				geometry,
				material
			);
			console.log(mesh);
			mesh.position.x = -100;
			mesh.position.y = -20;
			mesh.position.z = 40;
			
			_this.sceneCube.add(mesh);
		});
		

		this.mesh = new THREE.Mesh( new THREE.BoxGeometry(100, 100, 100), material );
		this.sceneCube.add(this.mesh);
	
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize(window.innerWidth, window.innerHeight );
		this.renderer.autoClear = false;
		this.container.appendChild(this.renderer.domElement);

		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

		window.addEventListener('resize', this.onWindowResize.bind(this), false);
		this.controls.addEventListener('change', this.render.bind(this));
	};
	
	/**
	* Event fired when window is resized to scale the skycube
	* @TODO: Try this using the div dimensions this.container.clientWidht and this.container.clientHeight
	* @function onWindowResize
	* @memberof Skycube
	*/
	p.onWindowResize = function() {
		var 
			windowHalfX,
			windowHalfY;
			
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.cameraCube.aspect = window.innerWidth / window.innerHeight;
		this.cameraCube.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);
	};
	
	
	/**
	* Add a bitmap image into the skybox on a flat plane facing the player
	* @param image Path to the image to display
	* @param x X coordinate for the image
	* @param y Y coordinate for the image
	* @param z z coordinate for the image
	* @return The plane this image is placed on
	**/
	p.addImage = function(image, x, y, z) {
		var
			texture,
			material,
			plane;

		texture = THREE.ImageUtils.loadTexture( image );
		material = new THREE.MeshLambertMaterial({ map : texture, transparent: true});
		plane = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), material);

		plane.position.x = x;
		plane.position.y = y;
		plane.position.z = z;
		plane.lookAt(this.cameraCube.position);
		this.sceneCube.add(plane);

		return plane;
	};


	/**
	* Draw the skycube
	* @function render
	* @memberof Skycube
	*/
	p.render = function() {
		this.camera.lookAt(this.scene.position);
		this.cameraCube.rotation.copy(this.camera.rotation);

		this.renderer.render(this.sceneCube, this.cameraCube );
		this.renderer.render(this.scene, this.camera );

	};


	/**
	* Animate the skycube by redrawing it in a loop. The animation loop currently cannot be stopped
	* @function animate
	* @memberof Skycube
	*/
	p.animate = function() {
		requestAnimationFrame(this.animate.bind(this));
		this.controls.update();
		this.render();
	};
	
}());
