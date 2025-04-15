import request from 'umi-request'



export const getPipelineDetailApi = (id) => {
  return request(`/api/pipeline/config/${id}`, {
    method: 'get',
  })
}

export const triggerApi = (id, data) => {
  return request(`/api/pipeline/config/${id}/trigger`, {
    method: 'post',
    data
  })
}