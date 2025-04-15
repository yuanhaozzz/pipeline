import request from 'umi-request'


export const addApi = (data) => {
  return request('/api/pipeline/config/add', {
    method: 'post',
    data
  })
}