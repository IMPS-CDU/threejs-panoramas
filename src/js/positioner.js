/**
* A helper object to add a form so objects can be positioned on the fly
**/
(function() {
	"use strict";
	var Positioner = function(target, lookAt) {
		this.form = document.createElement('form');
		this.form.class = 'position-form';
		this.inputs = {};
		this.target = target;
		
		var fields = ['x','y','z'];
		fields.forEach((function(fieldName) {
			var inputId = 'pos'+fieldName+'Input';
			var lbl = document.createElement('label');
			lbl.for = inputId;
			lbl.textContent = fieldName;
			this.form.appendChild(lbl);
			var input = document.createElement('input');
			input.id = inputId;
			input.value = target.position[fieldName];
			this.inputs[fieldName] = input;
			this.form.appendChild(input);
		}).bind(this));
		
		
		var submit = document.createElement('button');
		submit.textContent = 'Update';
		submit.addEventListener('click', (function(evt) {
			evt.preventDefault();
			fields.forEach((function(fieldName) {
				target.position[fieldName] = this.inputs[fieldName].value;
				console.log('Set '+fieldName+' to '+this.inputs[fieldName].value);
			}).bind(this));
			if(lookAt) {
				target.lookAt(lookAt);
			}
			return false;
		}).bind(this));
		this.form.appendChild(submit);
		
		document.body.appendChild(this.form);
	};
	
	window.Positioner = Positioner;
}());