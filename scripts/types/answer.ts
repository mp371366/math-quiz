import { isNumber } from './utils.js';
import Question, { isQuestion } from './question.js';

export default interface Answer extends Question {
  time: number;
};

export function isAnswer(data: any): data is Answer {
  return data
    && isNumber(data.time)
    && isQuestion(data);
}

export type AnswerInfo = Pick<Answer, 'id' | 'time' | 'answer'>;

export function isAnswerInfo(data: any): data is AnswerInfo {
  return data
    && isNumber(data.id)
    && isNumber(data.time)
    && isNumber(data.answer);
}

export type MaybeAnswer = Omit<Answer, 'answer'> & { answer: number | undefined };