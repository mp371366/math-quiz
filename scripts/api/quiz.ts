import { BASE_URL } from './settings.js';
import { getData, postData } from './utils.js';
import * as base from '../base/quiz';
import { Quiz, Question } from '../types';

const QUIZ_URL = `${BASE_URL}/quiz`;

export async function getAllQuizes(): Promise<Pick<Quiz, "id" | "name">[]> {
  return getData(QUIZ_URL);
}

export async function getQuiz(id: number): Promise<Omit<Quiz, 'questions'> & { questions: Omit<Question, 'answer'>[] }> {
  return getData(`${QUIZ_URL}/${id}`);
}

export async function finishQuiz(id: number, answers: Parameters<typeof base.finishQuiz>[2]) {
  return postData(`${QUIZ_URL}/${id}`, answers);
}