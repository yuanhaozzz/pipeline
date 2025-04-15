import { request } from '@/utils/request';

/********************************** 周报汇总 **********************************/
// 获取要汇报的条目列表
export async function mergeList(params, options) {
  return request('/api/reports/item/merge_list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 汇报条目的内容
export async function itemMerge(data, options) {
  return request('/api/reports/item/merge', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 单个审阅
export async function itemReview(data, options) {
  return request('/api/reports/reviewed_by_item', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 批量审阅
export async function batchChangeStatus(data, options) {
  return request('/api/reports/reviewed_by_item_batch', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 单个周报条目的新建
export async function createEditItem(data, options) {
  return request('/api/reports/item/create_or_edit', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 周报汇总--待汇总条目的项目列表（项目+组件一并返回）
export async function projectList(params, options) {
  return request('/api/reports/item/merge_project_list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 周报汇总--待汇总条目的人员列表
export async function memberList(params, options) {
  return request('/api/reports/item/merge_member_list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}