import axios from "axios";
import { message } from 'antd'
// import { openLogin } from '@/utils/common'

let baseURL = ''
const host = location.host
const local = ['127.0.0.1:8888', 'localhost:8888']
if (!local.includes(host)) {
  baseURL = location.origin
}

const codeMessage = {
  200: '服务器成功返回请求的数据',
  201: '新建或修改数据成功',
  202: '一个请求已经进入后台排队（异步任务）',
  204: '删除数据成功',
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

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
});

// 请求拦截器
axiosInstance.interceptors.request.use(function (config) {
  return config;
}, function (error) {
  return Promise.reject(error);
});

// 响应拦截器
axiosInstance.interceptors.response.use(function (response) {
  const { data } = response
  // if (!data.success) {
  //   // 代表登录异常
  //   if (data.code === -1) {
  //     // openLogin()
  //   } else {
  //     message.error(data.msg);
  //   }
  //   return Promise.reject(data.msg);
  // }
  return data;
}, function (error) {
  const { status } = error.response
  message.error(status + '：' + codeMessage[status]);
  return Promise.reject(error);
});


const request = (url, config) => {
  return axiosInstance({
    url,
    ...config
  })
}


export default request