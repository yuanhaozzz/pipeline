
import { getMenu } from '@/apis/login';
import { message, } from 'antd';
import { getCookie, getUrlParams } from '@/utils';
import { HomeOutlined, FolderOutlined, DashboardOutlined, ProfileOutlined, SmileOutlined, AppstoreOutlined, SafetyCertificateOutlined, KeyOutlined, NodeExpandOutlined, } from '@ant-design/icons';
const loginPath = '/user/login';
let menuData = {
  originRoutes: [],
  flatRoutes: [],
};

export const fetchMenuData = async () => {
  let _token = getCookie('token');
  if (!_token) return;
  const { search, pathname } = window.location;
  try {
    const res = await getMenu();
    const { success = false, data = [] } = res || {};
    const _data = data || [];
    menuData = {
      originRoutes: getRouterMenu(_data),
      flatRoutes: flatAllRoutes(_data),
    }
    return menuData;
  } catch (error) {
    history.replace({
      pathname: loginPath,
      search: stringify({
        redirect: pathname + search,
      }),
    });
  }
  return {};
};

export const flatAllRoutes = (routes) => {
  routes = !!routes && Array.isArray(routes) ? routes : [routes];
  let list = [];
  routes.forEach(item => {
    list.push(item);
    if (item?.routes?.length > 0) {
      list.push.apply(list, flatAllRoutes(item?.routes));
    }
  });
  return list || [];
};

const IconMap = {
  home: <HomeOutlined />,
  folder: <FolderOutlined />,
  dashboard: <DashboardOutlined />,
  profile: <ProfileOutlined />,
  smile: <SmileOutlined />,
  appstore: <AppstoreOutlined />,
  safetyCertificate: <SafetyCertificateOutlined />,
  'node-expand': <NodeExpandOutlined />,
  key: <KeyOutlined />,
};

const generateMenu = (item) => {
  const menu = {
    ...item,
    icon: (item?.icon && IconMap[item.icon]) || '',
  };
  return menu;
};

const getRouterMenu = (data) => {
  let RouterMenus = [];
  if (data && data.length > 0) {
    data.forEach((item) => {
      const parent = generateMenu(item);
      // let routes = [];
      // if (item.routes) {
      //   routes = getRouterMenu(item.routes);
      // }
      // if (routes.length > 0) {
      //   parent.routes = routes;
      // }
      RouterMenus.push(parent);
    });
  }
  return RouterMenus || [];
};

export const checkAuthority = (code, path = '') => {
  path = path || window.location.pathname;
  // 动态路由特殊处理
  const prefixPath = path.split('/').slice(0, 4).join('/')
  switch (prefixPath) {
    case '/FlowLine/created/detail':
    case '/workflowService/created/detail':
      path = prefixPath
      break
  }
  const permission = menuData.flatRoutes.find(item => (path === item?.path) || (path === item?.path + '/'));
  const { permissions = [] } = permission || {};
  return permissions?.includes(code);
}

export const checkPipilineAuth = (code, id, type) => {
  let path = window.location.pathname;
  // const prefix = path.split('/')[1]
  // 只做流程服务的权限
  // if (prefix !== 'workflowService') {
  //   return true
  // }
  // 流水线uuid
  const { pipelineId, uuid: urlUUID } = getUrlParams()
  let uuid = id || pipelineId || urlUUID
  // 特殊流水线uuid在path中
  const prefixPath = path.split('/').slice(0, 4).join('/')
  switch (prefixPath) {
    case '/FlowLine/created/detail':
    case '/workflowService/created/detail':
      uuid = path.split('/')[4]
      path = prefixPath
      break
  }

  let permission = menuData.flatRoutes.find(item => (path === item?.path) || (path === item?.path + '/'));
  let { permissions = [], scope = [] } = permission || {};
  // all 则直接返回全部权限
  if (scope === '__all__') {
    return true
  }

  scope = scope || []

  // 当前流水线权限
  let currentPipeline = scope.find(item => item.scope === uuid) || { permissions: [] }

  // 流水线页面没有 uuid 的从路由中找
  if (type === 'menu') {
    currentPipeline = { permissions }
  }

  // 路由中包含则返回全部权限
  if (currentPipeline.permissions === '__all__') {
    return true
  }

  const isCheck = currentPipeline.permissions?.includes(code);
  return isCheck
}