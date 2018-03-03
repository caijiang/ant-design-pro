import { getProjectSchema, addApi, unwatchApi, watchApi, submitApi, unSubmitApi } from '../services/projectSchema';
import { deleteProperty, getNamespace } from '../utils/utils';

// import { xxx } from '../services/xxx';
// 定义一个APILocater接口
// 包含id,branch,pathId,method

/**
 *
 * @param {object} payload 包含id,method
 * @param {object} state projectSchema的 store
 * @returns 标准的 APILocater
 */
function payload2Locater(payload, state) {
  return {
    id: state.id,
    branch: state.branch,
    pathId: payload.id,
    method: payload.method,
  };
}
/**
 * 标准的调用流程，并且可以返回结果 (result)和locater
 * @param {function} select select
 * @param {function} call call
 * @param {object} payload 包含id,method
 * @param {function} api 标准的service方法接受 locater,参数包
 */
function* locaterInvoke(type, select, call, payload, api) {
  const state = yield select(s => s[getNamespace(type)]);
  const locater = payload2Locater(payload, state);
  const result = yield call(api, locater, deleteProperty(payload, ['id', 'method']));
  return {
    locater,
    result,
  };
}
function changeApi(state, { pathId, method }, updater) {
  if (!state.schema) { return state; }
  const currentPaths = state.schema.paths;
  if (!currentPaths) { return state; }
  // 找到那个path
  const [currentPathUri] = Object.keys(currentPaths)
    .filter(k => currentPaths[k].id === pathId);
  if (!currentPathUri) { return state; }
  const currentPath = currentPaths[currentPathUri];
  const currentApi = currentPath[method];
  if (!currentApi) { return state; }
  const newPath = {
    ...currentPath,
  };
  newPath[method] = updater(currentApi);
  const newPaths = {
    ...currentPaths,
  };
  newPaths[currentPathUri] = newPath;
  return {
    ...state,
    schema: {
      ...state.schema,
      paths: newPaths,
    },
  };
}
export default {
  namespace: 'projectSchema',
  state: {
    loading: false,
    id: null,
    branch: null,
    schema: {},
  },
  effects: {
    *submitApi(x, y) {
      const { payload, type } = x;
      const { call, put, select } = y;
      const { locater, result } = yield call(locaterInvoke, type, select, call, payload
        , submitApi);
      if (result) {
        yield put({
          type: 'changeStatus',
          payload: {
            ...locater,
            target: 'submitted',
          },
        });
      }
    },
    *unSubmitApi({ payload, type }, { call, put, select }) {
      const { locater, result } = yield call(locaterInvoke, type, select, call, payload
        , unSubmitApi);
      yield put({
        type: 'changeStatus',
        payload: {
          ...locater,
          target: result ? 'editing' : 'recalling',
        },
      });
    },
    *unwatchApi({ payload, type }, { call, put, select }) {
      const { locater, result } = yield call(locaterInvoke, type, select, call, payload
        , unwatchApi);
      if (result) {
        yield put({
          type: 'changeWatch',
          payload: {
            ...locater,
            target: false,
          },
        });
      }
    },
    *watchApi({ payload, type }, { call, put, select }) {
      const { locater, result } = yield call(locaterInvoke, type, select, call, payload, watchApi);
      if (result) {
        yield put({
          type: 'changeWatch',
          payload: {
            ...locater,
            target: true,
          },
        });
      }
    },
    *addApi({ payload, callback, type }, { call, put, select }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const state = yield select(s => s[getNamespace(type)]);
      const creation = yield call(addApi, state.id, state.branch, payload.uri, payload.method);
      yield put({
        type: 'apiCreation',
        payload: {
          ...payload,
          creation,
        },
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      if (callback) callback();
    },
    *updateFilterText({ payload }, { put }) {
      yield put({
        type: 'changeFilterText',
        payload,
      });
    },
    /**
     * 获取整个项目的schema，需包含id,branch
     */
    *fetch({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      yield put({
        type: 'changeId',
        payload: payload.id,
      });
      yield put({
        type: 'changeBranch',
        payload: payload.branch,
      });
      const schema = yield call(getProjectSchema, payload.id, payload.branch);
      yield put({
        type: 'updateSchema',
        payload: schema,
      });
    },
  },
  reducers: {
    /**
     * 同样需要可远程
     */
    changeStatus(state, action) {
      return changeApi(state, action.payload, (api) => {
        return {
          ...api,
          status: action.payload.target,
        };
      });
    },
    changeWatch(state, action) {
      return changeApi(state, action.payload, (api) => {
        return {
          ...api,
          watch: action.payload.target,
        };
      });
    },
    /**
     * 一个api被添加执行的；同样来自远程的这个操作同样可能走这个。
     */
    apiCreation(state, action) {
      // 在当前schema里添加了一个新的 api；可能是存在的path哦
      const { payload: { creation, method, uri } } = action;
      const currentPaths = state.schema.paths;
      const [existingPath] = Object.keys(currentPaths)
        .map(i => currentPaths[i])
        .filter(path => path.id === creation.id);
      let newPath;
      if (existingPath) {
        // 组装新的path
        newPath = {
          ...existingPath,
        };
      } else {
        // 若不存在 则需添加
        newPath = {
          id: creation.id,
        };
      }
      newPath[method] = creation.operation;
      const newPaths = {
        ...currentPaths,
      };
      newPaths[uri] = newPath;
      return {
        ...state,
        schema: {
          ...state.schema,
          paths: newPaths,
        },
      };
    },
    changeFilterText(state, action) {
      return {
        ...state,
        filterText: action.payload,
      };
    },
    changeId(state, action) {
      return {
        ...state,
        id: action.payload,
      };
    },
    changeBranch(state, action) {
      return {
        ...state,
        branch: action.payload,
      };
    },
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    updateSchema(state, action) {
      // console.log('schema updated', action.payload);
      return {
        ...state,
        schema: action.payload,
        loading: false,
      };
    },
  },
  // subscriptions: {
  //   setup(input) {
  //     // do nothing
  //     console.log(input);
  //   },
  // },
};

/**
 * @param {object} schema state.schema
 * @returns {Array} paths 结果
 */
export function toPaths(schema) {
  if (!schema || !schema.paths) {
    return [];
  }
  return Object.keys(schema.paths)
    // 获得所有的key 此次的key 都是uri
    .flatMap((uri) => {
      const pathInfo = schema.paths[uri];
      // 将其中的 get 等等 变成数组
      // id 我们是需要的
      return Object.keys(pathInfo).filter(n => n === 'options'
        || n === 'put'
        || n === 'get'
        || n === 'post'
        || n === 'patch'
        || n === 'delete'
        || n === 'head'
        || n === 'trace'
      ).map((method) => {
        return {
          ...deleteProperty(pathInfo, ['get', 'put', 'post', 'patch', 'delete', 'head', 'trace', 'options']),
          // 将pathInfo 里除了 method 信息
          // 以及method
          method,
          uri,
          // 以及method信息 进行合并
          ...pathInfo[method],
        };
      });
    });
}

/**
 * 把整个state给我 我帮你过滤path
 */
export const filterPath = ({ filterText }) => (path) => {
  if (!filterText || filterText.length === 0) { return true; }
  return path.uri.indexOf(filterText) !== -1 || path.summary.indexOf(filterText) !== -1;
};
