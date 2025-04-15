import { Reducer } from 'umi';
export default {
  state: {
    topic: {},
  },
  effects: {

  },
  reducers: {
    setTOPIC(state: any, { payload = {} }): Reducer {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
