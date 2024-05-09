// Listen for a message from the popup
console.log('autofill.js loaded');
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'autofill' && message.data) {
    console.log('calling autofill');
    setInputValues(message.data);
  }
});

const INPUT_TYPES = Object.freeze({
  radio: 'radio',
  select: 'select',
  textarea: 'textarea',
  checkbox: 'checkbox',
});

function setInputValues(storedInputs) {
  const inputsElements = getInputElements();
  for (const inputElement of inputsElements) {
    const { name } = inputElement;
    let foundValue= storedInputs[0][`${name}`]
      if (foundValue !== null) {
        setValue(inputElement, foundValue);
      }
  }
}
function getFoundValue(input, inputElement) {
  const { value: defaultValue, values: valuesByRules } = input;
  let finalValue = defaultValue;
  valuesByRules?.forEach(rule => {
    const { value, isRuleMatched } = checkIsRuleMatched(rule, inputElement);
    if (isRuleMatched) {
      finalValue = value;
    }
  });

  return finalValue;
}

function checkIsRuleMatched(rule, inputElement) {
  const { value, url, className, id } = rule;
  const { location } = window;

  const currentPageURL = location.hostname + location.pathname;
  let isRuleMatched = false;
  if (url === currentPageURL) {
    isRuleMatched = true;
  } // Additional checks for className and id can be implemented here

  return {
    isRuleMatched,
    value,
  };
}

function setValue(inputElement, value) {
  const { type } = inputElement;
  switch (type) {
    case INPUT_TYPES.radio:
      setRadioInputValue(inputElement, value);
      break;
    case INPUT_TYPES.textarea:
      setTextareaValue(inputElement, value);
      break;
    case INPUT_TYPES.checkbox:
      setCheckboxValue(inputElement, value);
      break;
    default:
      inputElement.value = value;
  }
}

function setRadioInputValue(inputElement, value) {
  inputElement.checked = inputElement.value === value;
}

function setTextareaValue(inputElement, value) {
  inputElement.value = value.replace(/\\n/g, '\n');
}

function setCheckboxValue(inputElement, value) {
  inputElement.checked = value === '1' ? true : false;
}

function getInputElements() {
  return [...document.querySelectorAll('input, select, textarea')];
}
