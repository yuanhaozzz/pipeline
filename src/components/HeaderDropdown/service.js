import request from 'umi-request'


export const showLog = () => {
  return request('/api/reports/popup_release_history', {
    method: 'get',
  })
}