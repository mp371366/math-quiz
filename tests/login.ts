import { driver } from 'mocha-webdriver';
import { login, changePassword, CHANGE_PASSWORD_URL } from './utils';

describe('Login', () => {
  it('should destroy all user\'s sessions when change password', async function () {
    this.timeout(20000);
    const cookie = await login();
    await driver.manage().deleteCookie('connect.sid');
    await login();
    await changePassword('user1');
    await driver.manage().deleteCookie('connect.sid');
    await driver.get(CHANGE_PASSWORD_URL);
    await driver.manage().addCookie(cookie);
    await driver.find('form[action="/login"');
  });
});