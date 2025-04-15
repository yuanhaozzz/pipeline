import request from '@/utils/request'

export const pipelineDetailDownloadApi = (id, params) => {
  return request(`/api/pipeline/pipeline_run_info/${id}/artifacts`, {
    method: 'get',
    params
  })
}
