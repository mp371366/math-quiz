import { driver, until } from 'mocha-webdriver';
import { login, BASE_URL } from './utils';
import { expect } from 'chai';
import { finishQuiz } from '../scripts/api/quiz';

describe('Quiz', () => {
  const id = 1;

  async function getQuiz() {
    await driver.get(`${BASE_URL}/quiz/${id}`);
    await driver.find('.spinner')
      .then((spinner) => driver.wait(until.elementIsNotVisible(spinner)))
      .catch(() => null);
  }

  it('should not allow submit quiz second time', async function () {
    this.timeout(20000);
    await login();
    await getQuiz();
    for (const answer of [4, 0]) {
      await driver.find('#answer').doSendKeys(answer.toString());
      await driver.find('#next').doClick();
    }
    await driver.find('#finish').doClick();
    await driver.find('#confirm').doClick();
    await getQuiz();
    expect((await driver.findAll('#answer')).length).to.equal(0);
    const answers = [
      { id, time: 1, answer: 1 },
      { id, time: 1, answer: 1 },
    ];
    expect(await finishQuiz(id, answers)
      .then(() => false)
      .catch(() => true)).to.be.true;
  });
});