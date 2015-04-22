/*jslint  white: true, browser: true, plusplus: true, nomen: true */
/*global THREE, requestAnimationFrame, console */

//if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
(function() {
	"use strict";
	var 
		container,
		projector = new THREE.Projector(),
		camera, 
		scene, 
		renderer,
		cameraCube, 
		sceneCube,
		mesh, 
		objs = [],
		topGrid, bottomGrid,
		hotspot = [],
		hotspotEnabled = true,
		loading = 0,
		windowHalfX = window.innerWidth / 2,
		windowHalfY = window.innerHeight / 2,
		images;

	
	function onWindowResize() {

		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		cameraCube.aspect = window.innerWidth / window.innerHeight;
		cameraCube.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}
	

	function hideLoadingScreen(){
		var loadingScreen = document.getElementById("loadingScreen");
		loadingScreen.style.display = "none";
	}

	function render() {
		cameraCube.rotation.copy( camera.rotation );
//		cameraCube.fov = cameraFOV;
		cameraCube.updateProjectionMatrix();

		renderer.render( sceneCube, cameraCube );
		renderer.render( scene, camera );
	
		if(loading < 30){
			loading = loading + 1;
			if(loading >= 30) {
				hideLoadingScreen();
			}
		}
	}


	function animate() {
	
		requestAnimationFrame( animate );

		render();
	
	}


	function addPlaneOverlay(image, rotation, y){
		var
			texture,
			material,
			plane;
			
		texture = THREE.ImageUtils.loadTexture( image );
		material = new THREE.MeshLambertMaterial({ map : texture, transparent: true});
		plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), material);
	
		plane.rotation.x = rotation * (Math.PI/180);
		plane.position.y = y;
		sceneCube.add(plane);
		return plane;
	}

	function addDot(x,y,z){
		var
			texture,
			material,
			plane;

		texture = THREE.ImageUtils.loadTexture( "Info_circle.png" );
		material = new THREE.MeshLambertMaterial({ map : texture, transparent: true});
		plane = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), material);

		plane.position.x = x;
		plane.position.y = y;
		plane.position.z = z;
		sceneCube.add(plane);
		objs.push(plane);
		return plane;				
	}

			
	function pick(event){
		var 
			popup,
			mouse,
			vector,
			ray,
			intersects;
		
		popup = document.getElementById("hover");
		popup.style.display = "none";

		if(hotspotEnabled){
			mouse = new THREE.Vector3((event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 1);
			//console.log(event);
			vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
			projector.unprojectVector( vector, cameraCube );
			ray = new THREE.Raycaster( cameraCube.position, vector.sub( cameraCube.position ).normalize() );
	
			intersects = ray.intersectObjects(objs);

			if(intersects.length > 0){	
				popup.src = intersects[0].object.name;
				popup.style.left = (event.clientX + 10) + "px";
				popup.style.top = (event.clientY + 10) + "px";
				popup.style.display = "inline";
			}
		}
	}


	function getSrc(name){
		switch(name){
			case "Cycas Armstrongii.html": return "http://www.pacsoa.org.au/w/index.php?title=Cycas_armstrongii";
			case "Planchonia careya.html": return "http://bie.ala.org.au/species/Planchonia+careya";
			case "Grevillea decurrens.html": return "http://bie.ala.org.au/species/Grevillea+decurrens";
			case "Sorghum (Sarga) intrans.html": return "http://ausgrass2.myspecies.info/content/sarga-intrans";
			case "Cochlospermum fraseri.html": return "http://bie.ala.org.au/species/Cochlospermum+fraseri";
			case "Terminalia ferdinandiana.html": return "http://bie.ala.org.au/species/Terminalia+ferdinandiana";
			case "Persoonia falcata.html": return "http://bie.ala.org.au/species/Persoonia+falcata";
			case "Eucalyptus tetrodonta.html": return "http://bie.ala.org.au/species/Eucalyptus+tetrodonta";
			case "Termite mound.html": return "http://www.csiro.au/Outcomes/Environment/Australian-Landscapes/TermitesInNthAustEcosystems.aspx";
			case "blackwattle.html": return "http://bie.ala.org.au/species/Acacia+auriculiformis";
			case "Gardenia megasperma.html": return "http://bie.ala.org.au/species/Gardenia+megasperma";
			case "ironwood.html": return "http://bie.ala.org.au/species/Erythrophleum+chlorostachys";
			case "Tacca leontopetaloides.html": return "http://bie.ala.org.au/species/Tacca+leontopetaloides";
			case "Exocarpos latifolius.html": return "http://bie.ala.org.au/species/Exocarpos+latifolius";
			case "Gamba grass.html": return "http://www.weeds.org.au/cgi-bin/weedident.cgi?tpl=plant.tpl&card=G04";
			case "Smilax australis.html": return "http://bie.ala.org.au/species/Smilax+australis";
			case "Buchanania obovata.html": return "http://bie.ala.org.au/species/Buchanania+obovata";
			case "Acacia auriculiformis.html": return "http://bie.ala.org.au/species/Acacia+auriculiformis";
			case "Passiflora foetida.html": return "";
			case "Edge effect.html": return "http://www.saveourwaterwaysnow.com.au/_dbase_upl/Edges.pdf";
		}			
	}

	function click(event){
		var 
			popup,
			mouse,
			vector,
			ray,
			intersects;
			
		popup = document.getElementById("popup");
		popup.style.display = "none";
		popup.src = "pageloading.html";

		if(hotspotEnabled){
			mouse = new THREE.Vector3((event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 1);
		
			vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
			projector.unprojectVector( vector, cameraCube );
			ray = new THREE.Raycaster( cameraCube.position, vector.sub( cameraCube.position ).normalize() );
	
			intersects = ray.intersectObjects(objs);
			if(intersects.length > 0){
				popup.src = getSrc(intersects[0].object.name);
				popup.style.display = "inline";
			}
		}
	}

	function addLight(){
		var 
			directionalLight,
			directionalLight2,
			directionalLight3,
			directionalLight4,
			directionalLight5,
			directionalLight6;
		
		directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
		directionalLight.position.set( 0, 0, 1 );
		sceneCube.add( directionalLight );
	
		directionalLight2 = new THREE.DirectionalLight( 0xffffff, 1 );
		directionalLight2.position.set( 0, 1, 0 );
		sceneCube.add( directionalLight2 );
	
		directionalLight3 = new THREE.DirectionalLight( 0xffffff, 1 );
		directionalLight3.position.set( 1, 0, 0 );
		sceneCube.add( directionalLight3 );	
	
		directionalLight4 = new THREE.DirectionalLight( 0xffffff, 1 );
		directionalLight4.position.set( 0, 0, -1 );
		sceneCube.add( directionalLight4 );	
	
		directionalLight5 = new THREE.DirectionalLight( 0xffffff, 1 );
		directionalLight5.position.set( 0, -1, 0 );
		sceneCube.add( directionalLight5 );	
	
		directionalLight6 = new THREE.DirectionalLight( 0xffffff, 1 );
		directionalLight6.position.set( -1, 0, 0 );
		sceneCube.add( directionalLight6 );		
	}


	function addPlane(){
		var 
			material,
			geometry,
			planeMesh,
			element,
			cssObject;
		// create the plane mesh
		material = new THREE.MeshBasicMaterial({ wireframe: true });
		material.color.set('black');
		material.opacity   = 0;
		material.blending  = THREE.NoBlending;
		geometry = new THREE.PlaneGeometry(4,4);
		planeMesh= new THREE.Mesh( geometry, material );
		// add it to the WebGL scene
		sceneCube.add(planeMesh);
		//planeMesh.position.x = 100;
		//planeMesh.position.y = 100;
		planeMesh.position.z = -10;
		// create the dom Element
		element = document.createElement( 'img' );
		element.src = 'camera.png';
		// create the object3d for this element
		cssObject = new THREE.CSS3DObject( element );
		// we reference the same position and rotation 
		cssObject.position = planeMesh.position;
		cssObject.rotation = planeMesh.rotation;
		// add it to the css scene
		sceneCube.add(cssObject);			
	}

	function toggleGrid(){
		if(topGrid !== null){
			if(topGrid.visible){
				topGrid.visible = false;
				bottomGrid.visible = false;
			} else {
				topGrid.visible = true;
				bottomGrid.visible = true;					
			}
		}
	}

	function toggleHotSpot(){
		var i;
		if(hotspotEnabled){  
			hotspotEnabled = false;
		} else { 
			hotspotEnabled = true;
		}
		for(i=0; i < hotspot.length; i++){
			if(hotspot[i] !== null){
				if(hotspot[i].visible){
					hotspot[i].visible = false;
				} else {
					hotspot[i].visible = true;				
				}
			}
		}
	}

	
	function init() {
		var 
			controls,
			urls,
			textureCube,
			material,
		shader;

		container = document.createElement( 'div' );
		document.body.appendChild( container );

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
		console.log(urls);
		textureCube = THREE.ImageUtils.loadTextureCube( urls, new THREE.CubeRefractionMapping() );
//		material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube, refractionRatio: 0.95 } );		

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
	/*
		topGrid = addPlaneOverlay("overlayposy.png", 90, 50);
		bottomGrid = addPlaneOverlay("overlaynegy.png", -90, -50);
		//updated
		hotspot[0] = addDot(61,-15,55);
		hotspot[0].lookAt(cameraCube.position);
		hotspot[0].name = "Cycas Armstrongii.html";
		//updated **not on list**
		hotspot[1] = addDot(-65,0,3);
		hotspot[1].lookAt(cameraCube.position);
		hotspot[1].name = "Planchonia careya.html";				
		//updated
		hotspot[2] = addDot(65,0,20);
		hotspot[2].lookAt(cameraCube.position);
		hotspot[2].name = "Grevillea decurrens.html";	
		//updated
		hotspot[3] = addDot(-3,15,-65);
		hotspot[3].lookAt(cameraCube.position);
		hotspot[3].name = "Sorghum (Sarga) intrans.html";	
		//updated
		hotspot[4] = addDot(-65,-10,-23);
		hotspot[4].lookAt(cameraCube.position);
		hotspot[4].name = "Cochlospermum fraseri.html";	
		//updated
		hotspot[5] = addDot(-12,-5,65);
		hotspot[5].lookAt(cameraCube.position);
		hotspot[5].name = "blackwattle.html";		
		//updated
		hotspot[6] = addDot(65,0,2);
		hotspot[6].lookAt(cameraCube.position);
		hotspot[6].name = "ironwood.html";		
		//updated
		hotspot[7] = addDot(65,-30,15);
		hotspot[7].lookAt(cameraCube.position);
		hotspot[7].name = "Tacca leontopetaloides.html";	
		//updated
		hotspot[8] = addDot(65,-1,-24);
		hotspot[8].lookAt(cameraCube.position);
		hotspot[8].name = "Exocarpos latifolius.html";				
		//updated
		hotspot[9] = addDot(40,-40,-40);
		hotspot[9].lookAt(cameraCube.position);
		hotspot[9].name = "Gamba grass.html";	
		//updated
		hotspot[10] = addDot(15,11,65);
		hotspot[10].lookAt(cameraCube.position);
		hotspot[10].name = "Gardenia megasperma.html";	
		//updated
		hotspot[11] = addDot(-40,10,-65);
		hotspot[11].lookAt(cameraCube.position);
		hotspot[11].name = "Eucalyptus tetrodonta.html";
		//updated
		hotspot[12] = addDot(65,25,32);
		hotspot[12].lookAt(cameraCube.position);
		hotspot[12].name = "Smilax australis.html";
		//updated
		hotspot[13] = addDot(25,-45,65);
		hotspot[13].lookAt(cameraCube.position);
		hotspot[13].name = "Buchanania obovata.html";
		//updated
		hotspot[14] = addDot(-5,65,3);
		hotspot[14].lookAt(cameraCube.position);
		hotspot[14].name = "Acacia auriculiformis.html";					
		//updated
		hotspot[15] = addDot(-65,30,-40);
		hotspot[15].lookAt(cameraCube.position);
		hotspot[15].name = "Passiflora foetida.html";	
		//updated
		hotspot[16] = addDot(-20,0,-65);
		hotspot[16].lookAt(cameraCube.position);
		hotspot[16].name = "Edge effect.html";
		//updated
		hotspot[17] = addDot(-70,10,-60);
		hotspot[17].lookAt(cameraCube.position);
		hotspot[17].name = "Eucalyptus tetrodonta.html";
*/
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.autoClear = false;
		container.appendChild( renderer.domElement );
	
		addLight();
		controls = new THREE.OrbitControls( camera, renderer.domElement );
		window.addEventListener( 'resize', onWindowResize, false );

	}
	
	
	images = {
		front: 'images/ScienceLab PTGUI.front.jpg',
		back: 'images/ScienceLab PTGUI.back.jpg',
		right: 'images/ScienceLab PTGUI.right.jpg',
		left: 'images/ScienceLab PTGUI.left.jpg',
		top: 'images/ScienceLab PTGUI.top.jpg',
		bottom: 'images/ScienceLab PTGUI.bottom.jpg'
	};
	
	//document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mousedown', click, false );
	document.addEventListener( 'mousemove', pick, false );

	init();
	animate();
	
}());