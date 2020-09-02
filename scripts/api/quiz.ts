import { BASE_URL } from './settings.js';
import { getData, postData } from './utils.js';
import Quiz from '../types/quiz.js';
import Question from '../types/question.js';
import Answer from '../types/answer.js';

const QUIZ_URL = `${BASE_URL}/quiz`;

export async function getAllQuizes(): Promise<Pick<Quiz, "id" | "name">[]> {
  return getData(QUIZ_URL);
}

export async function getQuiz(id: number): Promise<Omit<Quiz, 'questions'> & { questions: Omit<Question, 'answer'>[] }> {
  return getData(`${QUIZ_URL}/${id}`);
}

export async function finishQuiz(id: number, answers: Pick<Answer, 'id' | 'time' | 'answer'>[]) {
  return postData(`${QUIZ_URL}/${id}`, answers);
}