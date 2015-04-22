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
skybox.animate();
````
#### Options
* parentId: The ID for the DOM element to draw panorama inside
* images: Images to draw in panorama

### Add raster image
````
skybox.addImage(path, x, y, z);
````

### Add a web element
````
var elem = document.getElementById('anElement');
skybox.addDomElem({
    element: elem,
    position: {
        x: -150
        y: 450,
        z: 8000
    },
    rotation: {
        x: 0,
        y: 1 * Math.PI,
        z: 0
    }
});
````

### Add a mesh object
````
skybox.addMesh({
    model: "objects/objMesh.js",
    texture: 'images/objTexture.jpg',
    x: -100,
    y: -20,
    z: 40,
    onClick: function(evt) {
        console.log("Clicked!!");
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

## API Reference

### function addImage(path, x, y, z)
Add a bitmap image into the skybox on a flat plane facing the player
#### Parameters
* image: Path to the image to display 
* x X coordinate for the image
* y Y coordinate for the image
* z z coordinate for the image
* zoomable Enable mousewheel zoom. Default false
* hoverEnabled Enable hover events for objects. Default false
### Return
The plane this image is placed on

### addMesh(params)
Add a 3d object into the skybox with the given texture
#### Parameters
* mesh Path to the object in JSON Geometry format
* textureImage Path to the texture image (note that dimensions must be base 2)
* x X coordinate for the image
* y Y coordinate for the image
* z z coordinate for the image

### addCollada(params)

### addDomElem(params)


### animate()
Start the animation loop for skycube


## Contributors

* Matthew Elvey, IMPS team (Matthew.Elvey@cdu.edu.au)