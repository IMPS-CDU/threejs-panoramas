module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			lib: ['lib/'],
			components: ['components/']
		},
		bower: {
			dev: {
				dest: 'components/',
				options: {
					packageSpecific: {
						'threejs': {
							files: [
								'build/three.js',
								'build/three.min.js',
								'examples/js/controls/OrbitControls.js',
								'examples/js/renderers/CSS2DRenderer.js',
								'examples/js/renderers/CSS3DRenderer.js',
								'examples/js/renderers/CSS3DStereoRenderer.js',
								'examples/js/renderers/CanvasRenderer.js',
								'examples/js/loaders/ColladaLoader.js',
								'examples/js/loaders/OBJLoader.js',
								'examples/js/Detector.js',
								'examples/js/renderers/Projector.js'
							]
						}
					}
				}
			}
		},
		copy: {
			bower: {
				files: [
					{expand: true, flatten: true, cwd: 'components/', src: ['<%= bower.dev.options.packageSpecific.threejs.files %>'], dest: 'lib/'}
//					{explan: true, flatten: true, cwd: 'public/', src: ['<%= bower.dev.options.packageSpecific.threejs.files %>'], dest: 'tmp/'}
				]
			}
		}
	});
	grunt.loadNpmTasks('grunt-bower');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	
	
	grunt.registerTask('default', ['clean:lib', 'bower', 'copy', 'clean:components']);
};