import request from 'umi-request'



export const getReviewInfoApi = (params, id) => {
  return request(`/api/pipeline/internal_atom/${id}/get_approve_info_by_userid`, {
    method: 'get',
    params
  })
}

export const getCommentApi = (params, id) => {
  return request(`/api/pipeline/internal_atom/${id}/comments`, {
    method: 'get',
    params
  })
}

export const submitCommentApi = (data, id) => {
  return request(`/api/pipeline/internal_atom/${id}/comments`, {
    method: 'post',
    data
  })
}

export const setRunVarApi = (data, id) => {
  return request(`/api/pipeline/task_run_info/${id}/variables_list`, {
    method: 'post',
    data
  })
}

export const getRunVarApi = (params, id) => {
  return request(`/api/pipeline/task_run_info/${id}/variables_list`, {
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

export const setDelayDateApi = (data, id) => {
  return request(`/api/pipeline/internal_atom/${id}/delay`, {
    method: 'post',
    data
  })
}

export const getVarContentApi = (params, id) => {
  return request(`/api/pipeline/task_run_info/${id}/query_var_via_key`, {
    method: 'get',
    params
  })
}
