import { message } from 'antd';
import { addCookie, getCookie, deleteCookie } from '@/utils';
import { history } from 'umi';
import { stringify } from 'querystring';
import debounce from 'lodash/debounce';
const isEn = (localStorage.getItem('currentLocal') || navigator.language).includes('en');

const _refreshToken = () => {
  const formData = new FormData();
  const _refresh = getCookie('refresh');
  formData.append('refresh', _refresh);
  const xml = new XMLHttpRequest();
  xml.open('post', `/api/token/refresh/`, true);
  xml.send(formData);
  xml.onreadystatechange = function (e) {
    const { readyState, status, responseText = '' } = xml;
    if (status === 401) {
      deleteCookie('token');
      deleteCookie('refresh');
      // message.destroy();
      // const txt = isEn ? 'No user information found, Please try login again.' : '没有发现用户信息，请重新登录试试';
      // message.warn(txt);

      const { query = {}, search, pathname } = history.location;
      console.log('--refresh', query, search, pathname, history.location);
      history.replace({
        pathname: '/user/login',
        search: stringify({
          redirect: pathname + search,
        }),
      });
    } else if (readyState === 4 && status === 200) {
      const res = JSON.parse(this.responseText);
      const { success, data = {}, msg } = res || {};
      if (!success) return;
      const { access = '', refresh = '' } = data || {};
      addCookie('token', access);
      addCookie('refresh', refresh);
    }
  }
}

const refreshToken = debounce(_refreshToken, 100);

export { refreshToken }