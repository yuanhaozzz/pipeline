import request from 'umi-request'


export const searchPipelineApi = (id, params) => {
  return request(`/api/pipeline/config/${id}`, {
    method: 'get',
    params
  })
}


export const triggerPipelineApi = (id, data) => {
  return request(`/api/pipeline/config/${id}/trigger`, {
    method: 'post',
    data
  })
}