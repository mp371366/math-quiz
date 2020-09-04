import { idSelector } from './dom.js';

(() => {
  const changePasswordButton = idSelector('change-password-button');
  const form = document.forms[0];
  const newPasswordElement = idSelector<HTMLInputElement>('new-password');
  const repeatPasswordElement = idSelector<HTMLInputElement>('password-repeat');
  const errorElement = idSelector('error');

  function tryChangePassword() {
    if (form.reportValidity()) {
      if (newPasswordElement.value !== repeatPasswordElement.value) {
        errorElement.innerText = 'Passwords do not match each other.';
      } else {
        form.submit();
      }
    }
  }

  form.onsubmit = (event) => {
    event.preventDefault();

    tryChangePassword();
  }

  changePasswordButton.onclick = () => {
    tryChangePassword();
  };
})();