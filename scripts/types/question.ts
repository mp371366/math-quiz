import { isNumber, isString } from './utils.js';

export interface QuestionInfo {
  id: number
  quiz: number;
  expression: string;
  penalty: number;
}

export function isQuestionInfo(data: any): data is QuestionInfo {
  return data
    && isNumber(data.id)
    && isNumber(data.quiz)
    && isString(data.expression)
    && isNumber(data.penalty);
}

export default interface Question extends QuestionInfo {
  answer: number;
}

export function isQuestion(data: any): data is Question {
  return data
    && isNumber(data.answer)
    && isQuestionInfo(data);
}