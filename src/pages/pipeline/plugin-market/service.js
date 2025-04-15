import request from 'umi-request';

export async function atoLlist(params, options) {
  return request('/api/pipeline/atom/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export const removeApi = (atomId) => {
  return request('/api/pipeline/atom/delete/' + atomId, {
    method: 'delete',
  })
}
