/*eslint max-statements: 0, no-magic-numbers: 0, no-param-reassign: 0 */
/*global THREE, requestAnimationFrame, console */

/**
* Maybe handle touch events using tocca http://gianlucaguarini.github.io/Tocca.js/
**/
(function() { //eslint-disable-line max-statements
	'use strict';

	/**
	* Create a new skybox object
	* @param {Object} params Configuraton settings for this skycube (see init function for options)
	* @returns {SkyCube} SkyCube instance
	**/
	function SkyCube(params) {
		this.init(params);
	}
	window.SkyCube = SkyCube;

	var defaultBoxSegments = 14; // The number of segments in each dimension of the skybox geometry (lower values can cause warping)
	var defaultBoxDimensions = 300;	// The dimensions of the box to draw

	// Public Properties

	/**
	 * Array of images to show on skycube
	 * @name images
	 * @type Object
	 * @memberof SkyCube
	 **/
	SkyCube.prototype.images = null;

	/**
	 * ID for div to contain skycube
	 * @name parentId
	 * @type String
	 * @memberof SkyCube
	 **/
	SkyCube.prototype.parentId = null;

	/**
	 * Dom element for parent div to hold skycube
	 * @name container
	 * @type DomElement
	 * @memberof SkyCube
	 **/
	SkyCube.prototype.container = null;

	/**
	 * Camera used to render user view (I think)
	 * @name camera
	 * @type THREE.PerspectiveCamera
	 * @memberof SkyCube
	 **/
	SkyCube.prototype.camera = null;

	/**
	 * Camera used to render cube (I think)
	 * @name camera
	 * @type THREE.PerspectiveCamera
	 * @memberof SkyCube
	 **/
	SkyCube.prototype.cameraCube = null;

	/**
	 * Scene used to render user view
	 * @name camera
	 * @type THREE.Scene
	 * @memberof SkyCube
	 **/
	SkyCube.prototype.sceneCube = null;

	/**
	 * Skybox mesh to render the cube
	 * @name mesh
	 * @type THREE.Mesh
	 * @memberof SkyCube
	 **/
	SkyCube.prototype.mesh = null;

	/**
	 * WebGL Renderer
	 * @name renderer
	 * @type THREE.WebGLRenderer
	 * @memberof SkyCube
	 **/
	SkyCube.prototype.renderer = null;

	/**
	* Array of objects to be raytraced when evaluating if the user has clicked on an object
	* @name objects
	* @type Array
	* @memberof SkyCube
	**/
	SkyCube.prototype.objects = [];

	SkyCube.prototype.animations = [];

	SkyCube.prototype.clock = null;

	/**
	* Scene for CSS elements
	* @name cssScene
	* @type THREE.Scene
	* @memberof SkyCube
	**/
	SkyCube.prototype.cssScene = null;

	/**
	 * CSS 3D Renderer
	 * @name cssRenderer
	 * @type THREE.CSS3DRendeter
	 * @memberof SkyCube
	 **/
	SkyCube.prototype.cssRenderer = null;

	SkyCube.prototype.zoomable = false;

	SkyCube.prototype.maxZoom = 20;

	SkyCube.prototype.minZoom = 80;

	SkyCube.prototype.webgl = false;

	/**
	* Should the lookat event be fired for all objects in front of us.
	* i.e. should we look through the first objects to those behind them
	* @name lookThrough
	* @type boolean
	* @memberof SkyCube
	**/
	SkyCube.prototype.lookThrough = false;

	/**
	* Target of current hover event - used to determine if hover has changed when triggering events
	* @name hoverTarget
	* @type THREE.Object
	* @memberof SkyCube
	**/
	SkyCube.prototype.hoverTargets = null;

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
	SkyCube.prototype.lookTargets = [];

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
	SkyCube.prototype.listeners = {};

	/**
	* Base speed to move camera when rotating/panning
	* @name baseSpeed
	* @type number
	* @memberof SkyCube
	**/
	SkyCube.prototype.baseSpeed = 20;

	/**
	* Base radius of circle when rotating
	* @name baseRadius
	* @type number
	* @memberof SkyCube
	**/
	SkyCube.prototype.baseRadius = 200;

	/**
	* Flag indicating if the camera if currently panning/rotating
	* @name panning
	* @type Boolean
	* @memberof SkyCube
	**/
	SkyCube.prototype.panning = false;

	/**
	* Centre of the circle to rotate around
	* @name rotateCentre
	* @type THREE.Vector3
	* @memberof SkyCube
	**/
	SkyCube.prototype.rotateCentre = null;

	/**
	 * Event listeners bound to this skycube
	 * @name eventListeners
	 * @type Object
	 * @memberof SkyCube
	 **/
	SkyCube.prototype.eventListeners = {};


	/**
	 * Check if webgl is avilable in the browser
	 * @returns {Boolean} true if webgl is available otherwise false
	 **/
	function webglAvailable() {
		try {
			var canvas = document.createElement( 'canvas' );
			return Boolean( window.WebGLRenderingContext && (
				canvas.getContext( 'webgl' )
				|| canvas.getContext( 'experimental-webgl' ) )
			);
		} catch ( e ) {
			return false;
		}
	}

	/**
	* Initalise a new skycube
	* Requires the following paramsters:
	* Note that IOS Safari refuses to load skycube images over 1024x1024
	* @function init
	* @param {Object} params An object containing images and parentId for the skycube.
	* @param {string} params.parentId The id for DOM element to contain the skycube
	* @param {Object} params.images Image paths for panorama.
	* @param {string} params.images.right path for image to display on right of skybox
	* @param {string} params.images.left path for image to display on left of skybox
	* @param {string} params.images.top path for image to display on top of skybox
	* @param {string} params.images.bottom path for image to display on the bottom of the skybox
	* @param {string} params.images.front path for image to display on the front of the skybox
	* @param {string} params.images.back path for image to display on the back of the skybox
	* @param {Boolean} params.reverse Should the skybox be reversed (used of floor and roof have been generated backwards)
	* @param {Function} params.loaded Callback when the cube has been loaded
	* @param {Function} params.error Callback if an error occurrs loading the cube
	*
	* @throws Error if parentId or images are not set
	* @returns {null} no return value
	*/
	SkyCube.prototype.init = function(params) {
		var boxSize = 100000;
		var fov = 60;

		if(!params.parentId) {
			throw new Error('parentId is not set');
		}
		if(!params.images) {
			throw new Error('images not set for skybox');
		}
		if(!params.images.right || !params.images.left || !params.images.top || !params.images.bottom || !params.images.front || !params.images.back) {
			throw new Error('Missing images. Ensure images are set for right, left, top, bottom, front and back');
		}

		this.parentId = params.parentId;
		this.container = document.getElementById(this.parentId);
		this.images = params.images;

		this.clock = new THREE.Clock();

		// Create the cameras and scene
		this.camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 1, boxSize );
		this.cameraCube = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 1, boxSize );
		this.sceneCube = new THREE.Scene();


		this.webgl = webglAvailable();
		if ( this.webgl ) {
			this.renderer = new THREE.WebGLRenderer();
		} else {
			this.renderer = new THREE.CanvasRenderer();
		}

		var containerBounds = this.container.getBoundingClientRect();
		var width = window.innerWidth - containerBounds.left;
		var height = window.innerHeight - containerBounds.top;

		// This makes it a bit more version safe
		if(this.renderer.setPixelRatio) {
			this.renderer.setPixelRatio( window.devicePixelRatio );
		}
		this.renderer.setSize(width, height);
		this.renderer.autoClear = false;
		this.container.appendChild(this.renderer.domElement);

		// Put the CSS renderer on top so we can render CSS elements over the WebGL canvas
		this.cssRenderer = new THREE.CSS3DRenderer();
		this.cssRenderer.setSize(width, height);
		this.cssRenderer.domElement.style.position = 'absolute';
		this.cssRenderer.domElement.style.top = containerBounds.top + 'px';
		this.cssRenderer.domElement.style.left = containerBounds.left + 'px';
		this.container.appendChild(this.cssRenderer.domElement);
		this.cssScene = new THREE.Scene();

		this.cssRenderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this), false);
		this.cssRenderer.domElement.addEventListener('touchstart', this.onMouseDown.bind(this), false);

		this.controls = new THREE.OrbitControls(this.camera, this.cssRenderer.domElement);
		this.controls.addEventListener('change', this.render.bind(this));

		window.addEventListener('resize', this.onWindowResize.bind(this), false);

		this.load(params);
	};

	SkyCube.prototype.load = function(params) {
		var urls = null;
		var textureCube = null;
		var material = null;
		var shader = null;

		// Make the skycube
		// Early versions built the cube in reverse. To avoid breaking anything using those versions you must explicitly state it is not reversed.
		// It is recommended that those applications start setting the flag to true however as the default will change in a future update
		if(params.reverse !== false) {
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
		textureCube = THREE.ImageUtils.loadTextureCube(urls, null, params.loaded, params.error);

		shader = THREE.ShaderLib.cube;
		shader.uniforms.tCube.value = textureCube;

		material = new THREE.ShaderMaterial({
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false,
			side: THREE.BackSide
		});

		// Note that the mesh needs width/height/depth segmets set to a value like 7 for canvas renderer to avoid warping
		var boxDimensions = params.boxDimensions || defaultBoxDimensions;
		var boxSegments = params.boxSegments || defaultBoxSegments;
		var mesh = new THREE.Mesh( new THREE.BoxGeometry(boxDimensions, boxDimensions, boxDimensions, boxSegments, boxSegments, boxSegments), material );

		if(this.mesh) {
			this.sceneCube.remove(this.mesh);
		}
		this.mesh = mesh;
		this.sceneCube.add(this.mesh);
		this.clickNothing = params.clickNothing;

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
		this.lookAt(this.getPointInFront(200)); // Controls don't work if we don't first set them
	};

	/**
	* Enable hover events for skybox objects (I don't *think* it will have a significant performance impact)
	* @function enableHover
	* @returns {SkyCube} the current instance
	**/
	SkyCube.prototype.enableHover = function() {
		this.listeners.mousemove = this.cssRenderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
		this.listeners.touchmove = this.cssRenderer.domElement.addEventListener('touchmove', this.onMouseMove.bind(this), false);
		return this;
	};

	/**
	* Disable hover events for skybox objects (just in case I'm wrong about the performenace)
	* @function disableHover
	* @returns {SkyCube} the current instance
	**/
	SkyCube.prototype.disableHover = function() {
		if(this.listeners.mousemove) {
			this.cssRenderer.domElement.removeEventListener('mousemove', this.listeners.mousemove, false);
			this.listiners.mousemove = null;
		}
		if(this.listeners.touchmove) {
			this.cssRenderer.domElement.removeEventListener('touchmove', this.listeners.touchmove, false);
			this.listiners.touchmove = null;
		}
		return this;
	};

	/**
	* Enable lookat and lookoff events for skybox objects
	* @function enableLookAt
	* @returns {SkyCube} the current instance
	**/
	SkyCube.prototype.enableLookAt = function() {
		this.listeners.lookAt = this.controls.addEventListener('change', this.onLookAt.bind(this), false);
		return this;
	};

	/**
	* Disable lookat and lookoff events for skybox objects (just in case there is a performance hit)
	* @function disableLookAt
	* @returns {SkyCube} the current instance
	**/
	SkyCube.prototype.disableLookAt = function() {
		if(this.listeners.lookAt) {
			this.controls.removeEventListener('change', this.listeners.lookAt, false);
			this.listeners.lookAt = null;
		}
		return this;
	};


	/**
	* Bind event handlers to controllers
	* @function on
	* @deprecated use addEventListener instead
	* @param {string} eventType String event type to handle
	* @param {Function} callback function to call when event is triggered
	* @returns {SkyCube} the current instance
	**/
	SkyCube.prototype.on = function(eventType, callback) {
		return this.addEventListener(eventType, callback);
	};

	/**
	* Bind event handlers to controllers
	* @function addEventListener
	* @param {string} eventType String event type to handle
	* @param {Function} callback function to call when event is triggered
	* @returns {SkyCube} the current instance
	**/
	SkyCube.prototype.addEventListener = function(eventType, callback) {
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
		if(!this.eventListeners[eventType]) {
			this.eventListeners[eventType] = [];
		}
		this.eventListeners[eventType].push(callback);
		return this;
	};

	/**
	* remove a previously bound event handler from the controller
	* @function removeEventListener
	* @param {string} eventType String event type to remove
	* @param {Function} callback currently bound callback to remove
	* @returns {SkyCube} the current instance
	**/
	SkyCube.prototype.removeEventListener = function(eventType, callback) {
		this.controls.removeEventListener(eventType, callback);
		return this;
	};

	/**
	 * Get currently bound event listeners for this event
	 * @fucntion getEventListeners
	 * @param {string} eventType the event to fetch event listeners for
	 * @returns {array} An array of all currently bound event listeners
	 **/
	SkyCube.prototype.getEventListeners = function(eventType) {
		return this.eventListeners[eventType] || [];
	};

	/**
	* UnBind event handlers to controllers
	* @function off
	* @param {string} eventType String event type currently bound
	* @param {Function} callback bound function to remove
	* @returns {SkyCube} the current instance
	**/
	SkyCube.prototype.off = function(eventType, callback) {
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
		return this;
	};

	/**
	* Event fired when window is resized to scale the skycube
	* @function onWindowResize
	* @TODO: Try this using the div dimensions this.container.clientWidht and this.container.clientHeight
	* @function onWindowResize
	* @returns {SkyCube} the current instance
	*/
	SkyCube.prototype.onWindowResize = function() {

		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.cameraCube.aspect = window.innerWidth / window.innerHeight;
		this.cameraCube.updateProjectionMatrix();

		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.cssRenderer.setSize(window.innerWidth, window.innerHeight);
		return this;
	};


	/**
	* Add a bitmap image into the skybox on a flat plane facing the player
	* @function addImage
	* @param {Object} params Configuration object for image
	* @param {string} params.image Path to the image to display
	* @param {number} params.x X coordinate for the image
	* @param {number} params.y Y coordinate for the image
	* @param {number} params.z z coordinate for the image
	* @param {number} params.width The width of the plane to place image on
	* @param {number} params.height The height of the plane to place image on
	* @return {THREE.Mesh} The plane this image is placed on
	**/
	SkyCube.prototype.addImage = function(params) {
		var image = params.image;
		var x = params.x || 0;
		var	y = params.y || 0;
		var	z = params.z || 0;
		var width = params.width || 10;
		var height = params.height || 10;
		var texture = null;
		var material = null;
		var plane = null;

		if(!image) {
			throw new Error('Unable to add image: Image path is not set');
		}

		texture = THREE.ImageUtils.loadTexture( image );
		if ( texture.minFilter !== THREE.NearestFilter && texture.minFilter !== THREE.LinearFilter ) {
			texture.minFilter = THREE.NearestFilter;
		}
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
	* @function addImageCSS
	* @param {string} path Path to the image to display
	* @param {Object} params Configuration paramaters
	* @param {number} params.x X coordinate for the image
	* @param {number} params.y Y coordinate for the image
	* @param {number} params.z Z coordinate for the image
	* @param {number} params.width Optional width for the image
	* @param {number} params.height Optional height for the image
	* @return {THREE.CSS3DObject} The plane this image is placed on (the image DOM element can be accessed through plane.element)
	**/
	SkyCube.prototype.addImageCSS = function(path, params) {
		var x = params.x || 0;
		var y = params.y || 0;
		var z = params.z || 0;
		var img = new Image();

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
	* @function addObject
	* @param {Object} params Configuration object
	* @param {string} params.mesh Path to the object in JSON Object format
	* @param {number} params.x X coordinate for the image
	* @param {number} params.y Y coordinate for the image
	* @param {number} params.z z coordinate for the image
	* @returns {Promise} An ES6 promise resolving the loaded object
	**/
	SkyCube.prototype.addObject = function(params) {
		var x = params.x || 0;
		var y = params.y || 0;
		var z = params.z || 0;
		var loader = new THREE.ObjectLoader();

		return new Promise(function(resolve, reject) {
			if(!params.model) {
				reject(new Error('No model set'));
			}

			loader.load(params.model, function(obj) {
				obj.position.x = x;
				obj.position.y = y;
				obj.position.z = z;

				this.sceneCube.add(obj);
				this.objects.push(obj);

				resolve(obj);
			}.bind(this));
		}.bind(this));
	};

	/**
	* Add a THREEJS object and MTL into the skybox with the given texture.
	* Currently doesn't handle textures or animations.
	* @function addObjMtl
	* @param {Object} params Configuration object
	* @param {string} params.obj Path to the object in JSON Object format
	* @param {string} params.mtl Path to the MTL file
	* @param {number} params.x X coordinate for the image
	* @param {number} params.y Y coordinate for the image
	* @param {number} params.z z coordinate for the image
	* @param {Object} params.rotation Object with rotations for this object
	* @param {number} params.rotation.x X rotation for the image
	* @param {number} params.rotation.y Y rotation for the image
	* @param {number} params.rotation.z z rotation for the image
	* @returns {Promise} An ES6 promise resolving the loaded object
	**/
	SkyCube.prototype.addObjMtl = function(params) {
		var x = params.x || 0;
		var y = params.y || 0;
		var z = params.z || 0;
		var loader = new THREE.OBJMTLLoader();

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
					object.lookAt(this.cameraCube.position);
				}

				this.sceneCube.add(object);
				this.objects.push(object);

				resolve(object);
			}.bind(this), function() {}, function(xhr) {
				reject(xhr);
			});
		}.bind(this));
	};

	/**
	* Add a 3d object into the skybox with the given texture
	* @function addMesh
	* @param {Object} params Configuration parameters for the mesh
	* @param {string} param.mesh Path to the object in JSON Geometry format
	* @param {string} param.textureImage Path to the texture image (note that dimensions must be base 2)
	* @param {number} param.x X coordinate for the image
	* @param {number} param.y Y coordinate for the image
	* @param {number} param.z z coordinate for the image
	* @returns {Promise} ES6 promise resolving THREE.Mesh object
	**/
	SkyCube.prototype.addMesh = function(params) {
		var x = params.x || 0;
		var y = params.y || 0;
		var z = params.z || 0;
		var loader = new THREE.JSONLoader();

		if(!params.model) {
			throw new Error('No model set');
		}
		if(!params.texture) {
			throw new Error('No texture set');
		}

		return new Promise(function(resolve, reject) {
			loader.load(params.model, function( geometry ) {
				var texture = THREE.ImageUtils.loadTexture(params.texture);
				var material = new THREE.MeshBasicMaterial({
					map: texture
				});
				var mesh = new THREE.Mesh(geometry, material);
				var animation = null;

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
				if(params.animate === true || (params.animate !== false && mesh.geometry.animations)) { //eslint-disable-line no-extra-parens
					if(!mesh.geometry.animations) {
						reject(new Error('No animations set for model ' + params.model));
					}

					animation = new THREE.Animation(mesh, mesh.geometry.animations[0]);
					animation.play();
				}

				this.sceneCube.add(mesh);
				this.objects.push(mesh);

				resolve(mesh);
			}.bind(this));
		}.bind(this));
	};

	SkyCube.prototype.addCollada = function(params) {
		var loader = new THREE.ColladaLoader();

		if(!params.model) {
			throw new Error('No object set');
		}

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
					dae.lookAt(this.cameraCube.position);
				}

				dae.updateMatrix();

				this.sceneCube.add(dae);
				resolve(dae);
			}.bind(this));
		}.bind(this));
	};

	/**
	 * Convert a CSS formatted dimension (px or %) to the number of pixels it represents
	 * @function convertHtmlDimensionToPx
	 * @param {string} dimensionString The CSS formatted string to be cleaned/converted
	 * @returns {number} The number of pixes this dimension measures
	 * @throws {Error} String must be a valid CSS dimension string
	 **/
	function convertHtmlDimensionToPx(dimensionString) {
		var clean = null;
		var numRegex = /[0-9]+/;
		var percentRegex = /([0-9]+)%/;
		var pxRegex = /([0-9]+)px/;

		var matches = null;
		if(dimensionString === parseInt(dimensionString, 10) || dimensionString.search(numRegex)) {
			clean = parseInt(dimensionString, 10);
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

	/**
	 * Add a HTML DOM element using the CSS renderer
	 * @function addDomElem
	 * @param {Object} params Configuration settings
	 * @param {Object} DOM Element to add
	 * @param {number} width The width dimension for this element (defaults to element width if it can be calculated)
	 * @param {number} height The height dimension for this element (defaults to element height if it can be calculated)
	 * @param {Object} params.position Position settings for element
	 * @param {number} params.position.x X coordinate to place element
	 * @param {number} params.position.y Y coordinate to place element
	 * @param {number} params.position.z Z coordinate to place element
	 * @param {Object} params.rotation Rotation settings for element
	 * @param {number} params.rotation.x X coordinate to rotate element
	 * @param {number} params.rotation.y Y coordinate to rotate element
	 * @param {number} params.rotation.z Z coordinate to rotate element
	 * @returns {THREE.CSS3DObject} Created THREE CSS object
	 **/
	SkyCube.prototype.addDomElem = function(params) {
		var position = params.posiiton || {};
		var rotation = params.rotation || {};
		var cssObject = null;
		var element = params.element;
		var defaultDimensions = 360;	// This value is effectively arbitrary. It sets the plane dimensions if none are specified and we can't calculate them
		var planeMaterial = null;
		var planeWidth = null;
		var planeHeight = null;
		var planeGeometry = null;
		var planeMesh = null;


		if(!element) {
			throw new Error('No element set');
		}

		// Get or calculate the plane dimensions
		planeWidth = params.width || element.offsetWidth || element.width || element.style.width || defaultDimensions;
		planeWidth = convertHtmlDimensionToPx(planeWidth);
		planeHeight = params.height || element.offsetHeight || element.width || element.style.height || defaultDimensions;
		planeHeight = convertHtmlDimensionToPx(planeHeight);


		if(!position.x) {
			position.x = 0;
		}
		if(!position.y) {
			position.y = 0;
		}
		if(!position.z) {
			position.z = 0;
		}
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
		planeGeometry = new THREE.PlaneBufferGeometry( planeWidth, planeHeight );
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
	* @returns {null} No return value
	*/
	SkyCube.prototype.render = function() {
		var delta = this.clock.getDelta();
		var animationIndex = 0;

		this.cameraCube.rotation.copy(this.camera.rotation);
		this.cameraCube.fov = this.camera.fov;
		this.cameraCube.updateProjectionMatrix();

		for(animationIndex = 0; animationIndex < this.animations; animationIndex++) {
			this.animations[animationIndex].update(delta);
		}

		this.renderer.render(this.sceneCube, this.cameraCube );
		this.cssRenderer.render(this.cssScene, this.cameraCube);
	};


	/**
	* Animate the skycube by redrawing it in a loop. The animation loop currently cannot be stopped
	* @function animate
	* @returns {SkyCube} The current instance
	*/
	SkyCube.prototype.animate = function() {
		this.animationId = requestAnimationFrame(this.animate.bind(this));
		this.controls.update();
		this.render();
		return this;
	};

	/**
	* Get array of objects under the mouse cursor
	* @function getObjectsUnderMouse
	* @param {Event} event A Javascript mouse/touch event
	* @return {Array} All THREEJS objects under mouse
	*/
	SkyCube.prototype.getObjectsUnderMouse = function(event) {
		var xCoord = event.clientX || event.changedTouches[0].clientX;
		var yCoord = event.clientY || event.changedTouches[0].clientY;
		var mouse = new THREE.Vector3(xCoord / window.innerWidth * 2 - 1, -( yCoord / window.innerHeight ) * 2 + 1, 1);
		var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		var ray = null;
		var intersects = null;

		vector.unproject(this.cameraCube);
		ray = new THREE.Raycaster(this.cameraCube.position, vector.sub(this.cameraCube.position).normalize());

		intersects = ray.intersectObjects(this.objects);
		return intersects;
	};

	/**
	* As click on the canvas doesn't guarantee the same start/stop point get the objects we intersect on mouse down and bind a mouseup event to check if they match.
	* If the mousedown and mouseup are on the same object dispatch click on that object
	* @function onMouseDown
	* @param {Event} downEvent Javascript event for mouse click
	* @returns {null} No return value
	**/
	SkyCube.prototype.onMouseDown = function(downEvent) {
		var intersectsDown = this.getObjectsUnderMouse(downEvent);
		if(intersectsDown.length > 0) {
			var mouseUpFunc = function(upEvent) {
				var intersectsUp = this.getObjectsUnderMouse(upEvent);
				if(intersectsUp.length > 0 && intersectsUp[0].object === intersectsDown[0].object) {
					intersectsUp[0].object.dispatchEvent({type: 'click'});
				} else if(this.clickNothing) {
					this.clickNothing(event);
				}
				document.body.removeEventListener('mouseup', mouseUpFunc, false);
				document.body.removeEventListener('touchend', mouseUpFunc, false);
			}.bind(this);
			document.body.addEventListener('mouseup', mouseUpFunc, false);
			document.body.addEventListener('touchend', mouseUpFunc, false);
		}
	};

	/**
	* Mouse move event used if hover effects are used. This event is only bound if hoverEnabled is true as it could potentially be expensive
	* Checks if the mouse intersects with an object and if so calls the hover event on it. If not objects are found it calls the hoverNowhere event if set.
	* @function onMouseMove
	* @param {Event} event Javascript event for mouse move
	* @returns {null} No return value
	**/
	SkyCube.prototype.onMouseMove = function(event) {
		var mouse = null;
		var vector = null;
		var ray = null;
		var intersects = null;

		mouse = new THREE.Vector3(event.clientX / window.innerWidth * 2 - 1, -( event.clientY / window.innerHeight ) * 2 + 1, 1);

		vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		vector.unproject(this.cameraCube);
		ray = new THREE.Raycaster(this.cameraCube.position, vector.sub(this.cameraCube.position).normalize());

		intersects = ray.intersectObjects(this.objects);
		if(intersects.length > 0) {
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
	* @function onLookAt
	* @returns {null} No return value
	**/
	SkyCube.prototype.onLookAt = function() {
		var vector = new THREE.Vector3(0, 0, -1);
		vector.applyQuaternion(this.cameraCube.quaternion);
		var ray = new THREE.Raycaster(this.cameraCube.position, vector);
		var intersects = ray.intersectObjects(this.objects);

		if(this.lookThrough) {
			// look through and trigger each and every object we are looking at even if it is hidden behind another
			var newMatches = [];
			intersects.forEach(function(object) {
				var oldIndex = this.lookTargets.indexOf(object);
				if(oldIndex < 0) {
					// New so fire event
					object.dispatchEvent(lookAtEvt);
				} else {
					// Old so remove from old list to check what's left
					this.lookTargets.splice(oldIndex, 1);
				}
				newMatches.push(object);
			}.bind(this));

			// Anything left in lookTargets is no longer being looked at so call lookOff
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
	* @function onMouseWheel
	* @param {Event} event The Javascript Event for scrollwheel
	* @returns {null} no return value
	**/
	SkyCube.prototype.onMouseWheel = function(event) {
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
	* @function zoom
	* @param {number} zoomLevel the new desired camera field of view
	* @param {number} time The time in milliseconds to spend tweening to zoom
	* @returns {SkyBox} The current Skybox instance
	**/
	SkyCube.prototype.zoom = function(zoomLevel, time) {
		time = time || 1000;
		var framerate = 10;
		var steps = time / framerate;
		var distance = zoomLevel - this.camera.fov;
		var avgStep = distance / steps;
		var stepWeight = 2;

		var interval = setInterval(function() {
			// console.log("Step weight: "+stepWeight+", FOV: "+_this.camera.fov+", AvgStep: "+avgStep+", ThisStep: "+(avgStep * stepWeight));
			this.camera.fov += avgStep * stepWeight;
			stepWeight -= 1.5 / steps;
			if(this.camera.fov <= zoomLevel) {
				this.camera.fov = zoomLevel;
				clearInterval(interval);
			}
		}.bind(this), framerate);
	};

	/***************************
	* Rotator/Lookat functions *
	***************************/

	/**
	* Get the coordinates for a point in front of the camera
	* @function getPointInFront
	* @param {number} dist The distance in front of the camera to fetch the point from. Defaults to 200
	* @returns {THREE.Vector3} Coordinates for the point in from of the camera at the given distance
	**/
	SkyCube.prototype.getPointInFront = function(dist) {
		dist = dist || 200;
		var vec = new THREE.Vector3(0, 0, -dist);
		vec.applyQuaternion(this.camera.quaternion);
		return vec;
	};

	/**
	* Move the orbit camera to the other side than the target. This aligns the two cameras looking at the target
	* @function lookAt
	* @param {THREE.Vector3} target Coordinates of the point to look at
	* @returns {SkyCube} The current instance
	**/
	SkyCube.prototype.lookAt = function(target) {
		if(this.controls.object.position.equals(this.controls.target)) {
			//
			this.controls.object.position.setX(this.controls.object.position.x + 500);
		}
		var radius = this.controls.object.position.distanceTo(this.controls.target);	// Radius for orbit controls
		var distToTarget = this.controls.target.distanceTo(target);
		var dir = this.controls.target.clone().sub(target).normalize().multiplyScalar(radius + distToTarget);

		this.controls.object.position.copy(target).add(dir);
		return this;
	};

	/**
	* Animation loop - intended to be called by window.requestAnimationFrame()
	* @function step
	* @param {number} timestamp The current animation timestamp
	* @returns {null} No return value
	**/
	SkyCube.prototype.step = function(timestamp) {
		if(this.panning) {
			// First check where we are currently looking
			var radius = this.controls.object.position.distanceTo(this.controls.target);
			var currentTarget = this.getPointInFront(radius * 2);
			if(this.target) {
				// If we have a target pan to it
				// TODO: Check delta time before setting distance

				if(currentTarget.distanceTo(this.target) <= this.speedScale) {
					this.lookAt(this.target);

					this.target = null;
					this.panning = false;
					if(this.callback) {
						this.callback();
						this.callback = null;
					}
				} else {
					var dir = this.target.clone().sub(currentTarget).normalize().multiplyScalar(this.speedScale);
					currentTarget.add(dir);
					this.lookAt(currentTarget);
					this.cameraAnimationId = window.requestAnimationFrame(this.step.bind(this));
				}

			} else {
				// Otherwise just rotate
				var angle = timestamp * this.speedScale;
				var currentPosition = this.rotateCentre || this.object.target;
				var targetPosition = currentPosition.clone();
				var x = currentPosition.x + Math.sin(angle) * this.radius;
				var z = currentPosition.z + Math.cos(angle) * this.radius;
				var y = currentPosition.y;
				if(this.circle && this.circle.y) {
					y = this.circle.y;
				}

				targetPosition.x = x;
				targetPosition.z = z;
				targetPosition.y = y;
				this.lookAt(targetPosition);
				this.cameraAnimationId = window.requestAnimationFrame(this.step.bind(this));
			}
		}
	};

	/**
	* Pan the camera to the target point
	* @function panToPoint
	* @param {THREE.Vector3} target Coordinates of the point to pan to
	* @param {number} speed The animation speed to pan. Defaults to baseSpeed of the rotator
	* @param {Function} callback Callback function to call on completion of panning
	* @returns {SkyCube} The current instance
	**/
	SkyCube.prototype.panToPoint = function(target, speed, callback) {
		// Put the target point on the same radius as the camera orbit
		var radius = this.controls.object.position.distanceTo(this.controls.target);
		var dir = target.clone().sub(this.controls.target).normalize().multiplyScalar(radius * 2);
		target = this.controls.target.clone().add(dir);

		// Calculate how far we have to move
		var currentTarget = this.getPointInFront(radius * 2);
		var moveDist = currentTarget.distanceTo(target);

		// Now caluclate speed
		this.speed = speed || this.baseSpeed;
		this.speedScale = moveDist / this.speed;
		this.target = target;
		this.callback = callback;

		this.panning = true;

		// Stop if user takes control
		this.controls.addEventListener('start', function() {
			this.stop();
		}.bind(this));

		this.cameraAnimationId = window.requestAnimationFrame(this.step.bind(this));
		return this;
	};

	/**
	* Focus the camera on a rotating point
	* @function rotate
	* @param {number} speed The time in seconds to complete a rotation. Defaults to baseSpeed from constructor
	* @param {number} radius The radius of the circle to follow. Defaults to baseRadius from the constructor
	* @param {Object} centre The centrepoint of the circle (object with x, y, z coordinates). Defaults to the camera position
	* @returns {SkyCube} The current instance
	**/
	SkyCube.prototype.rotate = function(centre, speed, radius) {

		this.speed = speed || this.baseSpeed;
		this.speedScale = 0.001 * 2 * Math.PI / this.speed;

		this.radius = radius || this.baseRadius;
		this.rotateCentre = centre || this.getPointInFront(1000).setY(-50);

		this.panning = true;

		// Stop if user takes control
		this.controls.addEventListener('start', function() {
			this.stop();
		}.bind(this));

		this.cameraAnimationId = window.requestAnimationFrame(this.step.bind(this));
		return this;
	};

	/**
	* Stop current motion
	* @function stop
	* @returns {SkyCube} The current instance
	**/
	SkyCube.prototype.stop = function() {
		this.panning = false;
		this.target = null;
		this.callback = null;
		return this;
	};

	/**
	 * Destroy this skycube. Cancel animation, remove from the DOM and deallocate objects
	 * @returns {SkyCube} the destroyed skycube instance
	 **/
	SkyCube.prototype.destroy = function() {
		window.cancelAnimationFrame(this.animationId);
		window.cancelAnimationFrame(this.cameraAnimationId);
		this.container.removeChild(this.renderer.domElement);
		this.container.removeChild(this.cssRenderer.domElement);
		this.sceneCube= null;
		this.camera = null;
		this.cameraCube = null;
		this.controls = null;
		this.eventListeners = {}; // With new controls we lose the event listeners
		return this;
	};

}());
