import request from 'umi-request'


export const getHistoryApi = (params) => {
  return request('/api/reports/release_history', {
    method: 'get',
    params
  })
}