/*jslint  white: true, browser: true, plusplus: true, nomen: true */
/*global THREE, requestAnimationFrame, console */

/**
* Maybe handle touch events using tocca http://gianlucaguarini.github.io/Tocca.js/
**/
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

	/**
	* Array of objects to be raytraced when evaluating if the user has clicked on an object
	* @name objects
	* @type Array
	* @memberof SkyCube
	**/
	p.objects = [];
	
	p.animations = [];
	
	p.clock = null;

	/**
	* Scene for CSS elements
	* @name cssScene
	* @type THREE.Scene
	* @memberof SkyCube
	**/
	p.cssScene = null;
	
	/**
	 * CSS 3D Renderer
	 * @name cssRenderer
	 * @type THREE.CSS3DRendeter
	 * @memberof SkyCube
	 **/
	p.cssRenderer = null;
	
	p.hoverEnabled = false;
	
	p.zoomable = false;
	
	p.maxZoom = 20;
	
	p.minZoom = 80;
	
	p.webgl = false;


	function webglAvailable() {
		try {
			var canvas = document.createElement( 'canvas' );
			return !!( window.WebGLRenderingContext && (
				canvas.getContext( 'webgl' ) ||
				canvas.getContext( 'experimental-webgl' ) )
			);
		} catch ( e ) {
			return false;
		}
	}

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
			urls,
			textureCube,
			material,
			shader,
			boxSize = 100000;
		
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

		this.clock = new THREE.Clock();

		// Create the cameras and scene
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, boxSize );
		this.camera.position.z = 3200;
		this.cameraCube = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, boxSize );
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
		
		/* This block replaces the following and will work with canvanRenderer (although IE still fails) BUT it inverts the images
		var materialArray = [];
		for(var i = 0; i < urls.length; i++) {
			materialArray.push(new THREE.MeshBasicMaterial({
				map: THREE.ImageUtils.loadTexture(urls[i]),
				side: THREE.BackSide,
				overdraw: 0.5
			}));
		}
		material = new THREE.MeshFaceMaterial(materialArray);
		*/
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
		
		// Note that the mesh needs width/height/depth segmets set to a value like 7 for canvas renderer to avoid warping
		this.mesh = new THREE.Mesh( new THREE.BoxGeometry(300, 300, 300, 7, 7, 7), material );
		this.sceneCube.add(this.mesh);

		this.webgl = webglAvailable();
		if ( this.webgl ) {
			this.renderer = new THREE.WebGLRenderer();
		} else {
			this.renderer = new THREE.CanvasRenderer();
		}
		// This makes it a bit more version safe
		if(this.renderer.setPixelRatio) {
			this.renderer.setPixelRatio( window.devicePixelRatio );
		}
		this.renderer.setSize(window.innerWidth, window.innerHeight );
		this.renderer.autoClear = false;
		this.container.appendChild(this.renderer.domElement);

		// Put the CSS renderer on top so we can render CSS elements over the WebGL canvas
		this.cssRenderer = new THREE.CSS3DRenderer();
		this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
		this.cssRenderer.domElement.style.position = 'absolute';
		this.cssRenderer.domElement.style.top = 0;
		this.container.appendChild(this.cssRenderer.domElement);
		this.cssScene = new THREE.Scene();

		this.controls = new THREE.OrbitControls(this.camera, this.cssRenderer.domElement);

		window.addEventListener('resize', this.onWindowResize.bind(this), false);
		this.cssRenderer.domElement.addEventListener('click', this.onClick.bind(this), false);
		this.cssRenderer.domElement.addEventListener('touchstart', this.onClick.bind(this), false);
		this.clickNothing = params.clickNothing;
		this.controls.addEventListener('change', this.render.bind(this));
		
		if(params.hoverEnabled) {
			this.cssRenderer.domElement.addEventListener("mousemove", this.onMouseMove.bind(this), false);
			this.cssRenderer.domElement.addEventListener("touchmove", this.onMouseMove.bind(this), false);
			this.hoverNowhere = params.hoverNowhere;
		}
		
		if(params.zoomable) {
			this.cssRenderer.domElement.addEventListener('mousewheel', this.onMouseWheel.bind(this), false);
		}
	};

	
	/**
	* Bind event handlers
	* @function on
	* @param eventType String event type to handle
	* @param callack function to call when event is triggered
	**/
	p.on = function(eventType, callback) {
		switch (eventType) {
		case 'change': 
			this.controls.addEventListener(eventType, callback);
			break;
		case 'click':
			this.controls.addEventListener('end', callback);
			break;
		default:
			console.error("Unkown event: "+eventType);
		}
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
		this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
	};
	
	
	/**
	* Add a bitmap image into the skybox on a flat plane facing the player
	* @param image Path to the image to display
	* @param x X coordinate for the image
	* @param y Y coordinate for the image
	* @param z z coordinate for the image
	* @return The plane this image is placed on
	**/
	p.addImage = function(params) {
		var
			image = params.image,
			x = params.x || 0,
			y = params.y || 0,
			z = params.z || 0,
			width = params.width || 10,
			height = params.height || 10,
			texture,
			material,
			plane;
			
		if(!image) {
			throw new Error("Unable to add image: Image path is not set");
		}

		texture = THREE.ImageUtils.loadTexture( image );
		material = new THREE.MeshBasicMaterial({ map : texture, transparent: true});
		plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(width, height), material);

		plane.position.x = x;
		plane.position.y = y;
		plane.position.z = z;
		plane.lookAt(this.cameraCube.position);
		
		
		if(params.onClick) {
			plane.onClick = params.onClick;
		}
		if(params.onHover) {
			plane.onHover = params.onHover;
		}
				
		this.sceneCube.add(plane);
		this.objects.push(plane);

		return plane;
	};
	
	/**
	* Add a 3d object into the skybox with the given texture
	* @param mesh Path to the object in JSON Geometry format
	* @param textureImage Path to the texture image (note that dimensions must be base 2)
	* @param x X coordinate for the image
	* @param y Y coordinate for the image
	* @param z z coordinate for the image
	**/
	p.addMesh = function(params) {
		var 
			_this,
			x,
			y,
			z,
			loader;
			
		_this = this;
		// Handle params
		if(!params.model) {
			throw new Error("No model set");
		}
		if(!params.texture) {
			throw new Error("No texture set");
		}
		x = params.x || 0;
		y = params.y || 0;
		z = params.z || 0;
		
		if(params.obj) {
			loader = new THREE.ObjectLoader();
		} else {
			loader = new THREE.JSONLoader();
		}
		loader.load(params.model, function( geometry ) {
			var
				texture,
				material,
				mesh,
				animation;
		
			texture = new THREE.ImageUtils.loadTexture(params.texture);
			material = new THREE.MeshBasicMaterial({
				map: texture
			});
			mesh = new THREE.Mesh(geometry, material);
			mesh.position.x = x;
			mesh.position.y = y;
			mesh.position.z = z;
			
			if(params.onClick) {
				mesh.onClick = params.onClick;
			}

			// Force aniamation if animate is set to true (useful for debugging)
			if(params.animate === true || (params.animate === undefined && mesh.geometry.animations)) {
				if(!mesh.geometry.animations) {
					throw new Error("No animations set for model "+params.model);
				}
				
				animation = new THREE.Animation(mesh, mesh.geometry.animations[0]);
				animation.play();
			}
		
			_this.sceneCube.add(mesh);
			_this.objects.push(mesh);
		});
	};
	
	p.addCollada = function(params) {
		var 
			loader,
			_this;
			
		if(!params.model) {
			throw new Error("No object set");
		}
		
		loader = new THREE.ColladaLoader();
		_this = this;
		
		
		loader.options.convertUpAxis = true;	// Not sure what this does
		loader.load(params.model, function(collada) {
			var dae = collada.scene;
			dae.traverse(function(child) {
				if(child instanceof THREE.SkinnedMesh) {
					var animation = new THREE.Animation(child, child.geometry.animation);
					animation.play();
				}
			});
			if(params.x) {
				dae.position.x = params.x;
			}
			if(params.y) {
				dae.position.y = params.y;
			}
			if(params.z) {
				dae.position.z = params.z;
			}
			
			dae.updateMatrix();
			
			_this.sceneCube.add(dae);
		});
	};

	p.addDomElem = function(params) {
		var 
			position,
			rotation,
			cssObject,
			planeMaterial,
			planeWidth,
			planeHeight,
			planeGeometry,
			planeMesh;
		
		
		if(!params.element) {
			throw new Error("No element set");
		}
		
		position = params.position || {};
		if(!position.x) {
			position.x = 0;
		}
		if(!position.y) {
			position.y = 0;
		}
		if(!position.z) {
			position.z = 0;
		}
		rotation = params.rotation || {};
		if(!rotation.x) {
			rotation.x = 0;
		}
		if(!rotation.y) {
			rotation.y = 0;
		}
		if(!rotation.z) {
			rotation.z = 0;
		}
		
		
		cssObject = new THREE.CSS3DObject(params.element);
		cssObject.position.x = position.x;
		cssObject.position.y = position.y;
		cssObject.position.z = position.z;
		if(params.rotation) {
			cssObject.rotation.set(rotation.x, rotation.y, rotation.z);
		} else {
			cssObject.lookAt(this.cameraCube.position);
		}

		this.sceneCube.add(cssObject);
		planeMaterial   = new THREE.MeshBasicMaterial({color: 0x000000, opacity: 0.1, side: THREE.DoubleSide });
		planeWidth = 360;
		planeHeight = 120;
		planeGeometry = new THREE.PlaneGeometry( planeWidth, planeHeight );
		planeMesh= new THREE.Mesh( planeGeometry, planeMaterial );
		planeMesh.position.y += planeHeight/2;
		// add it to the standard (WebGL) scene
		this.sceneCube.add(cssObject);
		this.cssScene.add(cssObject);
		
		return cssObject;
	};

	/**
	* Draw the skycube
	* @function render
	* @memberof Skycube
	*/
	p.render = function() {
		var 
			delta,
			animationIndex;

//		this.camera.lookAt(this.scene.position);
		this.cameraCube.rotation.copy(this.camera.rotation);
		this.cameraCube.fov = this.camera.fov;
		this.cameraCube.updateProjectionMatrix();

		delta = this.clock.getDelta();
		for(animationIndex = 0; animationIndex < this.animations; animationIndex++) {
			this.animations[animationIndex].update(delta);
		}

		THREE.AnimationHandler.update(delta);

		this.renderer.render(this.sceneCube, this.cameraCube );
		this.renderer.render(this.scene, this.camera );

		this.cssRenderer.render(this.cssScene, this.cameraCube);
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
	
	/**
	* On click event used to call click events for objects.
	* Checks the the cursor intersects with any objects and if so calls onClick on them. If no objects are found clickNothing is called if set.
	* @param event DOM event for mouse click
	**/
	p.onClick = function(event){
		var 
			mouse,
			vector,
			ray,
			intersects;
			
		mouse = new THREE.Vector3((event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 1);
	
		vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		vector.unproject(this.cameraCube);
		ray = new THREE.Raycaster(this.cameraCube.position, vector.sub(this.cameraCube.position).normalize());

		intersects = ray.intersectObjects(this.objects);
		if(intersects.length > 0){
			if(intersects[0].object.onClick) {
				event.object = intersects[0].object;
				intersects[0].object.onClick.call(this, event);
			}
		} else if(this.clickNothing) {
			this.clickNothing(event);
		}
	};
	
	/**
	* Mouse move event used if hover effects are used. This event is only bound if hoverEnabled is true as it could potentially be expensive
	* Checks if the mouse intersects with an object and if so calls the hover event on it. If not objects are found it calls the hoverNowhere event if set.
	* @param event DOM event for mouse move
	**/
	p.onMouseMove = function(event) {
		var 
			mouse,
			vector,
			ray,
			intersects;
		
		mouse = new THREE.Vector3((event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 1);

		vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		vector.unproject(this.cameraCube);
		ray = new THREE.Raycaster(this.cameraCube.position, vector.sub(this.cameraCube.position).normalize());

		intersects = ray.intersectObjects(this.objects);
		if(intersects.length > 0){
			if(intersects[0].object.onHover) {
				event.object = intersects[0].object;
				intersects[0].object.onHover.call(this, event);
			}
		} else if(this.hoverNowhere) {
			this.hoverNowhere(event);
		}
	};
	
	/**
	* Zoom on scrollwheel - This should be handled by OrbitControls but the current version doesn't appear to work. 
	* @param event The DOM Event for scrollwheel
	**/
	p.onMouseWheel = function(event) {
		var delta = event.wheelDelta || event.detail || 0;
		if(delta > 0) {
			this.camera.fov -= 5;
			if(this.camera.fov < this.maxZoom) {
				this.camera.fov = this.maxZoom;
			}
		} else {
			this.camera.fov += 5;
			if(this.camera.fov > this.minZoom) {
				this.camera.fov = this.minZoom;
			}
		}
	};
	
	
	/**
	* Zoom camera to specified FOV using an ease-in tween
	* @param zoomLevel the new desired camera field of view
	**/
	p.zoom = function(zoomLevel, time) {
		time = time || 1000;
		var framerate = 10;
		var steps = time / framerate;
		var distance = zoomLevel - this.camera.fov;
		var avgStep = distance / steps;
		var stepWeight = 2;
		var _this = this;
		
		var interval = setInterval(function() {
			// console.log("Step weight: "+stepWeight+", FOV: "+_this.camera.fov+", AvgStep: "+avgStep+", ThisStep: "+(avgStep * stepWeight));
			_this.camera.fov += avgStep * stepWeight;
			stepWeight -= 1.5 / steps;
			if(_this.camera.fov <= zoomLevel) {
				_this.camera.fov = zoomLevel;
				clearInterval(interval);
			}
		}, framerate);
	};
	
	p.lookAt = function(obj) {
		var target = obj.position || obj;
		this.controls.target = target;
	};
	
}());
