import request from 'umi-request'


export const cancelJobApi = (id) => {
  return request(`/api/pipeline/job_run_info/${id}/cancel`, {
    method: 'post',
  })
}

export const cancelAllJobApi = (id) => {
  return request(`/api/pipeline/pipeline_run_info/${id}/cancel`, {
    method: 'post',
  })
}