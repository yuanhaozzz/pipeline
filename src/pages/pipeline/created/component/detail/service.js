import request from '@/utils/request'

export const pipelineDetailApi = (id, params) => {
  return request(`/api/pipeline/config/${id}`, {
    method: 'get',
    params
  })
}

export const pipelineRunDetailApi = (id) => {
  return request(`/api/pipeline/pipeline_run_info/${id}`, {
    method: 'get',
  })
}

export const getNewDetailApi = (id, params) => {
  return request(`/api/pipeline/pipeline_run_info/${id}/detail`, {
    method: 'get',
    params
  })
}

export const getPipelineStatusApi = (id) => {
  return request(`/api/pipeline/pipeline_run_info/${id}/state`, {
    method: 'get',
  })
}

export const triggerPipelineApi = (id, data) => {
  return request(`/api/pipeline/config/${id}/trigger`, {
    method: 'post',
    data
  })
}

export const cancelAllJobApi = (id) => {
  return request(`/api/pipeline/pipeline_run_info/${id}/cancel`, {
    method: 'post',
  })
}

export const pipelineConfigDetailApi = (pId, params) => {
  return request(`/api/pipeline/${pId}/builds/detail`, {
    method: 'get',
    params
  })
}