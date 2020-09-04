import Question, { isQuestion } from './question.js';
import { isNumber, isString, isArray } from './utils.js';

export interface QuizBasicInfo {
  id: number;
  name: string;
}

export function isQuizBasicInfo(data: any): data is QuizBasicInfo {
  return data
    && isNumber(data.id)
    && isString(data.name);
}

export interface QuizInfo extends QuizBasicInfo {
  intro: string;
}

export function isQuizInfo(data: any): data is QuizInfo {
  return data
    && isString(data.intro)
    && isQuizBasicInfo(data);
}


export default interface Quiz extends QuizInfo {
  questions: Question[];
}

export function isQuiz(data: any): data is Quiz {
  return data
    && isArray(data.questions, isQuestion)
    && isQuizInfo(data);
}