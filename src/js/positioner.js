/**
* A helper object to add a form so objects can be positioned on the fly
**/
(function() {
	'use strict';
	var Positioner = function(target, lookAt) {
		this.form = document.createElement('form');
		this.form.className = 'position-form';
		this.inputs = {};
		this.target = target;

		var fields = ['x', 'y', 'z'];
		fields.forEach((function(fieldName) {
			var inputId = 'pos' + fieldName + 'Input';
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

		this.selectType = document.createElement('select');
		var positionOption = document.createElement('option');
		positionOption.value = 'position';
		positionOption.textContent = 'Position';
		this.selectType.appendChild(positionOption);
		var rotationOption = document.createElement('option');
		rotationOption.value = 'rotation';
		rotationOption.textContent = 'Rotation';
		this.selectType.appendChild(rotationOption);

		this.form.appendChild(this.selectType);

		var submit = document.createElement('button');
		submit.textContent = 'Update';
		submit.addEventListener('click', (function(evt) {
			evt.preventDefault();

			var type = this.selectType.options[this.selectType.selectedIndex].value;

			fields.forEach((function(fieldName) {
				target[type][fieldName] = parseInt(this.inputs[fieldName].value, 10);
//				console.log('Set ' + type + ' ' + fieldName + ' to ' + this.inputs[fieldName].value);
			}).bind(this));
			if(lookAt) {
				target.lookAt(lookAt[type]);
			}
			return false;
		}).bind(this));

		this.selectType.addEventListener('change', (function() {
			var type = this.selectType.options[this.selectType.selectedIndex].value;
			fields.forEach((function(fieldName) {
				this.inputs[fieldName].value = target[type][fieldName];
			}).bind(this));
		}).bind(this));

		this.form.appendChild(submit);

		this.form.style.position = 'fixed';
		this.form.style.top = 0;
		this.form.style.padding = '5px';
		this.form.style.borderRadius = '5px';
		this.form.style.backgroundColor = 'rgba(255,255,255,0.8)';

		document.body.appendChild(this.form);
	};

	window.Positioner = Positioner;
}());
