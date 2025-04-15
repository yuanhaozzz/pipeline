import request from 'umi-request'



export const getReviewInfoApi = (params, id) => {
  return request(`/api/pipeline/internal_atom/${id}/get_approve_info_by_userid`, {
    method: 'get',
    params
  })


}

export const reviewStateApi = (data, id) => {
  return request(`/api/pipeline/internal_atom/${id}/manual_confirm`, {
    method: 'post',
    data
  })
}

