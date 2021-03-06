import { idSelector } from './dom.js';

(() => {
  const loginButton = idSelector('login-button');
  const form = document.forms[0];

  loginButton.onclick = () => {
    if (form.reportValidity()) {
      form.submit();
    }
  };
})();