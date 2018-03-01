import fetch from 'dva/fetch';
import { notification } from 'antd';

const codeMessage = {
  200: '服务器成功返回请求的数据',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据,的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器',
  502: '网关错误',
  503: '服务不可用，服务器暂时过载或维护',
  504: '网关超时',
};
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const errortext = codeMessage[response.status] || response.statusText;
  notification.error({
    message: `请求错误 ${response.status}: ${response.url}`,
    description: errortext,
  });
  const error = new Error(errortext);
  error.name = response.status;
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };
  if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
    newOptions.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      ...newOptions.headers,
    };
    newOptions.body = JSON.stringify(newOptions.body);
  }

  return fetch(url, newOptions)
    .then(checkStatus)
    .then((response) => {
      const type = response.headers.get('Content-Type');
      if (type && type.indexOf('application/json') !== -1) {
        return response.json();
      }
      if (newOptions.method === 'DELETE' || response.status === 204) {
        return response.text();
      }
      // try {
      //   return response.json();
      // } catch (e) {
      return response;
      // }
    });
}

export function errorWithResponse(response, msg) {
  const error = new Error(msg);
  error.response = response;
  return error;
}
function onlyJson(response) {
  const type = response.headers.get('Content-Type');
  if (type && type.indexOf('application/json') !== -1) {
    return response;
  }
  throw errorWithResponse(response, `except application/json, but ${type}`);
}
function parseJSON(response) {
  return response.json();
}

/**
 * 请求一个json结果
 * @param {string} url The URL we want to request
 * @param {object} options The options we want to pass to "fetch"
 */
export function requestJson(url, options) {
  const currentHeaders = (options || {}).headers;
  return classicRequest(url, {
    ...options,
    headers: {
      ...currentHeaders,
      Accept: 'application/json',
    },
  }).then(onlyJson).then(parseJSON);
}


function uploadJsonContent(url, method, data, options) {
  const currentHeaders = (options || {}).headers;
  return classicRequest(url, {
    ...options,
    method,
    headers: {
      ...currentHeaders,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(data),
  });
}

/**
 * put data 到url
 * @param {String} url 请求的地址
 * @param {*} data 要提交的content
 * @param {*} options The options we want to pass to "fetch"
 */
export function putJson(url, data, options) {
  return uploadJsonContent(url, 'PUT', data, options);
}

/**
 * post data 到url
 * @param {String} url 请求的地址
 * @param {*} data 要提交的content
 * @param {*} options The options we want to pass to "fetch"
 */
export function postJson(url, data, options) {
  return uploadJsonContent(url, 'POST', data, options);
}

/**
 * post data 到url
 * @param {String} url 请求的地址
 * @param {*} data 要提交的content
 * @param {*} options The options we want to pass to "fetch"
 */
export function postJsonForJson(url, data, options) {
  return postJson(url, data, options).then(onlyJson).then(parseJSON);
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export function classicRequest(url, options) {
  const targetUrl = url;
  const defaultOptions = {
    credentials: 'include',
    cache: 'no-cache',
  };
  const newOptions = { ...defaultOptions, ...options };
  return fetch(targetUrl, newOptions);
}

export function normalRequest(url, options) {
  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };
  // if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
  //   newOptions.headers = {
  //     Accept: 'application/json',
  //     'Content-Type': 'application/json; charset=utf-8',
  //     ...newOptions.headers,
  //   };
  //   newOptions.body = JSON.stringify(newOptions.body);
  // }

  return fetch(url, newOptions)
    // .then(checkStatus)
    .then((response) => {
      if (newOptions.method === 'DELETE' || response.status === 204) {
        return response.text();
      }
      return response.json();
    });
}
