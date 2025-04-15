import request from 'umi-request'


export const getListApi = (params) => {
  return request('/api/pipeline/credential/list', {
    method: 'get',
    params
  })
}

export const removeApi = (id) => {
  return request(`/api/pipeline/credential/${id}/delete`, {
    method: 'post',
  })
}