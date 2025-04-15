import { Reducer } from 'umi';
export default {
  state: {
    projects: [],
    domains: [],
  },
  effects: {

  },
  reducers: {
    setTSC(state: any, { payload = {} }): Reducer {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
