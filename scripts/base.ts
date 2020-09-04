import { idSelector } from './dom.js';

(() => {
  const logoutElement = idSelector('logout');
  const logoutFormElement = idSelector<HTMLFormElement>('logout-form');

  const menuElement = idSelector('main-menu');
  menuElement.onclick = () => {
    menuElement.classList.add('menu-hide');
  };

  const sidebarElement = idSelector('sidebar');
  sidebarElement.onclick = (event) => {
    event.stopPropagation();
  };

  const menuOpenButtonElement = idSelector('menu-bars');
  menuOpenButtonElement.onclick = () => {
    menuElement.classList.remove('menu-hide');
  };

  const menuCloseButtonElement = idSelector('close-menu');
  menuCloseButtonElement.onclick = () => {
    menuElement.classList.add('menu-hide');
  };

  if (logoutElement) {
    logoutElement.onclick = () => {
      logoutFormElement.submit();
    };
  }
})();