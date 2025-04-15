// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

export async function getWeekList() {
  return request('/api/reports/newweekList', {
    method: 'get',
  });
}





