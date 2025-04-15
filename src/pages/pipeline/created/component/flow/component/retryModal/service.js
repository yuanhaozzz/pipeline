import request from 'umi-request'


export const retryAllApi = (id, data = {}) => {
  return request(`/api/pipeline/stage_run_info/${id}/retry`, {
    method: 'post',
    data
  })
}

export const retryFailedApi = (id, data = {}) => {
  return request(`/api/pipeline/stage_run_info/${id}/retry_failed_jobs`, {
    method: 'post',
    data
  })
}


export const retryJobApi = (id, data) => {
  return request(`/api/pipeline/job_run_info/${id}/retry`, {
    method: 'post',
    data
  })
}