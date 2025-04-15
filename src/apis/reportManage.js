import { request } from '@/utils/request';

// 象限查询
export async function quadrantList(params, options) {
  return request('/api/reports/quadrantList', {
    method: 'GET',
  });
}

// 项目查询
export async function projectList(params, options) {
  return request('/api/reports/projectList', {
    method: 'GET',
  });
}

// 周报记录
export async function reportsHistory(params, options) {
  return request('/api/reports/history', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 周报详情
export async function reportDetail(params, options) {
  return request('/api/reports/detail', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 新建周报
export async function createReport(data, options) {
  return request('/api/reports/create', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 周报编辑
export async function editReport(data, options) {
  return request('/api/reports/edit', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 获取周的列表，有周次状态的信息   从今天的周开始，往前十周
export async function weekList(params, options) {
  return request('/api/reports/weekList', {
    method: 'GET',
  });
}

// 所有周次
export async function week_list(params, options) {
  return request('/api/reports/week_list_include_this_week', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 个人周报 获取上一周 下一周的周报
export async function week_list_by_user(params, options) {
  return request('/api/reports/week_list_include_this_week_by_user', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 单个周报条目的新建
export async function createReportItem(data, options) {
  return request('/api/reports/item/create', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 单个周报条目的编辑
export async function editReportItem(data, options) {
  return request('/api/reports/item/edit', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 周报状态更改   "draft", "submitted", "reviewed"，"recalling"
export async function changeReportStatus(data, options) {
  return request('/api/reports/status', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 周报打回
export async function rejectReport(data, options) {
  return request('/api/reports/reject', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 周报再次分享
export async function shareReport(data, options) {
  return request('/api/reports/share', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 批量修改周报状态更改   "draft", "submitted", "reviewed"，"recalling"
export async function batchChangeStatus(data, options) {
  return request('/api/reports/batch_status', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 周报删除
export async function delReport(data, options) {
  return request('/api/reports/delete', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 周报条目删除
export async function delItem(data, options) {
  return request('/api/reports/item/delete', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 周报导入
export async function importReports(data, options) {
  return request('/api/reports/import', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

/********************************** 汇报关系 **********************************/
// 汇报关系 查是否已经有汇报关系
export async function reportsRelation(params, options) {
  return request('/api/reports/relation', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 模糊查询汇报列表
export async function relationFindUser(params, options) {
  return request('/api/devices/info/find_user', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 新增汇报关系
export async function relationCreate(data, options) {
  return request('/api/reports/relation/create', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 编辑汇报关系
export async function relationUpdate(data, options) {
  return request('/api/reports/relation/update', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 计算统计投入百分比effort_rate
export async function countRate(params, options) {
  return request('/api/reports/effort_rate', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 修改投入百分比effort_rate
export async function updateRate(data, options) {
  return request('/api/reports/update_effort_rate', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 周报提交前检验 提醒
export async function submitCheck(data, options) {
  return request('/api/reports/submit_check', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

/********************************** 团队周报 **********************************/
// 是否是team manager
export async function teamManager(params, options) {
  return request('/api/reports/team_manager', {
    method: 'GET',
  });
}

// 团队周报汇总
export async function summaryReports(params, options) {
  return request('/api/reports/merge', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 团队周报记录
export async function teamReportsHistory(params, options) {
  return request('/api/reports/team_reports_list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 团队周报 - 提醒时间列表
export async function crons(params, options) {
  return request('/api/reports/remind/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 团队周报 - 提醒时间保存
export async function cronsSave(data, options) {
  return request('/api/reports/remind/save', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 我的订阅
export async function getSubscription(params, options) {
  return request('/api/reports/subscribe/query', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 团队周报详情
export async function teamReportDetail(params, options) {
  return request('/api/reports/team_reports_detail', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 分享周报记录
export async function sharedHistory(params, options) {
  return request('/api/reports/shared_reports_list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 分享周报记录详情
export async function sharedDetail(params, options) {
  return request('/api/reports/shared_reports_detail', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 根据用户查询单个周报记录
export async function detailUser(params, options) {
  return request('/api/reports/detailUser', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getSubscripedetail(params, options) {
  return request('/api/reports/subscribe/queryDetailUser', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function getTeamSubscripedetail(params, options) {
  return request('/api/reports/subscribe/queryDetailWeek', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 查询他人周报
export async function detailUserNoVerify(params, options) {
  return request('/api/reports/detailUserNoVerify', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 分享周报 更改为已审阅
export async function reportsReview(data, options) {
  return request('/api/reports/review', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 查询周报状态
export async function statusQuery(params, options) {
  return request('/api/reports/status_query', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 团队周报汇总
export async function teamReportMerge(params, options) {
  return request('/api/reports/merge', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 汇总并编辑
export async function mergeReport(data, options) {
  return request('/api/reports/merge_reports', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 模糊查询项目列表
export async function findProject(params, options) {
  return request('/api/reports/projects/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 模糊查询组件列表
export async function findComponent(params, options) {
  return request('/api/reports/component/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 模糊查询组件列表
export async function findProduct(params, options) {
  return request('/api/reports/product/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 获取有周报的周次
export async function importWeekList(params, options) {
  return request('/api/reports/writed_week_list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

// 发送周报提醒
export async function remind(data, options) {
  return request('/api/reports/remind', {
    data,
    method: 'post',
    ...(options || {}),
  });
}

// 获取pms项目
export async function PMSList(params, options) {
  return request('/api/reports/pms/pms_list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
