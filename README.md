## README

The panorama helper library is a wrapper for threejs to create interactive panoramas. 

## Usage

### Create new skybox
To create a simple panorama create a new SkyCube object passing the required images and the ID for the parent div
````
var skybox = new SkyCube({
	parentId: 'skyboxDiv',
	images: {
		front: 'images/front.jpg',
		back: 'images/back.jpg',
		right: 'images/right.jpg',
		left: 'images/left.jpg',
		top: 'images/top.jpg',
		bottom: 'images/bottom.jpg'
	}
});
````


## Motivation

The IMPS team first created 3D panoramas for the interactive excursions to analyse leaf cover in bush sites. The code was replicated for each project and difficult to maintain. Fixing bugs or upgrading the threejs library needed to be replicated across each excursion. As the IMPS team began exploring creating similar panoramas for the memory MOOC it made sense to build a single helper library that could be applied back onto the panoramas to address some known issues. 

## Installation

* The library requires [threejs](https://github.com/mrdoob/three.js/) which is available from the CDN https://cdnjs.cloudflare.com/ajax/libs/three.js/r70/three.js
*Navigation requires OrbitControls from the examples directory in threejs (currently bundled in lib)
* The following optional libraries are required for certain functionality. They are currently bundled in the lib directory
    * The CSS3dRender is required to include web elements
    * The OBJLoader is required to include 3D models
    * The ColladaLoader is required to include Collada objects

## Tests

To be updated

## Contributors

* Matthew Elvey, IMPS team (Matthew.Elvey@cdu.edu.au)

