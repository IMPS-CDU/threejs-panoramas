/*jslint  white: true, browser: true, plusplus: true, nomen: true */
/*global THREE, requestAnimationFrame, console */

/**
* Maybe handle touch events using tocca http://gianlucaguarini.github.io/Tocca.js/
**/
(function() {
	'use strict';
	
	var SkyCube = function(params) {
		this.init(params);
	};
	window.SkyCube = SkyCube;
	var p = SkyCube.prototype;
	
	var defaultBoxSegments = 14; // The number of segments in each dimension of the skybox geometry (lower values can cause warping)
	var defaultBoxDimensions = 300;	// The dimensions of the box to draw
	
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
	
	p.zoomable = false;
	
	p.maxZoom = 20;
	
	p.minZoom = 80;
	
	p.webgl = false;
	
	/**
	* Should the lookat event be fired for all objects in front of us.
	* i.e. should we look through the first objects to those behind them
	* @name lookThrough
	* @type boolean
	* @memberof SkyCube
	**/
	p.lookThrough = false;
	
	/**
	* Target of current hover event - used to determine if hover has changed when triggering events
	* @name hoverTarget
	* @type THREE.Object
	* @memberof SkyCube
	**/
	p.hoverTargets = null;
	/**
	* Javascript event to dispatch when the mouse is moved over an object
	* @name mouseOnEvt
	* @type Event
	**/
	var mouseOnEvt = new Event('mouseover');
	/**
	* Javascript event to dispatch when the mouse is moved off an object
	* @name mouseOutEvt
	* @type Event
	**/
	var mouseOutEvt = new Event('mouseout');
	/**
	* Target of current look event - used to determine if hover has changed when triggering events
	* @name lookTarget
	* @type THREE.Object
	* @memberof SkyCube
	**/
	p.lookTargets = [];
	/**
	* Javascript event to dispatch when the camera looks directly at an object (the object is centered in the camera's field of view)
	* @name lookAtEvt
	* @type Event
	**/
	var lookAtEvt = new Event('lookat');
	/**
	* Javascript event to dispatch when the camera no longer looks directly at an object (it may still be visible in the camera however)
	* @name lookAtEvt
	* @type Event
	**/
	var lookOffEvt = new Event('lookoff');
	/**
	* Object holding event listeners for skybox so they can be disabled if required
	* @name listeners
	* @type Object
	* @memberof SkyCube
	**/
	p.listeners = {};


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
			throw new Error('parentId is not set');
		}
		if(!params.images) {
			throw new Error('images not set for skybox');
		}
		if(!params.images.right || !params.images.left || !params.images.top || !params.images.bottom || !params.images.front || !params.images.back) {
			throw new Error('Missing images. Ensure images are set for right, left, top, bottom, front and back');
		}
		
		this.container = document.createElement( 'div' );
		document.body.appendChild( this.container );
		
		this.parentId = params.parentId;
		this.container = document.getElementById(this.parentId);
		this.images = params.images;

		this.clock = new THREE.Clock();

		// Create the cameras and scene
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, boxSize );
		//		this.camera.position.z = 3200;	// wtf is this for?
		this.cameraCube = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, boxSize );
		this.scene = new THREE.Scene();
		this.sceneCube = new THREE.Scene();
		
		// Make the skycube
		// Early versions built the cube in reverse. To avoid breaking anything using those versions you must explicitly state it is not reversed. 
		// It is recommended that those applications start setting the flag to true however as the default will change in a future update
		if(params.reverse === false) {
			urls = [
				this.images.left,
				this.images.right,
				this.images.top,
				this.images.bottom,
				this.images.back,
				this.images.front
			];
		} else {
			urls = [
				this.images.right,
				this.images.left,
				this.images.top,
				this.images.bottom,
				this.images.front,
				this.images.back
			];
		}
		
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
		var boxDimensions = params.boxDimensions || defaultBoxDimensions;
		var boxSegments = params.boxSegments || defaultBoxSegments;
		this.mesh = new THREE.Mesh( new THREE.BoxGeometry(boxDimensions, boxDimensions, boxDimensions, boxSegments, boxSegments, boxSegments), material );
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
		this.cssRenderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
		this.cssRenderer.domElement.addEventListener('touchstart', this.onMouseDown.bind(this), false);
		this.clickNothing = params.clickNothing;
		this.controls.addEventListener('change', this.render.bind(this));
		
		if(params.hoverEnabled !== false) {
			this.enableHover();
		}
		
		if(params.lookThough) {
			this.lookThrough = params.lookThrough;
		}
		
		if(params.lookEnabled !== false) {
			this.enableLookAt();
		}
		
		
		if(params.zoomable) {
			this.cssRenderer.domElement.addEventListener('mousewheel', this.onMouseWheel.bind(this), false);
		}
	};

	/**
	* Enable hover events for skybox objects (I don't *think* it will have a significant performance impact)
	**/
	p.enableHover = function() {
		this.listeners.mousemove = this.cssRenderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
		this.listeners.touchmove = this.cssRenderer.domElement.addEventListener('touchmove', this.onMouseMove.bind(this), false);
	};
	
	/**
	* Disable hover events for skybox objects (just in case I'm wrong about the performenace) 
	**/
	p.disableHover = function() {
		if(this.listeners.mousemove) {
			this.cssRenderer.domElement.removeEventListener('mousemove', this.listeners.mousemove, false);
			this.listiners.mousemove = null;
		}
		if(this.listeners.touchmove) {
			this.cssRenderer.domElement.removeEventListener('touchmove', this.listeners.touchmove, false);
			this.listiners.touchmove = null;
		}
	};
	
	/**
	* Enable lookat and lookoff events for skybox objects
	**/
	p.enableLookAt = function() {
		this.listeners.lookAt = this.controls.addEventListener('change', this.onLookAt.bind(this), false);
	};
	
	/**
	* Disable lookat and lookoff events for skybox objects (just in case there is a performance hit)
	**/
	p.disableLookAt = function() {
		if(this.listeners.lookAt) {
			this.controls.removeEventListener('change', this.listeners.lookAt, false);
			this.listeners.lookAt = null;
		}
	};
	
	
	/**
	* Bind event handlers to controllers
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
			throw new Error('Unkown event: ' + eventType);
		}
	};
	
	/**
	* UnBind event handlers to controllers
	* @function off
	* @param eventType String event type currently bound
	* @param callack bound function to remove
	**/
	p.off = function(eventType, callback) {
		switch (eventType) {
		case 'change': 
			this.controls.removeEventListener(eventType, callback);
			break;
		case 'click':
			this.controls.removeEventListener('end', callback);
			break;
		default:
			throw new Error('Unkown event: ' + eventType);
		}
	};
	
	/**
	* Event fired when window is resized to scale the skycube
	* @TODO: Try this using the div dimensions this.container.clientWidht and this.container.clientHeight
	* @function onWindowResize
	* @memberof Skycube
	*/
	p.onWindowResize = function() {

		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.cameraCube.aspect = window.innerWidth / window.innerHeight;
		this.cameraCube.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
	};
	
	
	/**
	* Add a bitmap image into the skybox on a flat plane facing the player
	* @param params.image Path to the image to display
	* @param params.x X coordinate for the image
	* @param params.y Y coordinate for the image
	* @param params.z z coordinate for the image
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
			throw new Error('Unable to add image: Image path is not set');
		}

		texture = THREE.ImageUtils.loadTexture( image );
		material = new THREE.MeshBasicMaterial({ map: texture, transparent: true});
		plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(width, height), material);

		plane.position.x = x;
		plane.position.y = y;
		plane.position.z = z;
		
		if(params.rotation) {
			plane.rotation.x = params.rotation.x || 0;
			plane.rotation.y = params.rotation.y || 0;
			plane.rotation.z = params.rotation.z || 0;
		} else {
			plane.lookAt(this.cameraCube.position);
		}
		
		
		if(params.onClick) {
			plane.addEventListener('click', params.onClick);
		}
		if(params.onHover) {
			plane.addEventListener('mouseover', params.onHover);
		}
		if(params.hoverOff) {
			plane.addEventListener('mouseout', params.hoverOff);
		}
		
		if(params.onLook) {
			plane.addEventListener('lookat', params.onLook);
		}
		if(params.lookOff) {
			plane.addEventListener('lookoff', params.lookOff);
		}
				
		this.sceneCube.add(plane);
		this.objects.push(plane);

		return plane;
	};
	
	/**
	* Add a bitmap image into the skybox as a DOM element using the CSS renderer
	* @param path Path to the image to display
	* @param params.x X coordinate for the image
	* @param params.y Y coordinate for the image
	* @param params.z z coordinate for the image
	* @param params.width Optional width for the image
	* @param params.height Optional height for the image
	* @return The plane this image is placed on (the image DOM element can be accessed through plane.element)
	**/
	p.addImageCSS = function(path, params) {
		var
			x = params.x || 0,
			y = params.y || 0,
			z = params.z || 0,
			img = new Image();

		img.src = path;
		if(params.width) {
			img.style.width = params.width;
		}
		if(params.height) {
			img.style.height = params.height;
		}
		return this.addDomElem({
			element: img,
			position: {
				x: x,
				y: y,
				z: z
			},
			rotation: params.rotation
		});
	};
	
	/**
	* Add a THREEJS object into the skybox with the given texture.
	* Currently doesn't handle textures or animations.
	* @param mesh Path to the object in JSON Object format
	* @param x X coordinate for the image
	* @param y Y coordinate for the image
	* @param z z coordinate for the image
	**/
	p.addObject = function(params) {
		var
			_this = this,
			x = params.x || 0,
			y = params.y || 0,
			z = params.z || 0,
			loader = new THREE.ObjectLoader();
			
			return new Promise(function(resolve, reject) {
				if(!params.model) {
					reject(new Error('No model set'));
				}
				
				loader.load(params.model, function(obj) {
					obj.position.x = x;
					obj.position.y = y;
					obj.position.z = z;
					
					_this.sceneCube.add(obj);
					_this.objects.push(obj);
				
					resolve(obj);
				});
			});
	};
	
	p.addObjMtl = function(params) {
		var
			_this = this,
			x = params.x || 0,
			y = params.y || 0,
			z = params.z || 0,
			loader = new THREE.OBJMTLLoader();
			if(!params.obj) {
				throw new Error('No obj file specified');
			}
			if(!params.mtl) {
				throw new Error('No MTL file specified');
			}
			return new Promise(function(resolve, reject) {
				loader.load(params.obj, params.mtl, function(object) {
					object.position.x = x;
					object.position.y = y;
					object.position.z = z;

					if(params.rotation) {
						object.rotation.x = params.rotation.x || 0;
						object.rotation.y = params.rotation.y || 0;
						object.rotation.z = params.rotation.z || 0;
					} else {
						object.lookAt(_this.cameraCube.position);
					}
					
					_this.sceneCube.add(object);
					_this.objects.push(object);
					
					resolve(object);
				}, function() {}, function(xhr) {
					reject(xhr);
				});
			});
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
			throw new Error('No model set');
		}
		if(!params.texture) {
			throw new Error('No texture set');
		}
		x = params.x || 0;
		y = params.y || 0;
		z = params.z || 0;
		
		loader = new THREE.JSONLoader();
		
		return new Promise(function(resolve, reject) {
			loader.load(params.model, function( geometry ) {
				var
					texture,
					material,
					mesh,
					animation;
		
				texture = THREE.ImageUtils.loadTexture(params.texture);
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
				if(params.onLook) {
					mesh.onLook = params.onLook;
				}
				// Force aniamation if animate is set to true (useful for debugging)
				if(params.animate === true || (params.animate === undefined && mesh.geometry.animations)) {
					if(!mesh.geometry.animations) {
						reject(new Error('No animations set for model ' + params.model));
					}
				
					animation = new THREE.Animation(mesh, mesh.geometry.animations[0]);
					animation.play();
				}
		
				_this.sceneCube.add(mesh);
				_this.objects.push(mesh);
				
				resolve(mesh);
			});
		});
	};
	
	p.addCollada = function(params) {
		var 
			loader,
			_this;
			
		if(!params.model) {
			throw new Error('No object set');
		}
		
		loader = new THREE.ColladaLoader();
		_this = this;
		
		
		loader.options.convertUpAxis = true;	// Not sure what this does
		return new Promise(function(resolve) {
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

				if(params.rotation) {
					dae.rotation.x = params.rotation.x || 0;
					dae.rotation.y = params.rotation.y || 0;
					dae.rotation.z = params.rotation.z || 0;
				} else {
					dae.lookAt(_this.cameraCube.position);
				}
			
				dae.updateMatrix();
			
				_this.sceneCube.add(dae);
				resolve(dae);
			});
		});
	};
	
	function convertHtmlDimensionToPx(dimensionString) {
		var clean = null;
		var numRegex = /[0-9]+/;
		var percentRegex = /([0-9]+)%/;
		var pxRegex = /([0-9]+)px/;

		var matches;
		if(dimensionString === parseInt(dimensionString) || dimensionString.search(numRegex)) {
			clean = parseInt(dimensionString);
		} else if((matches = percentRegex.exec(dimensionString)) !== null) {
			// If percent is set get the width as a percent of the window
			clean = window.innerWidth * (parseInt(matches[1], 10) / 100);
		} else if((matches = pxRegex.exec(dimensionString)) !== null) {
			clean = parseInt(matches[1], 10);
		} else {
			throw new Error('Unknown HTML dimension string: ' + dimensionString);
		}
		return clean;
	}

	p.addDomElem = function(params) {
		var 
			position,
			rotation,
			cssObject,
			element = params.element,
			defaultDimensions = 360,	// This value is effectively arbitrary. It sets the plane dimensions if none are specified and we can't calculate them
			planeMaterial,
			planeWidth,
			planeHeight,
			planeGeometry,
			planeMesh;
		
		
		if(!element) {
			throw new Error('No element set');
		}
		
		// Get or calculate the plane dimensions
		planeWidth = params.width || element.offsetWidth || element.width || element.style.width || defaultDimensions;
		planeWidth = convertHtmlDimensionToPx(planeWidth);
		planeHeight = params.height || element.offsetHeight || element.width || element.style.height || defaultDimensions;
		planeHeight = convertHtmlDimensionToPx(planeHeight);
		
		
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
		
		
		cssObject = new THREE.CSS3DObject(element);
		cssObject.position.x = position.x;
		cssObject.position.y = position.y;
		cssObject.position.z = position.z;
		if(params.rotation) {
			cssObject.rotation.set(rotation.x, rotation.y, rotation.z);
		} else {
			cssObject.lookAt(this.cameraCube.position);
		}

		this.sceneCube.add(cssObject);
		planeMaterial = new THREE.MeshBasicMaterial({color: 0x000000, opacity: 0.1, side: THREE.DoubleSide });
		planeGeometry = new THREE.PlaneGeometry( planeWidth, planeHeight );
		planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
		planeMesh.position.y += planeHeight / 2;
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
//		this.renderer.render(this.scene, this.camera );

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
	* Get array of objects under the mouse cursor
	* @return Array of ThreeJS objects under mouse
	*/
	p.getObjectsUnderMouse = function(event) {
		var 
			xCoord = event.clientX || event.changedTouches[0].clientX,
			yCoord = event.clientY || event.changedTouches[0].clientY,
			mouse,
			vector,
			ray,
			intersects;

		mouse = new THREE.Vector3((xCoord / window.innerWidth ) * 2 - 1, -( yCoord / window.innerHeight ) * 2 + 1, 1);

		vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		vector.unproject(this.cameraCube);
		ray = new THREE.Raycaster(this.cameraCube.position, vector.sub(this.cameraCube.position).normalize());

		intersects = ray.intersectObjects(this.objects);
		return intersects;
	};
	
	/**
	* As click on the canvas doesn't guarantee the same start/stop point get the objects we intersect on mouse down and bind a mouseup event to check if they match.
	* If the mousedown and mouseup are on the same object dispatch click on that object
	* @param event DOM event for mouse click
	**/
	p.onMouseDown = function(downEvent) {
		var intersectsDown = this.getObjectsUnderMouse(downEvent);
		if(intersectsDown.length > 0) {
			var mouseUpFunc = (function(upEvent) {
				var intersectsUp = this.getObjectsUnderMouse(upEvent);
				if(intersectsUp.length > 0 && intersectsUp[0].object === intersectsDown[0].object) {
					intersectsUp[0].object.dispatchEvent({type: 'click'});
				} else if(this.clickNothing){
					this.clickNothing(event);
				}
				document.body.removeEventListener('mouseup', mouseUpFunc, false);
				document.body.removeEventListener('touchend', mouseUpFunc, false);
			}).bind(this);
			document.body.addEventListener('mouseup', mouseUpFunc, false);
			document.body.addEventListener('touchend', mouseUpFunc, false);
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
		
		mouse = new THREE.Vector3((event.clientX / window.innerWidth ) * 2 - 1, -( event.clientY / window.innerHeight ) * 2 + 1, 1);

		vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		vector.unproject(this.cameraCube);
		ray = new THREE.Raycaster(this.cameraCube.position, vector.sub(this.cameraCube.position).normalize());

		intersects = ray.intersectObjects(this.objects);
		if(intersects.length > 0){
			if(intersects[0].object !== this.hoverTarget) {
				if(this.hoverTarget) {
					this.hoverTarget.dispatchEvent(mouseOutEvt);
				}
				this.hoverTarget = intersects[0].object;
				mouseOnEvt.clientX = event.clientX;
				mouseOnEvt.clientY = event.clientY;
				this.hoverTarget.dispatchEvent(mouseOnEvt);
			}
			
		} else {
			if(this.hoverTarget) {
				this.hoverTarget.dispatchEvent(mouseOutEvt);
				this.hoverTarget = null;
			}
		}
	};
	
	/**
	* Event called on camera move to detect if the camera is looking directly at an object. 
	* Draws a vector from the camera and checks if it intersects with any objects. If it does it calls the onLook function on the first object. If no objects are found it calls the lookNowhere event if set
	* Please note that this does not currently locate CSS objects.
	* @param event DOM event for mouse move
	**/
	p.onLookAt = function() {
		var vector = new THREE.Vector3(0, 0, -1);
		vector.applyQuaternion(this.cameraCube.quaternion);
		var ray = new THREE.Raycaster(this.cameraCube.position, vector);
		var intersects = ray.intersectObjects(this.objects);

		if(this.lookThrough) {
			// look through and trigger each and every object we are looking at even if it is hidden behind another
			var newMatches = [];
			intersects.forEach(function(object) {
				var oldIndex = this.lookTargets.indexOf(object);
				if(oldIndex === -1) {
					// New so fire event
					object.dispatchEvent(lookAtEvt);
				} else {
					// Old so remove from old list to check what's left
					this.lookTargets.splice(oldIndex, 1);
				}
				newMatches.push(object);
			});
			// Anything left in lookTargets is no longer being looked at so cool lookOff
			this.lookTargets.forEach(function(object) {
				object.dispatchEvent(lookOffEvt);
			});
			// Replace with the new list
			this.lookTargets = newMatches;
		} else {
			// Just look at the first object
			if(intersects.length > 0) {
				if(intersects[0].object !== this.lookTargets[0]) {
					if(this.lookTargets.length > 0) {
						this.lookTargets[0].dispatchEvent(lookOffEvt);
					}
					this.lookTargets[0] = intersects[0].object;
					this.lookTargets[0].dispatchEvent(lookAtEvt);
				}
			} else {
				if(this.lookTargets.length > 0) {
					this.lookTargets[0].dispatchEvent(lookOffEvt);
					this.lookTargets.pop();
				}
			}
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
