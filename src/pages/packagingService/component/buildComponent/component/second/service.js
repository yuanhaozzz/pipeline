import request from 'umi-request'


export const getCommonPresetsApi = (params) => {
  return request('/api/pipeline/build_service/common_presets', {
    method: 'get',
    params
  })
}

export const getSearchpresetsApi = (params) => {
  return request('/api/pipeline/build_service/presets', {
    method: 'get',
    params
  })
}