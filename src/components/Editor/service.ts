import request from 'umi-request';
import { request as utilsRequest } from '@/utils/request';

const { CancelToken } = request;

export const cancelTokenSource = CancelToken.source();

export const getTableTemplate = () => {
  return request('/api/reports/template', {
    method: 'get',
  })
}

export const uploadFile = (data: any) => {
  return request('/api/reports/file_uploader', {
    method: 'post',
    data,
    timeout: 30000,
    // cancelToken: cancelTokenSource.token, // 设置取消
  })
}

export const getDefaultTemplate = (params: any) => {
  return utilsRequest('/api/reports/template/default', {
    method: 'get',
    params
  })
}