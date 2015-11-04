(function() {
	'use strict';
	var namespace = window.Panoramas = window.Panoramas || {};

	/**
	* Rotator
	* A class to handle rotation and panning on the controls target
	* @param params - An object with setup paramaters for the rotator
	* Available paramaters are
	* - controls A THREE.Controls object to set the target for (required)
	* - camera A THREE.Camera object to rotate. Defaults to the camera on the controls object
	* - speed An integer value setting the default amount to time to complete an animation or full rotation. Defaults to 20
	* - radius An integer value for the default radius of the circle to track when rotating. The speed means this has no impact in most circumstances. Defaults to 200
	**/
	function Rotator(params) {
		this.controls = params.controls;
		this.camera = params.camera || this.controls.object;
		this.baseSpeed = params.speed || 20;
		this.baseRadius = params.radius || 200;
		this.playing = false;
		this.centre = null;
	}
	var p = Rotator.prototype;

	/**
	* Get the coordinates for a point in front of the camera
	* @param dist The distance in front of the camera to fetch the point from. Defaults to 200
	* @returns A THREE.Vector3 of the coordinates for the point
	**/
	p.getPointInFront = function(dist) {
		dist = dist || 200;
		var vec = new THREE.Vector3(0, 0, -dist);
		vec.applyQuaternion(this.camera.quaternion);
		return vec;
	};

	/**
	* @deprecated Should not longer use this as the rotator now uses the camera orbit
	**/
	p.resetCameraPosition = function() {
		console.error('Reset Camera Position is deprecated as rotator now uses camera orbit position');
	};

	/**
	* Move the orbit camera to the other side than the target. This aligns the two cameras looking at the target
	* @param @target THREE.Vector3 The point to look at
	**/
	p.lookAtTarget = function(target) {
		if(this.controls.object.position.equals(this.controls.target)) {
			//
			this.controls.object.position.setX(this.controls.object.position.x + 500);
		}
		var radius = this.controls.object.position.distanceTo(this.controls.target);	// Radius for orbit controls
		var distToTarget = this.controls.target.distanceTo(target);
		var dir = this.controls.target.clone().sub(target).normalize().multiplyScalar(radius + distToTarget);

		this.controls.object.position.copy(target).add(dir);
	};

	/**
	* Animation loop - intended to be called by window.requestAnimationFrame()
	* @param timestamp The current animation timestamp
	**/
	p.step = function(timestamp) {
		if(this.playing) {
			// First check where we are currently looking
			var radius = this.controls.object.position.distanceTo(this.controls.target);
			var currentTarget = this.getPointInFront(radius * 2);
			if(this.target) {
				// If we have a target pan to it
				// TODO: Check delta time before setting distance

				if(currentTarget.distanceTo(this.target) <= this.speedScale) {
					this.lookAtTarget(this.target);

					this.target = null;
					this.playing = false;
					if(this.callback) {
						this.callback();
						this.callback = null;
					}
				} else {
					var dir = this.target.clone().sub(currentTarget).normalize().multiplyScalar(this.speedScale);
					currentTarget.add(dir);
					this.lookAtTarget(currentTarget);
					window.requestAnimationFrame(this.step.bind(this));
				}

			} else {
				// Otherwise just rotate
				var angle = timestamp * this.speedScale;
				var currentPosition = this.centre || this.object.target;
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
				this.lookAtTarget(targetPosition);
				window.requestAnimationFrame(this.step.bind(this));
			}
		}
	};

	/**
	* Pan the camera to the target point
	* @param target THREE.Vector3 representing the point to pan to
	* @param speed The animation speed to pan. Defaults to baseSpeed of the rotator
	* @param callback Callback function to call on completion of panning
	**/
	p.panToPoint = function(target, speed, callback) {
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

		this.playing = true;

		// Stop if user takes control
		this.controls.addEventListener('start', (function() {
			this.stop();
		}).bind(this));

		window.requestAnimationFrame(this.step.bind(this));
	};

	/**
	* Focus the camera on a rotating point
	* @param speed The time in seconds to complete a rotation. Defaults to baseSpeed from constructor
	* @param radius The radius of the circle to follow. Defaults to baseRadius from the constructor
	* @param centre The centrepoint of the circle (object with x, y, z coordinates). Defaults to the camera position
	**/
	p.rotate = function(speed, radius, centre) {

		this.speed = speed || this.baseSpeed;
		this.speedScale = (0.001 * 2 * Math.PI) / this.speed;

		this.radius = radius || this.baseRadius;
		this.centre = centre;

		this.playing = true;
		// Stop if user takes control
		this.controls.addEventListener('start', (function() {
			this.stop();
		}).bind(this));

		window.requestAnimationFrame(this.step.bind(this));
	};

	/**
	* Stop current motion
	**/
	p.stop = function() {
		this.playing = false;
		this.target = null;
		this.callback = null;
	};


	namespace.Rotator = Rotator;
})();
