import request from 'umi-request'

// 查询流水线某个历史版本的配置Json
export const getJsonDiffApi = (uuid, version) => {
  return request(`/api/pipeline/config/${uuid}/json/${version}`, {
    method: 'get',
  })
}