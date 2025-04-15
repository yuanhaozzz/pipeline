import request from '@/utils/request'


export const send = (params) => {
  return request('/api/test', {
    method: 'get',
    params
  })
}