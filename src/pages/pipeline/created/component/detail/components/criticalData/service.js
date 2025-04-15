import request from '@/utils/request'

export const summarizedApi = (id, params) => {
  return request(`/api/pipeline/output/variables/summarized/`, {
    method: 'get',
    params
  })
}

export const getCommentListApi = (params, id) => {
  return request(`/api/pipeline/internal_atom/pipeline_run_info/${id}/comments`, {
    method: 'get',
    params
  })
}
