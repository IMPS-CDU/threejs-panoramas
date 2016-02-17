/*global SkyCube, Positioner */
(function() {
	'use strict';

	var assets = {
		infoIcon: 'images/Info_circle.png'
	};

	var skybox = new SkyCube({
		parentId: 'skyboxDiv',
		zoomable: true,
		images: {
			front: 'images/negz.jpg',
			back: 'images/posz.jpg',
			right: 'images/negx.jpg',
			left: 'images/posx.jpg',
			top: 'images/posy.jpg',
			bottom: 'images/negy.jpg'
		},
		loaded: function() {
			// When the skybox has loaded hide the loading spinner
			var loadingView = document.getElementById('loadingView');
			loadingView.style.display = 'none';
		},
		error: function(err) {
			// An error has occurred. Documentation is a bit slim on what it returns so get whatever type of error it can provide us with
			document.getElementById('loading_info').classList.add('hidden');
			var errorDiv = document.getElementById('loading_error');
			if(err.message) {
				errorDiv.textContent = err.message;
			} else if(typeof err === 'string') {
				errorDiv.textContent = err;
			} else {
				errorDiv.textContent = 'An error occurred loading the room. Try reloading the page or restarting your browser if the problem persists.';
			}
			errorDiv.style.display = 'block';
		}
	});
	skybox.animate();

	// Add first image
	var obj1 = skybox.addImage({
		image: assets.infoIcon,
		x: -200,
		y: -65,
		z: 77
	});

	// Add click event to object
	obj1.addEventListener('click', function() {
		var someContent = document.getElementById('someContent');
		someContent.style.display = 'block';
	});

	// Second object
	var obj2 = skybox.addImage({
		image: assets.infoIcon,
		x: 0,
		y: 0,
		z: -200
	});

	// Add click event to object
	obj2.addEventListener('click', function() {
		// Look at this object
		skybox.lookAt(obj2.position);
	});

	// Close content div if X is clicked
	document.getElementById('closeSomeContent').addEventListener('click', function() {
		document.getElementById('someContent').style.display = 'none';
	});

	var positioner = new Positioner(obj2, true);

}());

