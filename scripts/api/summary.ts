import { BASE_URL } from './settings.js';
import { getData } from './utils.js';
import { FullAnswer, TopResult } from '../types/summary.js';

const SUMMARY_URL = `${BASE_URL}/summary`;

export async function getSummary(id: number): Promise<FullAnswer[]> {
  return getData(`${SUMMARY_URL}/${id}`);
}

export async function getTop(id: number): Promise<TopResult[]> {
  return getData(`${SUMMARY_URL}/top/${id}`);
}