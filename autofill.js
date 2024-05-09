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
  var  fillingEndAt = 0;
  for (const inputElement of inputsElements) {
    if ( fillingEndAt < 17) {
      console.log( fillingEndAt);
      const { name } = inputElement;
      let foundValue = storedInputs[0][`${name}`];
      if (foundValue !== null) {
        setValue(inputElement, foundValue);
      }
    }
     fillingEndAt += 1;
  }
}

function triggerEvent(element, eventName) {
  if ('createEvent' in document) {
    var event = document.createEvent('HTMLEvents');
    event.initEvent(eventName, false, true);
    element.dispatchEvent(event);
  } else {
    element.fireEvent('on' + eventName);
  }
}

function waitForAsyncOperations(callback) {
  setTimeout(callback, 1000); // Wait for 1 second before proceeding
}

function setValue(inputElement, value) {
  const { type } = inputElement;
  switch (type) {
    case INPUT_TYPES.radio:
      setRadioInputValue(inputElement, value);
      triggerEvent(inputElement, 'change');
      break;
    case INPUT_TYPES.textarea:
      setTextareaValue(inputElement, value);
      triggerEvent(inputElement, 'input');
      break;
    case INPUT_TYPES.checkbox:
      setCheckboxValue(inputElement, value);
      triggerEvent(inputElement, 'change');
      break;
    default:
      inputElement.value = value;
      triggerEvent(inputElement, 'input');
  }
}

function setRadioInputValue(inputElement, value) {
  const radioButtons = document.getElementsByName(inputElement.name);
  if (value) {
    radioButtons[0].checked = true;
  } else {
    radioButtons[1].checked = true;
  }
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

// Example form submission function
function submitForm() {
  // Your form submission logic here

  // Example: submit the form after waiting for async operations
  waitForAsyncOperations(() => {
    document.getElementById('your-form-id').submit();
  });
}
