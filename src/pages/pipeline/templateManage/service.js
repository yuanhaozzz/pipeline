import request from 'umi-request';

export const getListApi = (params) => {
  return request('/api/pipeline/config/list', {
    method: 'get',
    params
  })
}