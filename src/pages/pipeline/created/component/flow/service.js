import request from 'umi-request'


export const skipJobApi = (id) => {
  return request(`/api/pipeline/job_run_info/${id}/skip`, {
    method: 'post',
  })
}

export const triggerJobApi = (id) => {
  return request(`/api/pipeline/job_run_info/${id}/trigger`, {
    method: 'post',
  })
}