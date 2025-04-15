import request from 'umi-request'

export const searchPipelineApi = (id) => {
  return request(`/api/pipeline/config/${id}`, {
    method: 'get',
  })
}


export const triggerPipelineApi = (id, data) => {
  return request(`/api/pipeline/config/${id}/trigger`, {
    method: 'post',
    data
  })
}

// 查询流水线某个历史版本的配置Json
export const getPiplineJsonApi = (uuid, version) => {
  return request(`/api/pipeline/config/${uuid}/json/${version}`, {
    method: 'get',
  })
}