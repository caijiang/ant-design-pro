import { getProjectSchema, addApi } from '../services/projectSchema';
import { deleteProperty } from '../utils/utils';

// import { xxx } from '../services/xxx';
export default {
  namespace: 'projectSchema',
  state: {
    loading: false,
    id: null,
    branch: null,
    schema: {},
  },
  effects: {
    *addApi({ payload, callback }, { call, put, select }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const state = yield select(s => s.projectSchema);
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
        loading: action.payload,
      };
    },
    changeBranch(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    updateSchema(state, action) {
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
