import '@babel/polyfill';
import dva from 'dva';
import React from 'react';
// import router from '../router';
import projectSchema, { toPaths } from './projectSchema';
import { getNamespace } from '../utils/utils';
// import ProjectSchemaTestContext from './ProjectSchemaTestContext';

const app = dva({
});
app.model(projectSchema);
app.router(() => <div />);
app.start();

// console.log(app);
// 基础测试参数
const projectId = '10';
const projectBranch = 'master';

const getProjectSchema = () => {
  const { _store: store } = app;
  const { getState } = store;
  return getState().projectSchema;
};

const dispatch = (payload) => {
  const { _store: store } = app;
  const { dispatch: originDispatch } = store;
  return originDispatch(payload);
};

/**
 * 获取一个至少存在一个api的项目
 * @param {function} callback 回调，参数是api；如果没有限定条件则是第一个api
 * @param {function} condition api需要满足的条件，可选
 */
const fetchValidApiProject = (callback, condition) => {
  const { _store: store } = app;
  const { subscribe } = store;
  const findCurrentValidApi = () => {
    const { schema } = getProjectSchema();
    if (!schema || Object.keys(schema).length === 0) { return null; }
    const paths = toPaths(schema);
    if (paths.length === 0) { return null; }
    if (!condition) { return paths[0]; }
    const [api] = paths.filter(condition);
    return api;
  };
  const haveApi = findCurrentValidApi();
  if (haveApi) {
    callback(haveApi);
    return;
  }
  let lastSchemaString = '';
  const unSubscribe = subscribe(() => {
    const { schema, loading } = getProjectSchema();
    if (loading) { return; }
    // 空的就不管了
    if (!schema || Object.keys(schema).length === 0) { return; }
    const api = findCurrentValidApi();
    const currentSchemaString = JSON.stringify(schema);
    if (api) {
      unSubscribe();
      callback(api);
    } else if (lastSchemaString !== currentSchemaString) {
      lastSchemaString = currentSchemaString;
      dispatch(app, {
        type: 'projectSchema/fetch',
        payload: {
          id: projectId,
          branch: projectBranch,
        },
      });
    }
  });
  dispatch({
    type: 'projectSchema/fetch',
    payload: {
      id: projectId,
      branch: projectBranch,
    },
  });
};

/**
 * 监事一个api的状态
 * @param {object} api定位
 * @param {function} condition 符合条件
 * @param {function} callback 完成之后的回调
 */
const subscribeApi = ({ id, method }, condition, callback) => {
  const { _store: store } = app;
  const { subscribe } = store;
  const unSubscribe = subscribe(() => {
    const { schema } = getProjectSchema();
    const [targetApi] = toPaths(schema)
      .filter(api => api.id === id && api.method === method);
    // 命中？
    if (!targetApi) { return; }
    if (condition(targetApi)) {
      unSubscribe();
      callback();
    }
  });
};

describe('普通', () => {
  test('获取某一个至少存在一个 api的 projectSchema', (done) => {
    fetchValidApiProject(() => {
      done();
    });
    // const context = new ProjectSchemaTestContext();
  }, 1000);
});

describe('关注测试', () => {
  test('开始关注', (done) => {
    // 获取一个普通api 如果未关注则关注之，如果已关注则取消关注
    fetchValidApiProject((testApi) => {
      // console.log('关注测试开始，目标:', testApi.id, ',method:', testApi.method);
      const targetWatch = !testApi.watch;
      // 监视它的状态
      subscribeApi(testApi, api => api.watch === targetWatch, () => {
        // console.log('关注测试完成，目标:', testApi.id, ',method:', testApi.method);
        done();
      });
      // 执行事件
      dispatch({
        type: targetWatch ? 'projectSchema/watchApi' : 'projectSchema/unwatchApi',
        payload: {
          id: testApi.id,
          method: testApi.method,
        },
      });
    });
  }, 1000);
});

// // 提交流程，一个是发布，首先先找到一个 editing 的 api, 走发布流程确认状态更新到 submitted
describe('提交测试', () => {
  test('提交', (done) => {
    fetchValidApiProject((testApi) => {
      // console.log('提交测试开始，目标:', testApi.id, ',method:', testApi.method);
      subscribeApi(testApi, api => api.status === 'submitted', () => {
        // console.log('提交测试完成，目标:', testApi.id, ',method:', testApi.method);
        done();
      });
      dispatch({
        type: 'projectSchema/submitApi',
        payload: {
          id: testApi.id,
          method: testApi.method,
        },
      });
    }, (api) => {
      return api.status === 'editing';
    });
  }, 1000);
});
// // 召回流程，首先找到一个在 submitted 或者 recalling ，走召回流程反复得走(10)，直到确认状态更新至 editing
describe('召回测试', () => {
  test('召回', (done) => {
    fetchValidApiProject((testApi) => {
      subscribeApi(testApi, (api) => {
        if (api.status === 'editing') { return true; }
        return false;
      }, done);
      let times = 10;
      // eslint-disable-next-line
      while (times-- > 0) {
        dispatch({
          type: 'projectSchema/unSubmitApi',
          payload: {
            id: testApi.id,
            method: testApi.method,
          },
        });
      }
    }, api => api.status === 'submitted' || api.status === 'recalling');
  }, 1000);
});

it('命名空间测试', () => {
  expect(getNamespace('a/b'))
    .toBe('a');
});
