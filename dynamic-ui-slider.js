
document.addEventListener('DOMContentLoaded', function() {
	const rangeSlider = document.getElementById('range-input');
	const numberInput = document.getElementById('number-input');

	console.log('Range slider:', rangeSlider);
	console.log('Number input:', numberInput);

	function updateSliderBackground(slider) {
		const min = slider.min || 0;
		const max = slider.max || 100;
		const value = slider.value;
		const percentage = ((value - min) / (max - min)) * 100;

		slider.style.background = `linear-gradient(to right, #4CAF50 0%, #4CAF50 ${percentage}%, #e0e0e0 ${percentage}%, #e0e0e0 100%)`;
	}

	if (rangeSlider && numberInput) {
		updateSliderBackground(rangeSlider);

		rangeSlider.addEventListener('input', function() {
			console.log('Range slider value:', this.value);
			numberInput.value = this.value;
			updateSliderBackground(this);
		});

		numberInput.addEventListener('input', function() {
			console.log('Number input value:', this.value);

			if (this.value < rangeSlider.min) {
				this.value = rangeSlider.min;
			}

			if (this.value > rangeSlider.max) {
				this.value = rangeSlider.max;
			}

			rangeSlider.value = this.value;
			updateSliderBackground(rangeSlider);
		});
	}
});