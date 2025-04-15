import request from 'umi-request'


export const send = (params) => {
  return request('/api/test', {
    method: 'get',
    params
  })
}

export const uploadFile = (data) => {
  return request('/api/reports/file_uploader', {
    method: 'post',
    data
  })
}