const temperatureInput = document.getElementById('temperature');
const fromUnitSelect = document.getElementById('fromUnit');
const toUnitSelect = document.getElementById('toUnit');
const resultValue = document.getElementById('resultValue');
const convertBtn = document.getElementById('convertBtn');

function convertTemperature(value, from, to) {
  let celsius;

  if (from === 'celsius') celsius = value;
  if (from === 'fahrenheit') celsius = (value - 32) * (5 / 9);
  if (from === 'kelvin') celsius = value - 273.15;

  if (to === 'celsius') return celsius;
  if (to === 'fahrenheit') return (celsius * 9) / 5 + 32;
  if (to === 'kelvin') return celsius + 273.15;

  return value;
}

function updateResult() {
  const rawValue = Number(temperatureInput.value);

  if (temperatureInput.value === '' || Number.isNaN(rawValue)) {
    resultValue.textContent = 'Enter a value';
    return;
  }

  const converted = convertTemperature(rawValue, fromUnitSelect.value, toUnitSelect.value);
  resultValue.textContent = `${converted.toFixed(2)} °${toUnitSelect.value === 'celsius' ? 'C' : toUnitSelect.value === 'fahrenheit' ? 'F' : 'K'}`;
}

convertBtn.addEventListener('click', updateResult);
fromUnitSelect.addEventListener('change', updateResult);
toUnitSelect.addEventListener('change', updateResult);

temperatureInput.addEventListener('input', updateResult);

updateResult();
