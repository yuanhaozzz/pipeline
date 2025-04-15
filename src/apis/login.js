import { request } from '@/utils/request';

/** 登录接口  */
export async function login(body, options) {
  return request('/api/login/', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

/** 退出登录接口  */
export async function logout(body, options) {
  return request('/api/logout/', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

/** 获取当前的用户 */
export async function queryCurrentUser(options) {
  return request('/api/system/user/user_info/', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 公告信息 */
export async function notification(options) {
  return request('/api/users/notification', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 用于前端获取当前角色的路由配置，包含按钮权限父子菜单关系，按钮权限按树状数据返回 */
export async function getMenu(params) {
  return request('/api/system/menu/ext_web_router/', {
    method: 'GET',
    params: {
      ...params,
    },
  });
}