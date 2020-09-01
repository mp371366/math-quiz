import { isNumber, isString } from '../utils.js';

export default interface Question {
  id: number
  quiz: number;
  expression: string;
  answer: number;
  penalty: number;
}

export function isQuestion(data: any): data is Question {
  return data
    && isNumber(data.id)
    && isNumber(data.quiz)
    && isString(data.expression)
    && isNumber(data.answer)
    && isNumber(data.penalty);
}