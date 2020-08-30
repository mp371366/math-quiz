import { driver } from 'mocha-webdriver';
import { User } from '../types';

const BASE_URL = 'http://localhost:3000';
const LOGIN_URL = `${BASE_URL}/login`;
const CHANGE_PASSWORD_URL = `${BASE_URL}/change-password`;

describe('Login', () => {
  async function login({ username, password }: User = { username: 'user1', password: 'user1' }) {
    await driver.get(LOGIN_URL);
    await driver.find('input[name="username"').sendKeys(username);
    await driver.find('input[name="password"').sendKeys(password);
    await driver.find('#login-button').doClick();
    return driver.manage().getCookie('connect.sid');
  }

  async function changePassword(newPassword: string) {
    await driver.get(CHANGE_PASSWORD_URL);
    await driver.find('#new-password').sendKeys(newPassword);
    await driver.find('#password-repeat').sendKeys(newPassword);
    await driver.find('#change-password-button').doClick();
  }

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
})