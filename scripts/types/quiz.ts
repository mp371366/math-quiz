import Question, { isQuestion } from './question.js';
import { isNumber, isString } from '../utils.js';

export default interface Quiz {
  id: number;
  name: string;
  intro: string;
  questions: Question[];
}

export function isQuiz(data: any): data is Quiz {
  return data
    && isNumber(data.id)
    && isString(data.intro)
    && data.questions !== undefined
    && Object.entries(data.questions).every(([key, value]) => {
      return isNumber(key) && isQuestion(value);
    });
}