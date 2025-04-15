import request from 'umi-request'


export const getListApi = (params) => {
  return request('/api/test', {
    method: 'get',
    params
  })
}