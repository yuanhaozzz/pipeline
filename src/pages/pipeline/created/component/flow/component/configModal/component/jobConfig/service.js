import request from 'umi-request'


export const send = (params) => {
  return request('/api/test', {
    method: 'get',
    params
  })
}

// 查询所有类型
export const runnerTypeApi = (params) => {
  return request('/api/pipeline/runner/type', {
    method: 'get',
    params
  })
}

export const getTagApi = (params) => {
  return request('/api/pipeline/runner/tags', {
    method: 'get',
    params
  })
}

export const getTemplateListApi = (params) => {
  return request('/api/pipeline/openstack_templates/list', {
    method: 'get',
    params
  })
}