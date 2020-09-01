import { isNumber } from '../utils.js';
import Question, { isQuestion } from './question.js';

export default interface Answer extends Question {
  time: number;
};

export function isAnswers(data: any): data is Answer[] {
  return data && data.every(isAnswer);
}

export function isAnswer(data: any): data is Answer {
  return data
    && isNumber(data.time)
    && isQuestion(data);
}