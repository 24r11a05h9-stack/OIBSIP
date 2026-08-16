const display = document.getElementById('display');
const buttons = document.querySelectorAll('button');

let currentInput = '0';
let previousValue = null;
let operator = null;
let shouldResetDisplay = false;

function updateDisplay(value) {
  const safeValue = value === '' ? '0' : String(value);
  display.textContent = safeValue;
}

function clearCalculator() {
  currentInput = '0';
  previousValue = null;
  operator = null;
  shouldResetDisplay = false;
  updateDisplay(currentInput);
}

function deleteLastCharacter() {
  if (shouldResetDisplay) {
    currentInput = '0';
    shouldResetDisplay = false;
    updateDisplay(currentInput);
    return;
  }

  if (currentInput.length <= 1) {
    currentInput = '0';
  } else {
    currentInput = currentInput.slice(0, -1);
  }

  updateDisplay(currentInput);
}

function appendNumber(value) {
  if (value === '.' && currentInput.includes('.')) {
    return;
  }

  if (shouldResetDisplay) {
    currentInput = '0';
    shouldResetDisplay = false;
  }

  if (currentInput === '0' && value !== '.') {
    currentInput = value;
  } else {
    currentInput += value;
  }

  updateDisplay(currentInput);
}

function setOperator(nextOperator) {
  if (operator && !shouldResetDisplay) {
    evaluateExpression();
  }

  previousValue = Number(currentInput);
  operator = nextOperator;
  shouldResetDisplay = true;
}

function performCalculation(firstValue, secondValue, selectedOperator) {
  switch (selectedOperator) {
    case '+':
      return firstValue + secondValue;
    case '-':
      return firstValue - secondValue;
    case '*':
      return firstValue * secondValue;
    case '/':
      if (secondValue === 0) {
        return 'Error';
      }
      return firstValue / secondValue;
    default:
      return secondValue;
  }
}

function evaluateExpression() {
  if (operator === null || previousValue === null) {
    return;
  }

  const nextValue = Number(currentInput);
  const result = performCalculation(previousValue, nextValue, operator);

  if (result === 'Error') {
    currentInput = 'Error';
    previousValue = null;
    operator = null;
    shouldResetDisplay = true;
    updateDisplay(currentInput);
    return;
  }

  currentInput = String(result);
  previousValue = null;
  operator = null;
  shouldResetDisplay = true;
  updateDisplay(currentInput);
}

buttons.forEach((button) => {
  const buttonValue = button.dataset.value;
  const action = button.dataset.action;

  button.addEventListener('click', () => {
    if (button.classList.contains('number')) {
      appendNumber(buttonValue);
      return;
    }

    if (button.classList.contains('operator')) {
      setOperator(buttonValue);
      return;
    }

    if (action === 'clear') {
      clearCalculator();
      return;
    }

    if (action === 'delete') {
      deleteLastCharacter();
      return;
    }

    if (action === 'equals') {
      evaluateExpression();
    }
  });
});

updateDisplay(currentInput);
