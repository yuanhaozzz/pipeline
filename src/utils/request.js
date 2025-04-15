import { extend } from 'umi-request';
import { addCookie, getCookie, deleteCookie } from '@/utils';
import { history } from 'umi';
import { stringify } from 'querystring';
import { refreshToken } from './token';
import { message } from 'antd';

const codeMessage = {
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作',
  401: '用户没有权限（令牌、用户名、密码错误）',
  403: '用户得到授权，但是访问是被禁止的',
  404: '接口资源不存在',
  406: '请求的格式不可得',
  410: '请求的资源被永久删除，且不会再得到的',
  422: '当创建一个对象时，发生一个验证错误',
  500: '服务器发生错误，请检查服务器',
  502: '网关错误',
  503: '服务不可用，服务器暂时过载或维护',
  504: '网关超时',
};
let curUrl = '';
const loginPath = '/user/login';
const { pathname } = window.location;

/** 异常处理程序 */
const errorHandler = error => {
  const { response } = error;
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    message.destroy();
    message.warn(`请求错误${status}: ${url}, ${errorText}`, 2);
  }

  return response;
};

const toLoginPage = () => {
  // localStorage.clear();
  deleteCookie('token');
  const { query = {}, search, pathname } = history.location;
  history.replace({
    pathname: '/user/login',
    search: stringify({
      redirect: pathname + search,
    }),
  });
}

const showLoginDlg = () => {
  if (!document.querySelector('.common-login-dlg-show') && document.querySelector('.common-login-dlg')) {
    document.querySelector('.common-login-dlg').classList.add('common-login-dlg-show')
  }
}

/** 配置request请求时的默认参数 */
export const request = extend({
  errorHandler,
  'Cache-Control': 'no-cache',
  credentials: 'include', // 默认请求是否带上cookie
  // timeout: 1000,
});

// request请求拦截器, 改变url 或 options
request.interceptors.request.use(async (url, options) => {
  options.headers.language = localStorage.getItem('currentLocal') || navigator.language;
  curUrl = url;
  let _token = getCookie('token');
  const excludes = ['/api/login/',];
  if (excludes.includes(url)) {
    _token = '';
  } else {
    if (!_token && pathname !== 'loginPath') {
      await showLoginDlg();
      return;
    }
    const _JWT = decodeURIComponent(escape(window.atob(_token.split('.')[1])));
    const exp = JSON.parse(_JWT).exp;
    // if (url.startsWith('/api/reports/')) {
    //   _token = '';
    // }
    if (exp < new Date().getTime().toString().slice(0, 10)) {
      options.headers.Authorization = 'JWT ' + _token;
      await showLoginDlg();
      return;
    }
  }
  options.headers.Authorization = _token ? 'JWT ' + _token : '';

  return {
    url: `${url}`,
    options: { ...options },
  };
});

// request响应拦截器, 统一处理错误信息
request.interceptors.response.use(async (response, options) => {
  let { status, url, statusText = '' } = response || {};
  if (status !== 200) {
    message.destroy();
    message.warn(`请求错误${status}: ${url}, ${codeMessage[response.status] || statusText}`, 2);
    return Promise.reject('请求错误')
  }
  const data = await response.clone().json() || {};

  const origin = document.location.origin;
  const excludes = [`${origin}/api/reports/submit_check`, 'http://px.enflame.cn/api/abi/v2/table/', `${origin}/api/devices/all_class`, `${origin}/api/devices/all_location`, `${origin}/api/devices/info/find_user`, `${origin}/api/tsc/features/sync`];
  const loginDlgPage = ['/corporatePartner', '/reportManage', '/HSE-DVA'];
  let noParamsUrl = url.split('?')[0]
  const { success, code, msg } = data || {};
  if (!success && !excludes?.includes(noParamsUrl)) {
    const pagePath = window.location.pathname;
    if ([401].includes(code)) {
      // if (getCookie('token') && getCookie('refresh')) {
      //   await refreshToken();
      // } else {

      message.destroy();
      const _isDlgPage = loginDlgPage.some(item => pagePath.startsWith(item));
      if (_isDlgPage) {
        await showLoginDlg();
      } else {
        await toLoginPage();
      }

      // }
    } else if (!code && msg === 'user not found via provide token') {
      await showLoginDlg();
    } else if (!!msg) {
      message.destroy();
      message.warn(msg, 2);
    }
    return Promise.reject(msg)
  }
  return response;
});
export default request;