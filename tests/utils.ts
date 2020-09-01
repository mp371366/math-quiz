import { driver } from 'mocha-webdriver';
import { User } from '../scripts/types';

export const BASE_URL = 'http://localhost:3000';
export const LOGIN_URL = `${BASE_URL}/login`;
export const CHANGE_PASSWORD_URL = `${BASE_URL}/change-password`;

export async function login({ username, password }: User = { username: 'user1', password: 'user1' }) {
  await driver.get(LOGIN_URL);
  await driver.find('input[name="username"').sendKeys(username);
  await driver.find('input[name="password"').sendKeys(password);
  await driver.find('#login-button').doClick();
  return driver.manage().getCookie('connect.sid');
}

export async function changePassword(newPassword: string) {
  await driver.get(CHANGE_PASSWORD_URL);
  await driver.find('#new-password').sendKeys(newPassword);
  await driver.find('#password-repeat').sendKeys(newPassword);
  await driver.find('#change-password-button').doClick();
}