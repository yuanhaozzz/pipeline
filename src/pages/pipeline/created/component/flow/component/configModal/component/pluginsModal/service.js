import request from 'umi-request'


export const getListApi = (params) => {
  return request('/api/pipeline/atom/list', {
    method: 'get',
    params
  })
}