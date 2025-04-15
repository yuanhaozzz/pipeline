import request from 'umi-request'


export const reviewStateApi = (data, id) => {
  return request(`/api/pipeline/internal_atom/${id}/manual_confirm`, {
    method: 'post',
    data
  })
}


export const getReviewInfoApi = (params, id) => {
  return request(`/api/pipeline/internal_atom/${id}/get_approve_info_by_userid`, {
    method: 'get',
    params
  })
}

export const getPipelineConfigApi = (uuid) => {
  return request(`/api/pipeline/config/${uuid}`, {
    method: 'get',
  })
}