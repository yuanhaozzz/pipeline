import request from 'umi-request'

// 查询流水线历史所有版本列表
export const getListApi = (uuid, params) => {
  return request(`/api/pipeline/config/${uuid}/history`, {
    method: 'get',
    params
  })
}

// 查询流水线某个历史版本的配置Json
export const getJsonDiffApi = (uuid, version) => {
  return request(`/api/pipeline/config/${uuid}/json/${version}`, {
    method: 'get',
  })
}

// 将某一次流水线编辑记录恢复为最新配置（restore）
export const getRestoreApi = (uuid, version) => {
  return request(`/api/pipeline/config/${uuid}/restore/${version}`, {
    method: 'post',
  })
}