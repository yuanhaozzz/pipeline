import request from 'umi-request'


export const getListApi = (params) => {
  return request('/api/pipeline/config/list', {
    method: 'get',
    params
  })
}

export const getListRecordApi = (params) => {
  return request('/api/pipeline/pipeline_run_info/list', {
    method: 'get',
    params
  })
}


export const getPipelineDetailDownloadApi = (id, params) => {
  return request(`/api/pipeline/pipeline_run_info/${id}/artifacts`, {
    method: 'get',
    params
  })
}
