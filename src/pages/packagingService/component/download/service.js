import request from 'umi-request'


export const pipelineDetailDownloadApi = (id, params) => {
  return request(`/api/pipeline/pipeline_run_info/${id}/artifacts`, {
    method: 'get',
    params
  })
}
