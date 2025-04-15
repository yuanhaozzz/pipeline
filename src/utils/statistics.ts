// @ts-ignore
/* eslint-disable */
import request from 'umi-request';

import { getBrowserInfo, browserRedirect } from '@/utils'

const { type, versions } = getBrowserInfo()

interface SetStatisticsParams {
  page_path?: string;
  button_id?: string;
  redirect_url?: string;
  action_type?: any
}

const commonParams = {
  // windows，linux，MacOS
  client_platform: browserRedirect(),
  // 浏览器信息等，chrome, firefox, Edge 加版本号
  client_info: type + '-' + versions,
  // 点的按钮，名字
  button_id: '',
  // 跳转链接
  redirect_url: '',
  // 页面，按钮，链接，api
  action_type: 'page'
}

const filterpath = (): string => {
  let path = window.location.pathname
  const lastValue = path[path.length - 1]
  if (lastValue === '/') {
    path = path.slice(0, path.length - 1)
  }
  return path
}

// 设置埋点
export async function setStatistics(params: SetStatisticsParams) {
  // 页面路径
  params.page_path = filterpath()
  return request('/api/viewscount/page_view', {
    method: 'post',
    data: { ...commonParams, ...params }
  });
}

// 获取埋点
export async function getStatistics() {
  return request('/api/viewscount/query_pv', {
    method: 'get',
    params: {
      page_path: filterpath(),
    }
  });
}
